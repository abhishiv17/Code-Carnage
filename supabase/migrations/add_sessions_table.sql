-- Migration: Create sessions table for skill-swap WebRTC sessions
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create the sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  ended_at TIMESTAMPTZ,
  CONSTRAINT different_users CHECK (teacher_id != learner_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Users can see sessions where they are teacher or learner
CREATE POLICY "Users can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- Authenticated users can create sessions (as learner)
CREATE POLICY "Users can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = learner_id OR auth.uid() = teacher_id);

-- Participants can update session status
CREATE POLICY "Participants can update sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- Participants can delete sessions (cancel)
CREATE POLICY "Participants can delete sessions"
  ON public.sessions FOR DELETE
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- 4. Enable Realtime for sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_teacher_id ON public.sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_learner_id ON public.sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
