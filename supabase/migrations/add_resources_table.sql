-- ==========================================
-- Resource Sharing Schema
-- ==========================================

CREATE TABLE public.resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  uploader_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  url text NOT NULL,
  resource_type text NOT NULL, -- 'video', 'article', 'book', 'course', 'other'
  category text NOT NULL, -- e.g. 'programming', 'music'
  tags text[] DEFAULT '{}',
  upvotes integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Resource Upvotes
CREATE TABLE public.resource_upvotes (
  resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (resource_id, user_id)
);

-- RLS Policies
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources are viewable by everyone." ON public.resources FOR SELECT USING (true);
CREATE POLICY "Users can upload resources." ON public.resources FOR INSERT WITH CHECK (auth.uid() = uploader_id);
CREATE POLICY "Uploaders can delete their own resources." ON public.resources FOR DELETE USING (auth.uid() = uploader_id);

CREATE POLICY "Resource upvotes are viewable by everyone." ON public.resource_upvotes FOR SELECT USING (true);

-- Function to handle upvoting a resource
CREATE OR REPLACE FUNCTION public.toggle_resource_upvote(p_resource_id uuid)
RETURNS integer AS $$
DECLARE
  v_user_id uuid;
  v_exists boolean;
  v_new_count integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.resource_upvotes 
    WHERE resource_id = p_resource_id AND user_id = v_user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.resource_upvotes WHERE resource_id = p_resource_id AND user_id = v_user_id;
    UPDATE public.resources SET upvotes = upvotes - 1 WHERE id = p_resource_id RETURNING upvotes INTO v_new_count;
  ELSE
    INSERT INTO public.resource_upvotes (resource_id, user_id) VALUES (p_resource_id, v_user_id);
    UPDATE public.resources SET upvotes = upvotes + 1 WHERE id = p_resource_id RETURNING upvotes INTO v_new_count;
  END IF;

  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed some mock resources
DO $$ 
DECLARE
  v_user_1 uuid;
BEGIN
  SELECT id INTO v_user_1 FROM public.profiles ORDER BY created_at LIMIT 1;

  IF v_user_1 IS NOT NULL THEN
    INSERT INTO public.resources (uploader_id, title, description, url, resource_type, category, tags, upvotes)
    VALUES 
    (v_user_1, 'React Design Patterns', 'A comprehensive guide to modern React design patterns.', 'https://reactpatterns.com', 'article', 'programming', ARRAY['react', 'frontend'], 15),
    (v_user_1, 'Complete Node.js Guide', 'Master Node.js with this full course.', 'https://youtube.com/nodejs-course', 'video', 'programming', ARRAY['nodejs', 'backend'], 25),
    (v_user_1, 'Piano Basics for Beginners', 'Learn the first 10 chords on piano.', 'https://piano.com/basics', 'course', 'music', ARRAY['piano', 'music'], 8);
  END IF;
END $$;
