import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

const DUMMY_COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'BITS Pilani', 'NIT Trichy', 'VIT Vellore', 
  'SRM Chennai', 'IIIT Hyderabad', 'DTU Delhi', 'RVCE Bangalore', 'PES University',
  'Jadavpur University', 'COEP Pune', 'VJTI Mumbai', 'Manipal Institute of Technology',
  'Thapar Institute', 'Nirma University', 'Amity University', 'Delhi University'
];

const DUMMY_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
  'Pilani', 'Trichy', 'Vellore', 'Ahmedabad', 'Chandigarh', 'Jaipur', 'Indore'
];

const DUMMY_DEGREES = ['B.Tech', 'B.Sc', 'BCA', 'B.E.'];
const DUMMY_BRANCHES = ['Computer Science', 'Information Technology', 'Electronics', 'Electrical', 'Mechanical'];

const DUMMY_NAMES = [
  'Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Neha', 'Karan', 'Pooja', 
  'Rohan', 'Anjali', 'Aditya', 'Shruti', 'Siddharth', 'Kavya', 'Rishabh',
  'Ishita', 'Aman', 'Tanya', 'Varun', 'Riya', 'Karthik', 'Swati', 'Tarun', 'Megha', 'Nikhil'
];

const SKILL_LIST = [
  'Python', 'JavaScript', 'React', 'Machine Learning', 'Flutter', 'C++', 'Java', 'Rust',
  'Guitar', 'Piano', 'Vocals', 'Drums', 'Music Production',
  'Spanish', 'Japanese', 'French', 'German', 'Korean',
  'Figma', 'UI/UX Design', 'Graphic Design', 'Motion Design',
  'Basketball', 'Swimming', 'Yoga', 'Martial Arts',
  'Calculus', 'Physics', 'Statistics', 'Creative Writing',
  'Photography', 'Video Editing', 'Lightroom',
  'Baking', 'Indian Cuisine', 'Italian Cuisine'
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedData() {
  console.log('🚀 Starting Data Reset & Seed...');

  // 1. Delete all existing users
  console.log('🧹 Fetching existing users...');
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;

  console.log(`🗑️ Deleting ${usersData.users.length} existing users...`);
  for (const user of usersData.users) {
    await supabase.auth.admin.deleteUser(user.id);
  }
  console.log('✅ All existing users deleted.');

  // 2. Create 25 dummy users
  console.log('👤 Creating 25 dummy users...');
  const newUsers = [];
  for (let i = 0; i < 25; i++) {
    const name = DUMMY_NAMES[i];
    const { data: userAuth, error: createError } = await supabase.auth.admin.createUser({
      email: `${name.toLowerCase()}${i}@example.com`,
      password: 'password123',
      email_confirm: true,
      user_metadata: { username: `${name.toLowerCase()}_${i}` }
    });
    
    if (createError) {
      console.error(`Error creating user ${name}:`, createError);
      continue;
    }
    newUsers.push({ id: userAuth.user.id, name });
  }

  // Wait for triggers to execute
  console.log('⏳ Waiting 5 seconds for profile creation triggers to run...');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // 3. Update profiles and insert skills
  console.log('📝 Updating profiles with realistic Indian college data & leader stats...');
  for (const user of newUsers) {
    const college = getRandomElement(DUMMY_COLLEGES);
    const city = getRandomElement(DUMMY_CITIES);
    const degree = getRandomElement(DUMMY_DEGREES);
    const branch = getRandomElement(DUMMY_BRANCHES);
    
    // Generate realistic leaderboard stats
    const credits = getRandomInt(10, 250);
    const totalSessions = Math.floor(credits * 0.8);
    const averageRating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: `${user.name} Kumar`,
        college_name: college,
        city: city,
        degree: degree,
        branch: branch,
        credits: credits,
        total_sessions: totalSessions,
        average_rating: parseFloat(averageRating),
        profile_completed: true,
        bio: `Hi, I am an engineering student at ${college} passionate about learning new skills!`,
        preferred_mode: 'both',
        languages: ['English', 'Hindi']
      })
      .eq('id', user.id);

    if (updateError) {
      console.error(`Error updating profile for ${user.id}:`, updateError);
    }

    // Insert 2-3 offered skills
    const numOffered = getRandomInt(2, 4);
    for(let j=0; j<numOffered; j++) {
      await supabase.from('skills').insert({
        user_id: user.id,
        skill_name: getRandomElement(SKILL_LIST),
        type: 'offered'
      });
    }

    // Insert 1-2 desired skills
    const numDesired = getRandomInt(1, 3);
    for(let j=0; j<numDesired; j++) {
      await supabase.from('skills').insert({
        user_id: user.id,
        skill_name: getRandomElement(SKILL_LIST),
        type: 'desired'
      });
    }
  }

  console.log('✅ 25 Dummy Users seeded successfully!');
  console.log('🌟 Leaderboard, Marketplace, and Matches are now populated.');
}

seedData().catch(console.error);
