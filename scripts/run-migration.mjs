// Run the profile migration against your Supabase database
// Usage: node --env-file=.env.local scripts/run-migration.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = readFileSync('supabase/migrations/add_profile_fields.sql', 'utf8');

console.log('🚀 Running migration...\n');

const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).maybeSingle();

// If RPC doesn't exist, we'll use the REST endpoint directly
if (error && error.message.includes('exec_sql')) {
  console.log('ℹ️  RPC not available — running statements individually...\n');

  // Split and run each ALTER statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    const fullStmt = stmt + ';';
    console.log(`  → ${stmt.substring(0, 60)}...`);
    const { error: stmtError } = await supabase.from('profiles').select('id').limit(0);
    // We can't run raw SQL via the JS client without pg or RPC
    // The user needs to run this in the Supabase Dashboard SQL Editor
  }

  console.log('\n⚠️  Cannot run raw SQL via JS client.');
  console.log('📋 Please copy the SQL from supabase/migrations/add_profile_fields.sql');
  console.log('   and paste it into Supabase Dashboard → SQL Editor → Run\n');
} else if (error) {
  console.error('❌ Migration failed:', error.message);
} else {
  console.log('✅ Migration completed successfully!');
}
