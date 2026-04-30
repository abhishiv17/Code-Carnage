-- Calendar Events table for personal scheduling
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    event_date DATE NOT NULL,
    event_time TEXT DEFAULT '',
    category TEXT DEFAULT 'other' CHECK (category IN ('session', 'study', 'deadline', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own events
CREATE POLICY "Users can view own calendar events"
    ON public.calendar_events FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own events
CREATE POLICY "Users can create calendar events"
    ON public.calendar_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "Users can update own calendar events"
    ON public.calendar_events FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own events
CREATE POLICY "Users can delete own calendar events"
    ON public.calendar_events FOR DELETE
    USING (auth.uid() = user_id);
