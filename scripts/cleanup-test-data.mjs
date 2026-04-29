// Cleanup script — delete all test entries from the database
// Run with: node scripts/cleanup-test-data.mjs

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanup() {
  console.log('🧹 Starting cleanup of test data...\n');

  // 1. Delete all reviews
  const { data: reviews, error: revErr } = await supabase.from('reviews').select('id');
  if (reviews?.length) {
    const { error } = await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`✅ Deleted ${reviews.length} reviews ${error ? '❌ ' + error.message : ''}`);
  } else {
    console.log('⏭️  No reviews to delete');
  }

  // 2. Delete all sessions
  const { data: sessions } = await supabase.from('sessions').select('id');
  if (sessions?.length) {
    const { error } = await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`✅ Deleted ${sessions.length} sessions ${error ? '❌ ' + error.message : ''}`);
  } else {
    console.log('⏭️  No sessions to delete');
  }

  // 3. Delete all skills
  const { data: skills } = await supabase.from('skills').select('id');
  if (skills?.length) {
    const { error } = await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`✅ Deleted ${skills.length} skills ${error ? '❌ ' + error.message : ''}`);
  } else {
    console.log('⏭️  No skills to delete');
  }

  // 4. Delete all profiles
  const { data: profiles } = await supabase.from('profiles').select('id');
  if (profiles?.length) {
    const { error } = await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`✅ Deleted ${profiles.length} profiles ${error ? '❌ ' + error.message : ''}`);
  } else {
    console.log('⏭️  No profiles to delete');
  }

  // 5. Delete all test users from auth.users
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('❌ Failed to list users:', listErr.message);
  } else if (users?.length) {
    let deleted = 0;
    for (const user of users) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (!error) deleted++;
      else console.error(`  ❌ Failed to delete ${user.email}: ${error.message}`);
    }
    console.log(`✅ Deleted ${deleted}/${users.length} auth users`);
  } else {
    console.log('⏭️  No auth users to delete');
  }

  console.log('\n🎉 Cleanup complete! Database is fresh.');
}

cleanup().catch(console.error);
