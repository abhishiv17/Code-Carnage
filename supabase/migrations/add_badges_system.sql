-- ==========================================
-- Badges & Milestones System
-- ==========================================

-- Badge definitions table
CREATE TABLE public.badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,         -- emoji or lucide icon name
  category text NOT NULL,     -- 'sessions', 'rating', 'community', 'profile'
  criteria_type text NOT NULL, -- 'sessions_completed', 'avg_rating', 'help_given', 'profile_complete', 'reviews_given', 'skills_taught'
  criteria_value integer NOT NULL DEFAULT 1,
  rarity text NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at timestamptz DEFAULT now()
);

-- User badges junction table
CREATE TABLE public.user_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id text REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by everyone." ON public.badges FOR SELECT USING (true);

-- User badges are viewable by everyone, insertable by the system
CREATE POLICY "User badges are viewable by everyone." ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can insert own badges." ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- Seed badge definitions
-- ==========================================
INSERT INTO public.badges (id, name, description, icon, category, criteria_type, criteria_value, rarity) VALUES
  ('first-steps',     'First Steps',     'Complete your onboarding',           '🌱', 'profile',   'profile_complete',    1, 'common'),
  ('first-session',   'First Session',   'Complete your first session',        '🎓', 'sessions',  'sessions_completed',  1, 'common'),
  ('on-fire',         'On Fire',         'Complete 5 sessions',                '🔥', 'sessions',  'sessions_completed',  5, 'rare'),
  ('veteran',         'Veteran',         'Complete 20 sessions',               '👑', 'sessions',  'sessions_completed', 20, 'epic'),
  ('centurion',       'Centurion',       'Complete 50 sessions',               '💯', 'sessions',  'sessions_completed', 50, 'legendary'),
  ('top-rated',       'Top Rated',       'Achieve an average rating of 4.5+',  '⭐', 'rating',    'avg_rating',          5, 'epic'),
  ('five-star',       'Five Star',       'Receive a perfect 5-star review',    '🌟', 'rating',    'avg_rating',          5, 'rare'),
  ('helper',          'Campus Helper',   'Help 3 campus feed requests',        '💎', 'community', 'help_given',          3, 'rare'),
  ('super-helper',    'Super Helper',    'Help 10 campus feed requests',       '🦸', 'community', 'help_given',         10, 'epic'),
  ('reviewer',        'Thoughtful',      'Write 5 reviews for peers',          '📝', 'community', 'reviews_given',       5, 'common'),
  ('mentor',          'Mentor',          'Teach 3 different skills',           '🎯', 'sessions',  'skills_taught',       3, 'rare'),
  ('polyglot',        'Polyglot',        'Teach 5 different skills',           '🧠', 'sessions',  'skills_taught',       5, 'epic'),
  ('credit-king',     'Credit King',     'Earn 25 credits',                    '💰', 'sessions',  'credits_earned',     25, 'rare'),
  ('wealthy',         'Wealthy',         'Earn 100 credits',                   '🏦', 'sessions',  'credits_earned',    100, 'legendary');

-- ==========================================
-- Function to check and award badges
-- ==========================================
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_sessions integer;
  v_rating numeric;
  v_credits integer;
  v_reviews integer;
  v_skills_taught integer;
  v_help_given integer;
  v_profile_done boolean;
  v_badge RECORD;
  v_met boolean;
BEGIN
  -- Gather user stats
  SELECT total_sessions, average_rating, credits, profile_completed
    INTO v_sessions, v_rating, v_credits, v_profile_done
    FROM public.profiles WHERE id = p_user_id;

  SELECT count(*) INTO v_reviews
    FROM public.reviews WHERE reviewer_id = p_user_id;

  SELECT count(DISTINCT skill_name) INTO v_skills_taught
    FROM public.skills WHERE user_id = p_user_id AND type = 'offered';

  -- Count help_requests where this user helped (sessions they initiated as teacher from feed)
  SELECT count(*) INTO v_help_given
    FROM public.sessions WHERE teacher_id = p_user_id AND status = 'completed';

  -- Check each badge
  FOR v_badge IN SELECT * FROM public.badges LOOP
    -- Skip if user already has this badge
    IF EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = p_user_id AND badge_id = v_badge.id) THEN
      CONTINUE;
    END IF;

    v_met := false;

    CASE v_badge.criteria_type
      WHEN 'sessions_completed' THEN v_met := v_sessions >= v_badge.criteria_value;
      WHEN 'avg_rating' THEN v_met := v_rating >= 4.5 AND v_sessions >= 3;
      WHEN 'credits_earned' THEN v_met := v_credits >= v_badge.criteria_value;
      WHEN 'reviews_given' THEN v_met := v_reviews >= v_badge.criteria_value;
      WHEN 'skills_taught' THEN v_met := v_skills_taught >= v_badge.criteria_value;
      WHEN 'help_given' THEN v_met := v_help_given >= v_badge.criteria_value;
      WHEN 'profile_complete' THEN v_met := v_profile_done = true;
      ELSE v_met := false;
    END CASE;

    IF v_met THEN
      INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
