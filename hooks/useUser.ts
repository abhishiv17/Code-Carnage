'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User } from '@supabase/supabase-js';

let cachedAuthUser: User | null | undefined;
let authUserRequest: Promise<User | null> | null = null;

async function getSharedAuthUser(supabase: SupabaseClient): Promise<User | null> {
  if (cachedAuthUser !== undefined) {
    return cachedAuthUser;
  }

  if (!authUserRequest) {
    authUserRequest = supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        cachedAuthUser = data.session?.user ?? null;
        return cachedAuthUser;
      })
      .catch((error) => {
        authUserRequest = null;
        throw error;
      });
  }

  return authUserRequest;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  phone: string | null;
  gender: string | null;
  age: number | null;
  college_name: string | null;
  degree: string | null;
  branch: string | null;
  year_of_study: number | null;
  graduation_year: number | null;
  city: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  preferred_mode: string | null;
  languages: string[] | null;
  profile_completed: boolean;
  credits: number;
  average_rating: number;
  created_at: string;
}

export interface UserSkill {
  id: string;
  skill_name: string;
  type: 'offered' | 'desired';
}

interface UseUserReturn {
  user: User | null;
  profile: UserProfile | null;
  skills: UserSkill[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async (userId: string) => {
    const [{ data: profileData }, { data: skillsData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('skills').select('*').eq('user_id', userId),
    ]);

    if (profileData) setProfile(profileData as UserProfile);
    if (skillsData) setSkills(skillsData as UserSkill[]);
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    const init = async () => {
      try {
        const authUser = await getSharedAuthUser(supabase);

        if (authUser) {
          setUser(authUser);
          await fetchProfile(authUser.id);
        }
      } catch (err) {
        console.error("Failed to initialize user:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          cachedAuthUser = session?.user ?? null;
          authUserRequest = null;
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setSkills([]);
          }
        } catch (err) {
          console.error("Auth state change error:", err);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSkills([]);
  }, [supabase]);

  return { user, profile, skills, loading, signOut, refreshProfile };
}
