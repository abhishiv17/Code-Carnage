// ─── Types ──────────────────────────────────────────────
export interface MockUser {
  id: string;
  name: string;
  avatar: string;
  college: string;
  year: string;
  bio: string;
  skillsHave: string[];
  skillsWant: string[];
  credits: number;
  sessionsCompleted: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  joinedAt: string;
}

export interface MockMatch {
  id: string;
  user: MockUser;
  matchedSkillOffer: string;
  matchedSkillWant: string;
  matchScore: number;
  status: 'pending' | 'accepted' | 'declined';
}

export interface MockSession {
  id: string;
  teacher: MockUser;
  learner: MockUser;
  skill: string;
  scheduledAt: string;
  duration: number; // minutes
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  creditsExchanged: number;
}

export interface MockReview {
  id: string;
  fromUser: MockUser;
  toUser: MockUser;
  sessionId: string;
  skill: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  user: MockUser;
  skillOffered: string;
  skillWanted: string;
  description: string;
  creditsPerHour: number;
  availability: string;
  tags: string[];
}

// ─── Avatars (DiceBear) ─────────────────────────────────
const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

// ─── Mock Users ─────────────────────────────────────────
export const CURRENT_USER: MockUser = {
  id: 'u-self',
  name: 'Arjun Raghavan',
  avatar: avatar('Arjun'),
  college: 'VIT Chennai',
  year: '3rd Year B.Tech CSE',
  bio: 'Full-stack dev who wants to learn guitar on the side 🎸',
  skillsHave: ['Python', 'React', 'JavaScript', 'Machine Learning'],
  skillsWant: ['Guitar', 'UI/UX Design', 'Photography'],
  credits: 42,
  sessionsCompleted: 15,
  rating: 4.8,
  reviewCount: 12,
  isVerified: true,
  joinedAt: '2025-08-15',
};

export const MOCK_USERS: MockUser[] = [
  {
    id: 'u-1',
    name: 'Priya Sharma',
    avatar: avatar('Priya'),
    college: 'VIT Chennai',
    year: '2nd Year B.Tech ECE',
    bio: 'Guitarist for 5 years, wants to learn Python for data science',
    skillsHave: ['Guitar', 'Piano', 'Music Production'],
    skillsWant: ['Python', 'Machine Learning', 'Statistics'],
    credits: 38,
    sessionsCompleted: 22,
    rating: 4.9,
    reviewCount: 18,
    isVerified: true,
    joinedAt: '2025-09-02',
  },
  {
    id: 'u-2',
    name: 'Rahul Menon',
    avatar: avatar('Rahul'),
    college: 'VIT Chennai',
    year: '4th Year B.Des',
    bio: 'UI/UX designer at heart, looking to pick up React',
    skillsHave: ['Figma', 'UI/UX Design', 'Graphic Design', 'Motion Design'],
    skillsWant: ['React', 'JavaScript', 'Flutter'],
    credits: 55,
    sessionsCompleted: 30,
    rating: 4.7,
    reviewCount: 25,
    isVerified: true,
    joinedAt: '2025-07-20',
  },
  {
    id: 'u-3',
    name: 'Ananya Iyer',
    avatar: avatar('Ananya'),
    college: 'VIT Chennai',
    year: '1st Year M.Sc Physics',
    bio: 'Physicist turned photographer. Will trade calculus help for cooking tips!',
    skillsHave: ['Photography', 'Lightroom', 'Physics', 'Calculus'],
    skillsWant: ['Indian Cuisine', 'Italian Cuisine', 'Baking'],
    credits: 20,
    sessionsCompleted: 8,
    rating: 4.6,
    reviewCount: 6,
    isVerified: false,
    joinedAt: '2026-01-10',
  },
  {
    id: 'u-4',
    name: 'Karthik Nair',
    avatar: avatar('Karthik'),
    college: 'VIT Chennai',
    year: '3rd Year B.Tech IT',
    bio: 'Competitive coder & basketball player 🏀',
    skillsHave: ['C++', 'Java', 'Basketball', 'Swimming'],
    skillsWant: ['Guitar', 'Spanish', 'Video Editing'],
    credits: 31,
    sessionsCompleted: 12,
    rating: 4.5,
    reviewCount: 9,
    isVerified: true,
    joinedAt: '2025-10-05',
  },
  {
    id: 'u-5',
    name: 'Meera Krishnan',
    avatar: avatar('Meera'),
    college: 'VIT Chennai',
    year: '2nd Year BA English',
    bio: 'Fluent in 4 languages, want to learn coding',
    skillsHave: ['French', 'Japanese', 'Spanish', 'Creative Writing'],
    skillsWant: ['Python', 'React', 'Figma'],
    credits: 45,
    sessionsCompleted: 18,
    rating: 4.9,
    reviewCount: 15,
    isVerified: true,
    joinedAt: '2025-08-30',
  },
  {
    id: 'u-6',
    name: 'Aditya Patel',
    avatar: avatar('Aditya'),
    college: 'VIT Chennai',
    year: '3rd Year B.Tech Mech',
    bio: 'Yoga instructor, also into music production 🎧',
    skillsHave: ['Yoga', 'Martial Arts', 'Music Production', 'Drums'],
    skillsWant: ['Python', 'Figma', 'Photography'],
    credits: 28,
    sessionsCompleted: 10,
    rating: 4.4,
    reviewCount: 7,
    isVerified: false,
    joinedAt: '2026-02-01',
  },
];

