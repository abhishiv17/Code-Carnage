-- Create connections table for follow requests
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(requester_id, receiver_id)
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own connections"
    ON public.connections
    FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create a connection request"
    ON public.connections
    FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update connection status if they are the receiver"
    ON public.connections
    FOR UPDATE
    USING (auth.uid() = receiver_id OR auth.uid() = requester_id);

CREATE POLICY "Users can delete their connections"
    ON public.connections
    FOR DELETE
    USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for connections
DROP TRIGGER IF EXISTS update_connections_updated_at ON public.connections;
CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON public.connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
