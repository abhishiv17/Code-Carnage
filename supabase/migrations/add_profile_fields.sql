-- Migration: Add extended profile fields for college students
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS college_name text,
  ADD COLUMN IF NOT EXISTS degree text,
  ADD COLUMN IF NOT EXISTS branch text,
  ADD COLUMN IF NOT EXISTS year_of_study integer,
  ADD COLUMN IF NOT EXISTS graduation_year integer,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS preferred_mode text DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';

-- Add a profile_completed flag to track completion
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;
