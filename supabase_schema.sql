-- 1. Create Profiles Table (Linked to Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  bio text,
  phone text,
  gender text,
  age integer,
  college_name text,
  degree text,
  branch text,
  year_of_study integer,
  graduation_year integer,
  city text,
  github_url text,
  linkedin_url text,
  preferred_mode text default 'both',
  languages text[] default '{}',
  profile_completed boolean default false,
  credits integer default 5 not null,
  average_rating numeric(3,2) default 0.0,
  total_sessions integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Trigger to create a profile automatically when a user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create Skills Table
create type skill_type as enum ('offered', 'desired');

create table public.skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  skill_name text not null,
  type skill_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.skills enable row level security;
create policy "Skills are viewable by everyone." on skills for select using (true);
create policy "Users can insert own skills." on skills for insert with check (auth.uid() = user_id);
create policy "Users can update own skills." on skills for update using (auth.uid() = user_id);
create policy "Users can delete own skills." on skills for delete using (auth.uid() = user_id);

-- 3. Create Sessions Table
create type session_status as enum ('pending', 'active', 'completed', 'cancelled');

create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) not null,
  learner_id uuid references public.profiles(id) not null,
  status session_status default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone
);
alter table public.sessions enable row level security;
create policy "Users can view their own sessions." on sessions for select using (auth.uid() = teacher_id or auth.uid() = learner_id);
create policy "Learners can insert sessions." on sessions for insert with check (auth.uid() = learner_id);
create policy "Participants can update sessions." on sessions for update using (auth.uid() = teacher_id or auth.uid() = learner_id);

-- 4. Create Reviews Table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) not null,
  reviewer_id uuid references public.profiles(id) not null,
  reviewee_id uuid references public.profiles(id) not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.reviews enable row level security;
create policy "Reviews are viewable by everyone." on reviews for select using (true);
create policy "Users can insert reviews." on reviews for insert with check (auth.uid() = reviewer_id);

-- Function to automatically update average_rating on profile when a new review is added
create function public.update_average_rating()
returns trigger as $$
begin
  update public.profiles
  set average_rating = (
    select round(avg(rating)::numeric, 2)
    from public.reviews
    where reviewee_id = new.reviewee_id
  )
  where id = new.reviewee_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.update_average_rating();

-- 5. Indexes for Performance
create index idx_profiles_username on public.profiles(username);
create index idx_skills_user_id on public.skills(user_id);
create index idx_skills_name on public.skills(skill_name);
create index idx_sessions_teacher_id on public.sessions(teacher_id);
create index idx_sessions_learner_id on public.sessions(learner_id);
create index idx_sessions_status on public.sessions(status);
create index idx_reviews_session_id on public.reviews(session_id);
create index idx_reviews_reviewee_id on public.reviews(reviewee_id);

-- 6. Additional Security & Helper Functions
-- Function to handle credit exchange (can be expanded later)
create function public.exchange_credits(session_id uuid)
returns void as $$
declare
  s_teacher_id uuid;
  s_learner_id uuid;
begin
  select teacher_id, learner_id into s_teacher_id, s_learner_id 
  from public.sessions where id = session_id;

  update public.profiles set credits = credits + 1 where id = s_teacher_id;
  update public.profiles set credits = credits - 1 where id = s_learner_id;
end;
$$ language plpgsql security definer;

-- 7. Matching Logic
-- Function to find potential matches for a user
-- Returns users who have skills this user wants, and want skills this user has.
create or replace function public.find_matches(p_user_id uuid)
returns table (
  profile_id uuid,
  username text,
  full_name text,
  avatar_url text,
  offered_skill text,
  desired_skill text,
  match_score float
) as $$
begin
  return query
  with user_desired as (
    select skill_name from public.skills where user_id = p_user_id and type = 'desired'
  ),
  user_offered as (
    select skill_name from public.skills where user_id = p_user_id and type = 'offered'
  )
  select 
    p.id as profile_id,
    p.username,
    p.full_name,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.username as avatar_url,
    s_offered.skill_name as offered_skill,
    s_desired.skill_name as desired_skill,
    1.0 as match_score -- Simplified scoring
  from public.profiles p
  join public.skills s_offered on p.id = s_offered.user_id and s_offered.type = 'offered'
  join public.skills s_desired on p.id = s_desired.user_id and s_desired.type = 'desired'
  where p.id != p_user_id
  and s_offered.skill_name in (select skill_name from user_desired)
  and s_desired.skill_name in (select skill_name from user_offered);
end;
$$ language plpgsql security definer;