// ─── Mock Matches ───────────────────────────────────────
export const MOCK_MATCHES: MockMatch[] = [
  {
    id: 'm-1',
    user: MOCK_USERS[0], // Priya
    matchedSkillOffer: 'Guitar',
    matchedSkillWant: 'Python',
    matchScore: 97,
    status: 'pending',
  },
  {
    id: 'm-2',
    user: MOCK_USERS[1], // Rahul
    matchedSkillOffer: 'UI/UX Design',
    matchedSkillWant: 'React',
    matchScore: 92,
    status: 'accepted',
  },
  {
    id: 'm-3',
    user: MOCK_USERS[2], // Ananya
    matchedSkillOffer: 'Photography',
    matchedSkillWant: 'Python',
    matchScore: 85,
    status: 'pending',
  },
  {
    id: 'm-4',
    user: MOCK_USERS[4], // Meera
    matchedSkillOffer: 'Japanese',
    matchedSkillWant: 'React',
    matchScore: 78,
    status: 'pending',
  },
];

// ─── Mock Sessions ──────────────────────────────────────
export const MOCK_SESSIONS: MockSession[] = [
  {
    id: 's-1',
    teacher: MOCK_USERS[0],
    learner: CURRENT_USER,
    skill: 'Guitar',
    scheduledAt: '2026-05-01T16:00:00',
    duration: 60,
    status: 'upcoming',
    creditsExchanged: 3,
  },
  {
    id: 's-2',
    teacher: CURRENT_USER,
    learner: MOCK_USERS[1],
    skill: 'React',
    scheduledAt: '2026-05-02T10:00:00',
    duration: 45,
    status: 'upcoming',
    creditsExchanged: 2,
  },
  {
    id: 's-3',
    teacher: MOCK_USERS[1],
    learner: CURRENT_USER,
    skill: 'UI/UX Design',
    scheduledAt: '2026-04-25T14:00:00',
    duration: 60,
    status: 'completed',
    creditsExchanged: 3,
  },
  {
    id: 's-4',
    teacher: CURRENT_USER,
    learner: MOCK_USERS[4],
    skill: 'Python',
    scheduledAt: '2026-04-20T11:00:00',
    duration: 90,
    status: 'completed',
    creditsExchanged: 4,
  },
  {
    id: 's-5',
    teacher: MOCK_USERS[3],
    learner: CURRENT_USER,
    skill: 'Basketball',
    scheduledAt: '2026-05-05T07:00:00',
    duration: 60,
    status: 'upcoming',
    creditsExchanged: 3,
  },
];

