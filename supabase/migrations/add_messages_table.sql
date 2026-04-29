-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    attachment_url TEXT,
    attachment_type TEXT, -- 'image', 'pdf', 'audio', etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Users can read their own messages"
    ON public.messages
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message_attachments', 'message_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for message_attachments
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'message_attachments' );

CREATE POLICY "Authenticated users can upload attachments"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'message_attachments' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update own attachments"
    ON storage.objects FOR UPDATE
    USING ( auth.uid() = owner )
    WITH CHECK ( bucket_id = 'message_attachments' );

CREATE POLICY "Users can delete own attachments"
    ON storage.objects FOR DELETE
    USING ( auth.uid() = owner AND bucket_id = 'message_attachments' );
