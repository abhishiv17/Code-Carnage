-- Update default credits for new users from 1 to 10
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 10;

-- Update existing users who still have the old default of 1 credit
UPDATE public.profiles SET credits = 10 WHERE credits = 1;
