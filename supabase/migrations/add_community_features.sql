-- 1. Rich User Portfolios
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS about_me TEXT;

-- 2. Endorsements Table (Gamification)
CREATE TABLE IF NOT EXISTS public.endorsements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endorser_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    endorsed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(endorser_id, endorsed_id, skill_name) -- Can only endorse a specific skill once per user
);

-- 3. User Badges Table (Gamification)
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_name)
);

-- 4. Help Requests Table (Campus Feed)
CREATE TABLE IF NOT EXISTS public.help_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    credits_offered INTEGER DEFAULT 1,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Persistent AI Chat History
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add read_at to messages for read receipts (if messages table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'messages') THEN
        ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Endorsements: Anyone can read, only authenticated can create, users can delete their own
CREATE POLICY "Anyone can view endorsements" ON public.endorsements FOR SELECT USING (true);
CREATE POLICY "Users can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_id);
CREATE POLICY "Users can delete their endorsements" ON public.endorsements FOR DELETE USING (auth.uid() = endorser_id);

-- Badges: Anyone can read, only service role can create (or trigger)
CREATE POLICY "Anyone can view badges" ON public.user_badges FOR SELECT USING (true);

-- Help Requests: Anyone can read, users manage their own
CREATE POLICY "Anyone can view help requests" ON public.help_requests FOR SELECT USING (true);
CREATE POLICY "Users can create help requests" ON public.help_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own help requests" ON public.help_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own help requests" ON public.help_requests FOR DELETE USING (auth.uid() = user_id);

-- AI Chat: Users can only see and manage their own chats
CREATE POLICY "Users can view own ai chats" ON public.ai_chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai chats" ON public.ai_chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai chats" ON public.ai_chat_history FOR DELETE USING (auth.uid() = user_id);
