-- Seed the Campus Help Board with realistic dummy queries
-- This script picks the first 6 users from the profiles table and assigns them help requests.
-- Run this ONCE in the Supabase SQL Editor to populate the feed for the demo.

DO $$
DECLARE
  user_ids UUID[];
BEGIN
  -- Grab up to 6 real user IDs from profiles
  SELECT ARRAY(
    SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 6
  ) INTO user_ids;

  -- Only proceed if we have at least 1 user
  IF array_length(user_ids, 1) IS NULL THEN
    RAISE NOTICE 'No users found in profiles table. Skipping seed.';
    RETURN;
  END IF;

  -- Insert 8 diverse help requests
  INSERT INTO public.help_requests (user_id, title, description, credits_offered, status, created_at) VALUES

  -- User 1
  (user_ids[1],
   '🚨 Urgent: React useState not re-rendering my component',
   'I have a counter component but clicking the button doesn''t update the UI even though console.log shows the value changing. I think it might be a stale closure issue. Can anyone hop on a quick call and walk me through it?',
   3, 'open', NOW() - INTERVAL '12 minutes'),

  -- User 2 (or fallback to 1)
  (COALESCE(user_ids[2], user_ids[1]),
   'Need help setting up PostgreSQL triggers for my DBMS project',
   'I''m working on a Library Management System for my DBMS assignment. I need to create a trigger that automatically updates the available_copies count when a book is issued. Would really appreciate a 15-min walkthrough!',
   2, 'open', NOW() - INTERVAL '45 minutes'),

  -- User 3 (or fallback)
  (COALESCE(user_ids[3], user_ids[1]),
   'Can someone explain Dijkstra''s Algorithm with a real example?',
   'I understand BFS and DFS but Dijkstra''s with the priority queue is confusing me. My DSA exam is tomorrow and I just need someone to explain it once with a simple weighted graph. Will pay 5 credits!',
   5, 'open', NOW() - INTERVAL '1 hour 20 minutes'),

  -- User 4 (or fallback)
  (COALESCE(user_ids[4], user_ids[1]),
   'Looking for a Python buddy to practice LeetCode together',
   'I''m preparing for placement season and solving medium-level LeetCode problems. Looking for someone who also uses Python so we can do 1-2 problems together daily on a call. Sliding window & two pointer topics preferred.',
   1, 'open', NOW() - INTERVAL '2 hours'),

  -- User 5 (or fallback)
  (COALESCE(user_ids[5], user_ids[1]),
   'Help needed: Figma to HTML/CSS conversion',
   'I have a Figma design for my college fest website but I''m struggling to convert the glassmorphism cards and gradient backgrounds into actual CSS. If you''re good with CSS/Tailwind, please help! Should take ~30 mins.',
   3, 'open', NOW() - INTERVAL '3 hours'),

  -- User 6 (or fallback)
  (COALESCE(user_ids[6], user_ids[1]),
   'Git merge conflicts destroying my project 😭',
   'Our team of 4 is working on a hackathon project and every time I pull from main I get massive merge conflicts in package-lock.json and our components folder. Need someone experienced with Git to help me resolve them cleanly.',
   2, 'open', NOW() - INTERVAL '4 hours'),

  -- User 1 again (different topic)
  (user_ids[1],
   'Anyone know how to deploy a Flask API on Render for free?',
   'I built a simple ML model (sentiment analysis) with Flask and need to deploy it so my frontend can call it. Heroku is paid now. I heard Render has a free tier but I keep getting build errors. Quick help would save my day!',
   2, 'open', NOW() - INTERVAL '5 hours'),

  -- User 2 again (or fallback)
  (COALESCE(user_ids[2], user_ids[1]),
   'Teach me the basics of Docker in 20 minutes',
   'I keep hearing about Docker and containers in every interview but I''ve never used it. I just need someone to explain what a Dockerfile, image, and container is, and show me how to dockerize a simple Node.js app. Will be super grateful!',
   4, 'open', NOW() - INTERVAL '6 hours')

  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Campus feed seeded with 8 help requests!';
END $$;
