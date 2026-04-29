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
  credits integer default 10 not null,
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
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
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
