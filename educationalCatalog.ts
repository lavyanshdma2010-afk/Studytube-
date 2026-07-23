import { VideoItem } from '../types';

export const BLOCKED_KEYWORDS = [
  'minecraft',
  'gta',
  'fortnite',
  'roblox',
  'pubg',
  'bgmi',
  'free fire',
  'valorant',
  'call of duty',
  'gaming',
  'gameplay',
  'walkthrough',
  'music',
  'song',
  'movie',
  'trailer',
  'anime',
  'netflix',
  'instagram',
  'reels',
  'shorts',
  'funny',
  'memes',
  'prank',
  'reaction',
  'vlog'
];

export const EDUCATIONAL_CATALOG: VideoItem[] = [
  // Mathematics
  {
    id: 'fNk_zzaMoSs',
    title: 'Calculus 1 - Full College Course',
    channelTitle: 'freeCodeCamp.org',
    description: 'Learn Calculus 1 in this full college course. Topics include functions, limits, derivatives, integrals, and applications.',
    thumbnailUrl: 'https://img.youtube.com/vi/fNk_zzaMoSs/hqdefault.jpg',
    publishedAt: '2021-04-12',
    duration: '11:51:23',
    subject: 'Mathematics',
    examCategory: 'JEE',
    views: '3.4M',
    verifiedEducational: true,
    keyTakeaways: ['Limits & Continuity', 'Derivatives & Chain Rule', 'Integrals & Fundamental Theorem', 'Optimization Problems']
  },
  {
    id: 'WUvTyaaNkzM',
    title: 'Linear Algebra for Beginners - Full Course',
    channelTitle: 'freeCodeCamp.org',
    description: 'Master vectors, matrices, determinants, eigenvalues, eigenvectors, and vector spaces for mathematics and machine learning.',
    thumbnailUrl: 'https://img.youtube.com/vi/WUvTyaaNkzM/hqdefault.jpg',
    publishedAt: '2020-09-08',
    duration: '3:08:44',
    subject: 'Mathematics',
    examCategory: 'JEE',
    views: '1.8M',
    verifiedEducational: true,
    keyTakeaways: ['Vector spaces', 'Matrix operations', 'System of Linear Equations', 'Eigenvalues & Eigenvectors']
  },
  {
    id: '3c08_C21H9w',
    title: 'Class 12 Maths NCERT - Integration Complete Chapter Revision',
    channelTitle: 'NCERT Official & PW',
    description: 'Comprehensive NCERT Class 12 Integration chapter covering definite & indefinite integrals, substitution, and CBSE board problems.',
    thumbnailUrl: 'https://img.youtube.com/vi/3c08_C21H9w/hqdefault.jpg',
    publishedAt: '2023-01-15',
    duration: '2:15:30',
    subject: 'Mathematics',
    examCategory: 'NCERT',
    views: '920K',
    verifiedEducational: true,
    keyTakeaways: ['Indefinite Integration formulas', 'Integration by Parts', 'Definite Integral Properties', 'CBSE Board Expected Questions']
  },

  // Science / Physics / Chemistry / Biology
  {
    id: 'bHIhgx6k5bo',
    title: 'Physics - Newton’s Laws of Motion & Friction',
    channelTitle: 'Khan Academy',
    description: 'Deep dive into Newton’s First, Second, and Third Laws, free body diagrams, and static vs kinetic friction.',
    thumbnailUrl: 'https://img.youtube.com/vi/bHIhgx6k5bo/hqdefault.jpg',
    publishedAt: '2022-03-20',
    duration: '42:10',
    subject: 'Science',
    examCategory: 'JEE',
    views: '1.2M',
    verifiedEducational: true,
    keyTakeaways: ['Inertia and Force Definition', 'Free Body Diagrams (FBD)', 'Static and Kinetic Friction Formulas', 'Inclined Plane Dynamics']
  },
  {
    id: '6m23X83LqJ4',
    title: 'NEET Chemistry - Organic Chemistry Reaction Mechanisms',
    channelTitle: 'Physics Wallah',
    description: 'Complete breakdown of electrophilic substitution, nucleophilic addition, and elimination mechanisms for NEET & CBSE Class 12.',
    thumbnailUrl: 'https://img.youtube.com/vi/6m23X83LqJ4/hqdefault.jpg',
    publishedAt: '2023-05-10',
    duration: '1:45:00',
    subject: 'Science',
    examCategory: 'NEET',
    views: '1.5M',
    verifiedEducational: true,
    keyTakeaways: ['SN1 vs SN2 Mechanisms', 'Markovnikov Rule', 'Inductive & Resonance Effects', 'NEET Previous Year Questions']
  },
  {
    id: 'q83a2p_p4Lw',
    title: 'Class 10 Science NCERT - Life Processes Full Chapter',
    channelTitle: 'Edumantra NCERT',
    description: 'NCERT Class 10 Biology chapter on Nutrition, Respiration, Transportation, and Excretion in plants and human beings.',
    thumbnailUrl: 'https://img.youtube.com/vi/q83a2p_p4Lw/hqdefault.jpg',
    publishedAt: '2022-08-11',
    duration: '1:12:40',
    subject: 'Science',
    examCategory: 'NCERT',
    views: '2.1M',
    verifiedEducational: true,
    keyTakeaways: ['Autotrophic & Heterotrophic Nutrition', 'Human Digestive System', 'Double Circulation in Heart', 'Nephron Structure & Excretion']
  },

  // Programming & Computer Science
  {
    id: 'rfscVS0vtbw',
    title: 'Python for Beginners - Learn Python in 1 Hour',
    channelTitle: 'Programming with Mosh',
    description: 'Quick-start crash course on Python programming basics: variables, loops, functions, lists, and object-oriented concepts.',
    thumbnailUrl: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg',
    publishedAt: '2020-01-20',
    duration: '1:00:00',
    subject: 'Programming',
    examCategory: 'General',
    views: '38M',
    verifiedEducational: true,
    keyTakeaways: ['Variables & Data Types', 'Control Flow & Loops', 'Data Structures (Lists, Tuples, Dicts)', 'Writing Reusable Functions']
  },
  {
    id: 'pkYVOmU3MgA',
    title: 'Data Structures and Algorithms - Full Course',
    channelTitle: 'freeCodeCamp.org',
    description: 'Learn arrays, linked lists, stacks, queues, binary trees, graphs, sorting algorithms, and Big-O time complexity analysis.',
    thumbnailUrl: 'https://img.youtube.com/vi/pkYVOmU3MgA/hqdefault.jpg',
    publishedAt: '2021-11-04',
    duration: '5:22:10',
    subject: 'Programming',
    examCategory: 'General',
    views: '4.9M',
    verifiedEducational: true,
    keyTakeaways: ['Big-O Notation', 'Arrays & Linked Lists', 'Trees & Graph Traversals (DFS/BFS)', 'Sorting & Searching Algorithms']
  },

  // UPSC & History
  {
    id: '3V1WnI_A9gM',
    title: 'Indian History & Modern Freedom Movement for UPSC CSE',
    channelTitle: 'Unacademy UPSC',
    description: 'Detailed analysis of British rule in India, 1857 Revolt, Indian National Congress, and Mahatma Gandhi’s movements for UPSC Mains/Prelims.',
    thumbnailUrl: 'https://img.youtube.com/vi/3V1WnI_A9gM/hqdefault.jpg',
    publishedAt: '2022-10-05',
    duration: '2:30:15',
    subject: 'History',
    examCategory: 'UPSC',
    views: '1.1M',
    verifiedEducational: true,
    keyTakeaways: ['Revolt of 1857 Causes & Impact', 'Non-Cooperation & Civil Disobedience Movements', 'Government of India Act 1935', 'UPSC Prelims Question Patterns']
  },
  {
    id: 'Y3G2q-PzCbg',
    title: 'Class 9 History NCERT - The French Revolution',
    channelTitle: 'NCERT Online',
    description: 'NCERT Class 9 Chapter 1: Estates System, Storming of Bastille, Declaration of Rights of Man, and Reign of Terror.',
    thumbnailUrl: 'https://img.youtube.com/vi/Y3G2q-PzCbg/hqdefault.jpg',
    publishedAt: '2021-06-18',
    duration: '48:20',
    subject: 'History',
    examCategory: 'NCERT',
    views: '850K',
    verifiedEducational: true,
    keyTakeaways: ['Three Estates in 18th Century France', 'Role of Philosophers (Rousseau, Locke)', 'Abolition of Monarchy', 'Legacy of French Revolution']
  },

  // Geography
  {
    id: 'f9bX6p2gI4k',
    title: 'Physical Geography for UPSC - Plate Tectonics & Earthquakes',
    channelTitle: 'Study IQ Education',
    description: 'Understanding continental drift theory, plate boundary types, faulting, volcanism, and earthquake seismic waves (P-waves & S-waves).',
    thumbnailUrl: 'https://img.youtube.com/vi/f9bX6p2gI4k/hqdefault.jpg',
    publishedAt: '2023-02-14',
    duration: '1:15:00',
    subject: 'Geography',
    examCategory: 'UPSC',
    views: '780K',
    verifiedEducational: true,
    keyTakeaways: ['Wegener’s Continental Drift Theory', 'Convergent & Divergent Boundaries', 'Ring of Fire & Subduction Zones', 'Seismic Shadow Zones']
  },
  {
    id: 'P24K4i4z-2k',
    title: 'Class 10 Geography NCERT - Resources and Development',
    channelTitle: 'CBSE Guidance',
    description: 'NCERT Class 10 Geography Chapter 1 covering resource classification, soil types in India, soil erosion, and sustainable development.',
    thumbnailUrl: 'https://img.youtube.com/vi/P24K4i4z-2k/hqdefault.jpg',
    publishedAt: '2022-09-01',
    duration: '38:45',
    subject: 'Geography',
    examCategory: 'CBSE',
    views: '620K',
    verifiedEducational: true,
    keyTakeaways: ['Biotic & Abiotic Resources', 'Alluvial, Black & Laterite Soil Distribution', 'Rio de Janeiro Earth Summit 1992', 'Conservation Techniques']
  },

  // Political Science & Economics
  {
    id: 'yJvL5eJ-2kE',
    title: 'Indian Polity for UPSC - Preamble & Fundamental Rights',
    channelTitle: 'M. Laxmikanth Simplified',
    description: 'Article 12 to 35 explained in simple detail: Right to Equality, Right to Freedom, Constitutional Remedies, and landmark Supreme Court judgements.',
    thumbnailUrl: 'https://img.youtube.com/vi/yJvL5eJ-2kE/hqdefault.jpg',
    publishedAt: '2022-11-12',
    duration: '1:50:00',
    subject: 'Political Science',
    examCategory: 'UPSC',
    views: '1.4M',
    verifiedEducational: true,
    keyTakeaways: ['Articles 14 to 18 Equality Rights', 'Article 21 Personal Liberty', 'Writs (Habeas Corpus, Mandamus)', 'Kesavananda Bharati Case']
  },
  {
    id: '3Ez6_aA4E1k',
    title: 'Class 12 Economics NCERT - Macroeconomics National Income',
    channelTitle: 'Economics World',
    description: 'Calculation of GDP, NDP, GNP, NNP at factor cost and market price, circular flow of income, and nominal vs real GDP.',
    thumbnailUrl: 'https://img.youtube.com/vi/3Ez6_aA4E1k/hqdefault.jpg',
    publishedAt: '2023-03-01',
    duration: '1:05:30',
    subject: 'Economics',
    examCategory: 'CBSE',
    views: '540K',
    verifiedEducational: true,
    keyTakeaways: ['Value Added Method', 'Income Method & Expenditure Method', 'GDP Deflator Formula', 'CBSE Numerical Problems']
  },

  // English Literature & Grammar
  {
    id: 'G12R78m7x4A',
    title: 'English Grammar - Tenses Masterclass (Present, Past, Future)',
    channelTitle: 'English with Lucy',
    description: 'Clear masterclass explaining simple, continuous, perfect, and perfect continuous tenses with real-world sentence examples.',
    thumbnailUrl: 'https://img.youtube.com/vi/G12R78m7x4A/hqdefault.jpg',
    publishedAt: '2021-08-10',
    duration: '28:15',
    subject: 'English',
    examCategory: 'CBSE',
    views: '3.1M',
    verifiedEducational: true,
    keyTakeaways: ['Structure of 12 Tenses', 'Common Common Mistakes in Writing', 'Active vs Passive Conversion', 'Rules for CBSE Board Grammar']
  }
];
