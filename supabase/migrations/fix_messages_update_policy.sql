-- Add missing columns to messages table (safe: IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Add UPDATE policy so users can mark messages as read
-- Drop first in case it already exists
DROP POLICY IF EXISTS "Users can update messages they received" ON public.messages;
CREATE POLICY "Users can update messages they received"
    ON public.messages
    FOR UPDATE
    USING (auth.uid() = receiver_id);

-- Enable Realtime on messages and connections tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
