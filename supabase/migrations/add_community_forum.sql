-- ==========================================
-- Community Forum Schema
-- ==========================================

-- 1. Forum Posts Table
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general', -- 'general', 'help', 'showcase', 'discussion'
  tags text[] DEFAULT '{}',
  upvotes integer DEFAULT 0 NOT NULL,
  view_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Forum Comments Table
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_solution boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Forum Upvotes (Junction table to prevent duplicate upvotes)
CREATE TABLE IF NOT EXISTS public.forum_upvotes (
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

-- Function to handle upvoting a post (increments count automatically)
CREATE OR REPLACE FUNCTION public.toggle_forum_upvote(p_post_id uuid)
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

  -- Check if upvote exists
  SELECT EXISTS(
    SELECT 1 FROM public.forum_upvotes 
    WHERE post_id = p_post_id AND user_id = v_user_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Remove upvote
    DELETE FROM public.forum_upvotes WHERE post_id = p_post_id AND user_id = v_user_id;
    UPDATE public.forum_posts SET upvotes = upvotes - 1 WHERE id = p_post_id RETURNING upvotes INTO v_new_count;
  ELSE
    -- Add upvote
    INSERT INTO public.forum_upvotes (post_id, user_id) VALUES (p_post_id, v_user_id);
    UPDATE public.forum_posts SET upvotes = upvotes + 1 WHERE id = p_post_id RETURNING upvotes INTO v_new_count;
  END IF;

  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to safely increment view count
CREATE OR REPLACE FUNCTION public.increment_forum_view(p_post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.forum_posts SET view_count = view_count + 1 WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RLS Policies
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_upvotes ENABLE ROW LEVEL SECURITY;

-- Posts
DROP POLICY IF EXISTS "Forum posts are viewable by everyone." ON public.forum_posts;
CREATE POLICY "Forum posts are viewable by everyone." ON public.forum_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create forum posts." ON public.forum_posts;
CREATE POLICY "Users can create forum posts." ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Authors can update their own posts." ON public.forum_posts;
CREATE POLICY "Authors can update their own posts." ON public.forum_posts FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Authors can delete their own posts." ON public.forum_posts;
CREATE POLICY "Authors can delete their own posts." ON public.forum_posts FOR DELETE USING (auth.uid() = author_id);

-- Comments
DROP POLICY IF EXISTS "Forum comments are viewable by everyone." ON public.forum_comments;
CREATE POLICY "Forum comments are viewable by everyone." ON public.forum_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create comments." ON public.forum_comments;
CREATE POLICY "Users can create comments." ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Authors can update their own comments." ON public.forum_comments;
CREATE POLICY "Authors can update their own comments." ON public.forum_comments FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Authors can delete their own comments." ON public.forum_comments;
CREATE POLICY "Authors can delete their own comments." ON public.forum_comments FOR DELETE USING (auth.uid() = author_id);

-- Upvotes (Selectable by everyone, insert/delete handled by stored procedure above)
DROP POLICY IF EXISTS "Upvotes are viewable by everyone." ON public.forum_upvotes;
CREATE POLICY "Upvotes are viewable by everyone." ON public.forum_upvotes FOR SELECT USING (true);

-- Mock Data for Forum
DO $$ 
DECLARE
  v_user_1 uuid;
  v_user_2 uuid;
  v_post_1 uuid;
  v_post_2 uuid;
BEGIN
  -- Get two distinct users if they exist
  SELECT id INTO v_user_1 FROM public.profiles ORDER BY created_at LIMIT 1;
  SELECT id INTO v_user_2 FROM public.profiles WHERE id != v_user_1 ORDER BY created_at LIMIT 1;

  IF v_user_1 IS NOT NULL THEN
    -- Insert a post
    INSERT INTO public.forum_posts (author_id, title, content, category, tags, upvotes, view_count)
    VALUES (
      v_user_1, 
      'How to best prepare for a frontend interview?', 
      'I have an interview coming up for a React developer role. Does anyone have any good resources or tips for preparing? Specifically around system design for frontend.',
      'discussion',
      ARRAY['react', 'interview', 'frontend'],
      5,
      120
    ) RETURNING id INTO v_post_1;

    -- Add a comment from user 2 if they exist
    IF v_user_2 IS NOT NULL THEN
      INSERT INTO public.forum_comments (post_id, author_id, content, is_solution)
      VALUES (
        v_post_1,
        v_user_2,
        'I highly recommend checking out "FrontendExpert" or reading through the React docs thoroughly. Make sure you understand hooks deeply (useEffect closures, useMemo, etc).',
        true
      );
    END IF;

    -- Insert another post
    INSERT INTO public.forum_posts (author_id, title, content, category, tags, upvotes, view_count)
    VALUES (
      v_user_2, 
      'Need help debugging a strange memory leak in Node.js', 
      'My express application crashes every 24 hours with a JavaScript heap out of memory error. I am suspecting my WebSocket connections aren''t closing properly. How do you guys profile Node apps in production?',
      'help',
      ARRAY['nodejs', 'debugging', 'backend'],
      12,
      345
    ) RETURNING id INTO v_post_2;
  END IF;
END $$;