// ─── Mock Reviews ───────────────────────────────────────
export const MOCK_REVIEWS: MockReview[] = [
  {
    id: 'r-1',
    fromUser: MOCK_USERS[1],
    toUser: CURRENT_USER,
    sessionId: 's-3',
    skill: 'React',
    rating: 5,
    comment: 'Arjun explained hooks and state management so clearly. Best session yet!',
    createdAt: '2026-04-25T15:30:00',
  },
  {
    id: 'r-2',
    fromUser: MOCK_USERS[4],
    toUser: CURRENT_USER,
    sessionId: 's-4',
    skill: 'Python',
    rating: 5,
    comment: 'Super patient teacher. Covered list comprehensions and pandas in one session!',
    createdAt: '2026-04-20T12:45:00',
  },
  {
    id: 'r-3',
    fromUser: CURRENT_USER,
    toUser: MOCK_USERS[1],
    sessionId: 's-3',
    skill: 'UI/UX Design',
    rating: 4,
    comment: 'Rahul showed me Figma workflows that would have taken weeks to figure out alone.',
    createdAt: '2026-04-25T15:35:00',
  },
  {
    id: 'r-4',
    fromUser: MOCK_USERS[0],
    toUser: CURRENT_USER,
    sessionId: 's-1',
    skill: 'Python',
    rating: 5,
    comment: 'Made recursion actually fun! Would definitely book again.',
    createdAt: '2026-04-18T17:00:00',
  },
  {
    id: 'r-5',
    fromUser: CURRENT_USER,
    toUser: MOCK_USERS[0],
    sessionId: 's-1',
    skill: 'Guitar',
    rating: 5,
    comment: 'Priya is an incredible teacher. Learned 3 chords in the first session!',
    createdAt: '2026-04-18T17:05:00',
  },
];

// ─── Marketplace Listings ───────────────────────────────
export const MOCK_LISTINGS: MarketplaceListing[] = [
  {
    id: 'l-1',
    user: MOCK_USERS[0],
    skillOffered: 'Guitar',
    skillWanted: 'Python',
    description: 'Can teach acoustic guitar from scratch — finger-picking, chords, strumming patterns. Looking for someone to help me get started with Python & data science.',
    creditsPerHour: 3,
    availability: 'Weekday evenings, Sat mornings',
    tags: ['Beginner-friendly', 'Acoustic', 'Music Theory'],
  },
  {
    id: 'l-2',
    user: MOCK_USERS[1],
    skillOffered: 'UI/UX Design',
    skillWanted: 'React',
    description: 'Senior design student. I can teach end-to-end product design in Figma — wireframes, prototyping, design systems. Want to learn React to build my own portfolio.',
    creditsPerHour: 3,
    availability: 'Flexible — ping me!',
    tags: ['Figma', 'Portfolio', 'Design Systems'],
  },
  {
    id: 'l-3',
    user: MOCK_USERS[2],
    skillOffered: 'Photography',
    skillWanted: 'Indian Cuisine',
    description: 'Portrait and street photography. I own a Canon R6 and can teach composition, lighting, and editing. Desperately need someone to teach me proper Indian cooking!',
    creditsPerHour: 2,
    availability: 'Weekends preferred',
    tags: ['Portrait', 'Lightroom', 'Composition'],
  },
  {
    id: 'l-4',
    user: MOCK_USERS[3],
    skillOffered: 'C++',
    skillWanted: 'Guitar',
    description: 'Competitive programmer. Can help with DSA, competitive coding, and system-level C++. Want to finally learn guitar!',
    creditsPerHour: 4,
    availability: 'Mon/Wed/Fri evenings',
    tags: ['DSA', 'Competitive', 'System Design'],
  },
  {
    id: 'l-5',
    user: MOCK_USERS[4],
    skillOffered: 'Japanese',
    skillWanted: 'React',
    description: 'JLPT N2 certified. Teach conversational Japanese, hiragana/katakana, and basic kanji. Want to learn React for a side project.',
    creditsPerHour: 3,
    availability: 'Tue/Thu late afternoons',
    tags: ['JLPT', 'Conversational', 'Kanji'],
  },
  {
    id: 'l-6',
    user: MOCK_USERS[5],
    skillOffered: 'Yoga',
    skillWanted: 'Python',
    description: 'Certified yoga instructor. From Hatha to Vinyasa, I can guide you through it. Interested in learning Python for automating stuff.',
    creditsPerHour: 2,
    availability: 'Early mornings (6-8am)',
    tags: ['Hatha', 'Vinyasa', 'Meditation'],
  },
];

// ─── Stats ──────────────────────────────────────────────
export const PLATFORM_STATS = {
  totalUsers: 2847,
  totalSessions: 12430,
  skillsListed: 156,
  avgRating: 4.7,
};
