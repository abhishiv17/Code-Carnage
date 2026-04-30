const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to avoid needing dotenv package
const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const realisticProfiles = [
  { full_name: 'Priya Sharma', college_name: 'MIT Manipal', city: 'Manipal', credits: 45, total_sessions: 32, average_rating: 4.9 },
  { full_name: 'Arjun Reddy', college_name: 'BITS Pilani', city: 'Pilani', credits: 38, total_sessions: 27, average_rating: 4.8 },
  { full_name: 'Sarah Chen', college_name: 'Stanford University', city: 'Stanford', credits: 52, total_sessions: 41, average_rating: 5.0 },
  { full_name: 'Michael Chang', college_name: 'UC Berkeley', city: 'Berkeley', credits: 21, total_sessions: 15, average_rating: 4.7 },
  { full_name: 'Aisha Patel', college_name: 'IIT Bombay', city: 'Mumbai', credits: 65, total_sessions: 50, average_rating: 4.9 },
];

async function seedDatabase() {
  console.log("🌱 Starting Database Cleanup & Seeding...");

  // 1. Get all profiles
  const { data: profiles, error: fetchErr } = await supabase.from('profiles').select('id, username');
  
  if (fetchErr) {
    console.error("Failed to fetch profiles:", fetchErr);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log("No profiles found. You need to create at least a few accounts first.");
    return;
  }

  console.log(`Found ${profiles.length} profiles. Updating them into seed data...`);

  // 2. Update profiles to make them look realistic
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    
    // Pick a realistic profile template (cycle if more users than templates)
    const template = realisticProfiles[i % realisticProfiles.length];
    
    // If the username looks like gibberish or test, update it too
    let newUsername = profile.username || '';
    if (newUsername.includes('test') || newUsername.includes('asd') || newUsername.length < 4) {
       newUsername = template.full_name.toLowerCase().replace(' ', '_') + Math.floor(Math.random() * 100);
    }

    const { error: updateErr } = await supabase.from('profiles').update({
      username: newUsername,
      full_name: template.full_name,
      college_name: template.college_name,
      city: template.city,
      credits: template.credits,
      total_sessions: template.total_sessions,
      average_rating: template.average_rating,
    }).eq('id', profile.id);

    if (updateErr) {
      console.error(`Failed to update ${profile.id}:`, updateErr);
    } else {
      console.log(`✅ Updated ${newUsername} (${template.full_name}) - ${template.credits} credits, ${template.total_sessions} sessions`);
    }
  }

  // 3. Clear old test sessions and messages so feed and history is clean
  // (Optional: we can leave them if they look okay, but clearing might be safer)
  console.log("🧹 Clearing old test sessions and messages...");
  
  // We'll delete sessions where status is 'pending' just to clear the queue
  // Or we can delete all messages to have a clean slate.
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('sessions').delete().eq('status', 'pending');
  await supabase.from('connections').delete().eq('status', 'pending');

  console.log("✨ Seeding Complete! Your Leaderboard should now look amazing.");
}

seedDatabase();
