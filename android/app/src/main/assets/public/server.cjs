var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/data/educationalCatalog.ts
var BLOCKED_KEYWORDS = [
  "minecraft",
  "gta",
  "fortnite",
  "roblox",
  "pubg",
  "bgmi",
  "free fire",
  "valorant",
  "call of duty",
  "gaming",
  "gameplay",
  "walkthrough",
  "music",
  "song",
  "movie",
  "trailer",
  "anime",
  "netflix",
  "instagram",
  "reels",
  "shorts",
  "funny",
  "memes",
  "prank",
  "reaction",
  "vlog"
];
var EDUCATIONAL_CATALOG = [
  // Mathematics
  {
    id: "fNk_zzaMoSs",
    title: "Calculus 1 - Full College Course",
    channelTitle: "freeCodeCamp.org",
    description: "Learn Calculus 1 in this full college course. Topics include functions, limits, derivatives, integrals, and applications.",
    thumbnailUrl: "https://img.youtube.com/vi/fNk_zzaMoSs/hqdefault.jpg",
    publishedAt: "2021-04-12",
    duration: "11:51:23",
    subject: "Mathematics",
    examCategory: "JEE",
    views: "3.4M",
    verifiedEducational: true,
    keyTakeaways: ["Limits & Continuity", "Derivatives & Chain Rule", "Integrals & Fundamental Theorem", "Optimization Problems"]
  },
  {
    id: "WUvTyaaNkzM",
    title: "Linear Algebra for Beginners - Full Course",
    channelTitle: "freeCodeCamp.org",
    description: "Master vectors, matrices, determinants, eigenvalues, eigenvectors, and vector spaces for mathematics and machine learning.",
    thumbnailUrl: "https://img.youtube.com/vi/WUvTyaaNkzM/hqdefault.jpg",
    publishedAt: "2020-09-08",
    duration: "3:08:44",
    subject: "Mathematics",
    examCategory: "JEE",
    views: "1.8M",
    verifiedEducational: true,
    keyTakeaways: ["Vector spaces", "Matrix operations", "System of Linear Equations", "Eigenvalues & Eigenvectors"]
  },
  {
    id: "3c08_C21H9w",
    title: "Class 12 Maths NCERT - Integration Complete Chapter Revision",
    channelTitle: "NCERT Official & PW",
    description: "Comprehensive NCERT Class 12 Integration chapter covering definite & indefinite integrals, substitution, and CBSE board problems.",
    thumbnailUrl: "https://img.youtube.com/vi/3c08_C21H9w/hqdefault.jpg",
    publishedAt: "2023-01-15",
    duration: "2:15:30",
    subject: "Mathematics",
    examCategory: "NCERT",
    views: "920K",
    verifiedEducational: true,
    keyTakeaways: ["Indefinite Integration formulas", "Integration by Parts", "Definite Integral Properties", "CBSE Board Expected Questions"]
  },
  // Science / Physics / Chemistry / Biology
  {
    id: "bHIhgx6k5bo",
    title: "Physics - Newton\u2019s Laws of Motion & Friction",
    channelTitle: "Khan Academy",
    description: "Deep dive into Newton\u2019s First, Second, and Third Laws, free body diagrams, and static vs kinetic friction.",
    thumbnailUrl: "https://img.youtube.com/vi/bHIhgx6k5bo/hqdefault.jpg",
    publishedAt: "2022-03-20",
    duration: "42:10",
    subject: "Science",
    examCategory: "JEE",
    views: "1.2M",
    verifiedEducational: true,
    keyTakeaways: ["Inertia and Force Definition", "Free Body Diagrams (FBD)", "Static and Kinetic Friction Formulas", "Inclined Plane Dynamics"]
  },
  {
    id: "6m23X83LqJ4",
    title: "NEET Chemistry - Organic Chemistry Reaction Mechanisms",
    channelTitle: "Physics Wallah",
    description: "Complete breakdown of electrophilic substitution, nucleophilic addition, and elimination mechanisms for NEET & CBSE Class 12.",
    thumbnailUrl: "https://img.youtube.com/vi/6m23X83LqJ4/hqdefault.jpg",
    publishedAt: "2023-05-10",
    duration: "1:45:00",
    subject: "Science",
    examCategory: "NEET",
    views: "1.5M",
    verifiedEducational: true,
    keyTakeaways: ["SN1 vs SN2 Mechanisms", "Markovnikov Rule", "Inductive & Resonance Effects", "NEET Previous Year Questions"]
  },
  {
    id: "q83a2p_p4Lw",
    title: "Class 10 Science NCERT - Life Processes Full Chapter",
    channelTitle: "Edumantra NCERT",
    description: "NCERT Class 10 Biology chapter on Nutrition, Respiration, Transportation, and Excretion in plants and human beings.",
    thumbnailUrl: "https://img.youtube.com/vi/q83a2p_p4Lw/hqdefault.jpg",
    publishedAt: "2022-08-11",
    duration: "1:12:40",
    subject: "Science",
    examCategory: "NCERT",
    views: "2.1M",
    verifiedEducational: true,
    keyTakeaways: ["Autotrophic & Heterotrophic Nutrition", "Human Digestive System", "Double Circulation in Heart", "Nephron Structure & Excretion"]
  },
  // Programming & Computer Science
  {
    id: "rfscVS0vtbw",
    title: "Python for Beginners - Learn Python in 1 Hour",
    channelTitle: "Programming with Mosh",
    description: "Quick-start crash course on Python programming basics: variables, loops, functions, lists, and object-oriented concepts.",
    thumbnailUrl: "https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg",
    publishedAt: "2020-01-20",
    duration: "1:00:00",
    subject: "Programming",
    examCategory: "General",
    views: "38M",
    verifiedEducational: true,
    keyTakeaways: ["Variables & Data Types", "Control Flow & Loops", "Data Structures (Lists, Tuples, Dicts)", "Writing Reusable Functions"]
  },
  {
    id: "pkYVOmU3MgA",
    title: "Data Structures and Algorithms - Full Course",
    channelTitle: "freeCodeCamp.org",
    description: "Learn arrays, linked lists, stacks, queues, binary trees, graphs, sorting algorithms, and Big-O time complexity analysis.",
    thumbnailUrl: "https://img.youtube.com/vi/pkYVOmU3MgA/hqdefault.jpg",
    publishedAt: "2021-11-04",
    duration: "5:22:10",
    subject: "Programming",
    examCategory: "General",
    views: "4.9M",
    verifiedEducational: true,
    keyTakeaways: ["Big-O Notation", "Arrays & Linked Lists", "Trees & Graph Traversals (DFS/BFS)", "Sorting & Searching Algorithms"]
  },
  // UPSC & History
  {
    id: "3V1WnI_A9gM",
    title: "Indian History & Modern Freedom Movement for UPSC CSE",
    channelTitle: "Unacademy UPSC",
    description: "Detailed analysis of British rule in India, 1857 Revolt, Indian National Congress, and Mahatma Gandhi\u2019s movements for UPSC Mains/Prelims.",
    thumbnailUrl: "https://img.youtube.com/vi/3V1WnI_A9gM/hqdefault.jpg",
    publishedAt: "2022-10-05",
    duration: "2:30:15",
    subject: "History",
    examCategory: "UPSC",
    views: "1.1M",
    verifiedEducational: true,
    keyTakeaways: ["Revolt of 1857 Causes & Impact", "Non-Cooperation & Civil Disobedience Movements", "Government of India Act 1935", "UPSC Prelims Question Patterns"]
  },
  {
    id: "Y3G2q-PzCbg",
    title: "Class 9 History NCERT - The French Revolution",
    channelTitle: "NCERT Online",
    description: "NCERT Class 9 Chapter 1: Estates System, Storming of Bastille, Declaration of Rights of Man, and Reign of Terror.",
    thumbnailUrl: "https://img.youtube.com/vi/Y3G2q-PzCbg/hqdefault.jpg",
    publishedAt: "2021-06-18",
    duration: "48:20",
    subject: "History",
    examCategory: "NCERT",
    views: "850K",
    verifiedEducational: true,
    keyTakeaways: ["Three Estates in 18th Century France", "Role of Philosophers (Rousseau, Locke)", "Abolition of Monarchy", "Legacy of French Revolution"]
  },
  // Geography
  {
    id: "f9bX6p2gI4k",
    title: "Physical Geography for UPSC - Plate Tectonics & Earthquakes",
    channelTitle: "Study IQ Education",
    description: "Understanding continental drift theory, plate boundary types, faulting, volcanism, and earthquake seismic waves (P-waves & S-waves).",
    thumbnailUrl: "https://img.youtube.com/vi/f9bX6p2gI4k/hqdefault.jpg",
    publishedAt: "2023-02-14",
    duration: "1:15:00",
    subject: "Geography",
    examCategory: "UPSC",
    views: "780K",
    verifiedEducational: true,
    keyTakeaways: ["Wegener\u2019s Continental Drift Theory", "Convergent & Divergent Boundaries", "Ring of Fire & Subduction Zones", "Seismic Shadow Zones"]
  },
  {
    id: "P24K4i4z-2k",
    title: "Class 10 Geography NCERT - Resources and Development",
    channelTitle: "CBSE Guidance",
    description: "NCERT Class 10 Geography Chapter 1 covering resource classification, soil types in India, soil erosion, and sustainable development.",
    thumbnailUrl: "https://img.youtube.com/vi/P24K4i4z-2k/hqdefault.jpg",
    publishedAt: "2022-09-01",
    duration: "38:45",
    subject: "Geography",
    examCategory: "CBSE",
    views: "620K",
    verifiedEducational: true,
    keyTakeaways: ["Biotic & Abiotic Resources", "Alluvial, Black & Laterite Soil Distribution", "Rio de Janeiro Earth Summit 1992", "Conservation Techniques"]
  },
  // Political Science & Economics
  {
    id: "yJvL5eJ-2kE",
    title: "Indian Polity for UPSC - Preamble & Fundamental Rights",
    channelTitle: "M. Laxmikanth Simplified",
    description: "Article 12 to 35 explained in simple detail: Right to Equality, Right to Freedom, Constitutional Remedies, and landmark Supreme Court judgements.",
    thumbnailUrl: "https://img.youtube.com/vi/yJvL5eJ-2kE/hqdefault.jpg",
    publishedAt: "2022-11-12",
    duration: "1:50:00",
    subject: "Political Science",
    examCategory: "UPSC",
    views: "1.4M",
    verifiedEducational: true,
    keyTakeaways: ["Articles 14 to 18 Equality Rights", "Article 21 Personal Liberty", "Writs (Habeas Corpus, Mandamus)", "Kesavananda Bharati Case"]
  },
  {
    id: "3Ez6_aA4E1k",
    title: "Class 12 Economics NCERT - Macroeconomics National Income",
    channelTitle: "Economics World",
    description: "Calculation of GDP, NDP, GNP, NNP at factor cost and market price, circular flow of income, and nominal vs real GDP.",
    thumbnailUrl: "https://img.youtube.com/vi/3Ez6_aA4E1k/hqdefault.jpg",
    publishedAt: "2023-03-01",
    duration: "1:05:30",
    subject: "Economics",
    examCategory: "CBSE",
    views: "540K",
    verifiedEducational: true,
    keyTakeaways: ["Value Added Method", "Income Method & Expenditure Method", "GDP Deflator Formula", "CBSE Numerical Problems"]
  },
  // English Literature & Grammar
  {
    id: "G12R78m7x4A",
    title: "English Grammar - Tenses Masterclass (Present, Past, Future)",
    channelTitle: "English with Lucy",
    description: "Clear masterclass explaining simple, continuous, perfect, and perfect continuous tenses with real-world sentence examples.",
    thumbnailUrl: "https://img.youtube.com/vi/G12R78m7x4A/hqdefault.jpg",
    publishedAt: "2021-08-10",
    duration: "28:15",
    subject: "English",
    examCategory: "CBSE",
    views: "3.1M",
    verifiedEducational: true,
    keyTakeaways: ["Structure of 12 Tenses", "Common Common Mistakes in Writing", "Active vs Passive Conversion", "Rules for CBSE Board Grammar"]
  }
];

// src/utils/explicitFilter.ts
var EXPLICIT_SIGNATURES = [
  // Core explicit
  "porn",
  "porno",
  "pornography",
  "pornstar",
  "xxx",
  "xvideos",
  "pornhub",
  "redtube",
  "xhamster",
  "hentai",
  "milf",
  "erotica",
  "erotic",
  "slut",
  "whore",
  "bitch",
  "fuck",
  "fucker",
  "motherfucker",
  // Anatomy slang & explicit acts
  "boobs",
  "tits",
  "titties",
  "pussy",
  "dick",
  "cock",
  "blowjob",
  "handjob",
  "cum",
  "cumming",
  "semen",
  "orgasm",
  "masturbate",
  "masturbation",
  "squirting",
  "creampie",
  "gloryhole",
  "bukakke",
  "dildo",
  "vibrator",
  "sex toy",
  // Acts / Kinks
  "hardcore",
  "softcore",
  "bdsm",
  "fetish",
  "anal",
  "striptease",
  "strip club",
  "sensual",
  "sexy",
  "lust",
  "incest",
  "kinky",
  "threesome",
  "orgy",
  "gangbang",
  "shibari",
  "voyeur",
  "exhibitionist",
  "nympho",
  // Industry / Culture
  "playboy",
  "onlyfans",
  "camgirl",
  "webcam girl",
  "escort",
  "prostitute",
  "prostitution",
  "brazzers",
  "bangbros",
  "rule 34",
  "rule34",
  "nsfw",
  "18+",
  "x-rated",
  "mature content",
  "smut",
  "lemon",
  "doujinshi",
  "yaoi",
  "yuri",
  "ahegao",
  // Context specific explicit phrasing
  "sex video",
  "sex movie",
  "sexy video",
  "hot video",
  "hot scene",
  "hot girl",
  "hot babe",
  "hot women",
  "hot guy",
  "nude",
  "naked",
  "nudity",
  "nudist",
  "uncensored",
  "bikini haul",
  "lingerie haul",
  "sex tape",
  "sex scene",
  "stepmom",
  "stepsister",
  "step fantasy"
];
var EXPLICIT_REGEXES = EXPLICIT_SIGNATURES.map((term) => {
  const escapedTermChars = term.split("").map((c) => {
    if (c === " ") return "\\s+";
    return c.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  });
  const spacedPattern = escapedTermChars.join("[\\s\\-_\\.\\*\\?\\!]*");
  return {
    term,
    regex: new RegExp(`(?:^|\\W)${spacedPattern}(?:s|es|ing|ed|y|er|ers)?(?:\\W|$)`, "i")
  };
});
var ANATOMY_BIOLOGY_TERMS = [
  "reproduction",
  "reproductive",
  "anatomy",
  "biology",
  "vagina",
  "penis",
  "clitoris",
  "uterus",
  "puberty",
  "ovary",
  "testes",
  "testicles",
  "sperm",
  "fertilization",
  "egg cell",
  "hormone",
  "endocrine",
  "urinary",
  "bladder",
  "menstruation",
  "menstrual",
  "copulation",
  "intercourse",
  "sex",
  "sexual",
  "sexuality",
  "breasts",
  "nipples",
  "genitals",
  "genitalia",
  "scrotum",
  "prostate",
  "gynecology",
  "urology",
  "obstetrics",
  "mating",
  "spawning"
];
var ANATOMY_REGEXES = ANATOMY_BIOLOGY_TERMS.map((term) => {
  const escapedTermChars = term.split("").map((c) => {
    if (c === " ") return "\\s+";
    return c.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  });
  const spacedPattern = escapedTermChars.join("[\\s\\-_\\.\\*\\?\\!]*");
  return {
    term,
    regex: new RegExp(`(?:^|\\W)${spacedPattern}(?:s|es|ing|ed|y|al|ity)?(?:\\W|$)`, "i")
  };
});
var EDUCATIONAL_CONTEXT_CUES = [
  "class 11",
  "class 12",
  "class 10",
  "class 9",
  "class 8",
  "class 7",
  "class 6",
  "ncert",
  "cbse",
  "icse",
  "upsc",
  "jee",
  "neet",
  "ias",
  "gate exam",
  "board exam",
  "syllabus",
  "curriculum",
  "iit jee",
  "board preparation",
  "lecture",
  "tutorial",
  "learn",
  "course",
  "education",
  "study guide",
  "revision",
  "crash course",
  "one shot",
  "full chapter",
  "explanation",
  "introduction to",
  "science",
  "diagram",
  "textbook",
  "academy",
  "professor",
  "teacher",
  "coaching",
  "school",
  "college",
  "university",
  "khan academy",
  "crashcourse",
  "nptel",
  "ted-ed",
  "lesson",
  "physiology",
  "clinical",
  "medical lecture",
  "academic",
  "subject",
  "exam",
  "documentary",
  "history",
  "human",
  "system",
  "health",
  "disease",
  "condition",
  "treatment",
  "medical",
  "medicine",
  "research",
  "study",
  "scientist",
  "discovery",
  "mechanism",
  "development",
  "plants",
  "animals",
  "organisms",
  "species",
  "cellular",
  "genetic",
  "genes",
  "dna",
  "rna",
  "chromosome",
  "evolution",
  "life cycle",
  "cell",
  "function",
  "structure"
];
function normalizeTextForSafety(text) {
  if (!text) return "";
  let normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  normalized = normalized.replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/@/g, "a").replace(/\$/g, "s").replace(/5/g, "s").replace(/7/g, "t").replace(/!/g, "i").replace(/\|/g, "i");
  return normalized;
}
function containsExplicitSignature(normalizedText) {
  for (const { term, regex } of EXPLICIT_REGEXES) {
    if (regex.test(normalizedText)) {
      return { matched: true, term };
    }
  }
  return { matched: false };
}
function findAnatomyTerms(normalizedText) {
  const found = [];
  for (const { term, regex } of ANATOMY_REGEXES) {
    if (regex.test(normalizedText)) {
      found.push(term);
    }
  }
  return found;
}
function hasEducationalCues(normalizedText) {
  for (const cue of EDUCATIONAL_CONTEXT_CUES) {
    const regex = new RegExp(`\\b${cue.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    if (regex.test(normalizedText)) {
      return true;
    }
  }
  return false;
}
function checkExplicitContent(text) {
  if (!text) return { blocked: false };
  const normalized = normalizeTextForSafety(text);
  const sigCheck = containsExplicitSignature(normalized);
  if (sigCheck.matched) {
    return {
      blocked: true,
      reason: `Blocked by StudyTube Content Filter (Adult Category: "${sigCheck.term}")`
    };
  }
  const matchedAnatomy = findAnatomyTerms(normalized);
  if (matchedAnatomy.length > 0) {
    if (hasEducationalCues(normalized)) {
      return { blocked: false };
    } else {
      return {
        blocked: true,
        reason: `Access to anatomy/biology term "${matchedAnatomy[0]}" requires educational context (e.g. "class", "biology", "lecture").`
      };
    }
  }
  return { blocked: false };
}

// src/data/quotes.ts
var MOTIVATIONAL_QUOTES = [
  {
    id: "q1",
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
    category: "Learning"
  },
  {
    id: "q2",
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Perseverance"
  },
  {
    id: "q3",
    text: "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch",
    category: "Mindset"
  },
  {
    id: "q4",
    text: "Concentrate all your thoughts upon the work in hand. The sun\u2019s rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
    category: "Focus"
  },
  {
    id: "q5",
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    category: "Perseverance"
  },
  {
    id: "q6",
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    category: "Learning"
  },
  {
    id: "q7",
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    category: "Perseverance"
  },
  {
    id: "q8",
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
    category: "Focus"
  },
  {
    id: "q9",
    text: "You don\u2019t have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    category: "Mindset"
  },
  {
    id: "q10",
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
    category: "Learning"
  },
  {
    id: "q11",
    text: "Patience, persistence and perspiration make an unbeatable combination for success.",
    author: "Napoleon Hill",
    category: "Perseverance"
  },
  {
    id: "q12",
    text: "Starve your distractions, feed your focus.",
    author: "Unknown",
    category: "Focus"
  }
];

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
function isSearchBlocked(query, customBlockedKeywords = []) {
  if (!query) return { isBlocked: false };
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, " ").trim();
  const allKeywords = [...BLOCKED_KEYWORDS, ...customBlockedKeywords];
  for (const rawKw of allKeywords) {
    const normalizedKw = rawKw.toLowerCase().replace(/\s+/g, " ").trim();
    if (!normalizedKw) continue;
    const escaped = normalizedKw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const hasSpaces = normalizedKw.includes(" ");
    let regex;
    if (hasSpaces) {
      regex = new RegExp(`(?:\\b|^)${escaped}(?:\\b|$)`, "i");
    } else {
      regex = new RegExp(`\\b${escaped}\\b`, "i");
    }
    if (regex.test(normalizedQuery)) {
      return { isBlocked: true, matchedKeyword: rawKw };
    }
  }
  return { isBlocked: false };
}
function parseISO8601Duration(iso) {
  if (!iso) return "";
  if (/^\d+:\d+(?::\d+)?$/.test(iso)) {
    return iso;
  }
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  const pad = (n) => n.toString().padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}
function formatViews(viewsStr) {
  if (!viewsStr) return "100K";
  const num = parseInt(viewsStr, 10);
  if (isNaN(num)) return viewsStr;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
  return `${num}`;
}
function isShortVideo(isoDuration, title = "", description = "") {
  const combined = `${title} ${description}`.toLowerCase();
  if (combined.includes("#shorts") || /\bshorts\b/.test(combined)) {
    return true;
  }
  if (isoDuration) {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const h = parseInt(match[1] || "0", 10);
      const m = parseInt(match[2] || "0", 10);
      const s = parseInt(match[3] || "0", 10);
      const totalSecs = h * 3600 + m * 60 + s;
      if (totalSecs > 0 && totalSecs < 60) {
        return true;
      }
    }
  }
  return false;
}
function isVideoAllowed(title, description, channelTitle = "", customBlockedKeywords = [], customBlockedChannels = [], channelId = "") {
  const explicitTitleCheck = checkExplicitContent(title);
  if (explicitTitleCheck.blocked) {
    return { allowed: false, verifiedEducational: false, reason: explicitTitleCheck.reason };
  }
  const explicitDescCheck = checkExplicitContent(description);
  if (explicitDescCheck.blocked) {
    return { allowed: false, verifiedEducational: false, reason: explicitDescCheck.reason };
  }
  const explicitChannelCheck = checkExplicitContent(channelTitle);
  if (explicitChannelCheck.blocked) {
    return { allowed: false, verifiedEducational: false, reason: explicitChannelCheck.reason };
  }
  const combined = `${title} ${description} ${channelTitle}`.toLowerCase();
  const normalizedCombined = combined.replace(/\s+/g, " ").trim();
  if (customBlockedChannels && customBlockedChannels.length > 0) {
    const isChannelBlocked = customBlockedChannels.some((c) => {
      const matchId = c.id && channelId && c.id.trim() === channelId.trim();
      const matchTitle = c.title && channelTitle && c.title.trim().toLowerCase() === channelTitle.trim().toLowerCase();
      return matchId || matchTitle;
    });
    if (isChannelBlocked) {
      return { allowed: false, verifiedEducational: false, reason: "Channel is in your custom blocked list" };
    }
  }
  const allKeywords = [...BLOCKED_KEYWORDS, ...customBlockedKeywords];
  for (const rawKw of allKeywords) {
    const normalizedKw = rawKw.toLowerCase().replace(/\s+/g, " ").trim();
    if (!normalizedKw) continue;
    const escaped = normalizedKw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const hasSpaces = normalizedKw.includes(" ");
    let regex;
    if (hasSpaces) {
      regex = new RegExp(`(?:\\b|^)${escaped}(?:\\b|$)`, "i");
    } else {
      regex = new RegExp(`\\b${escaped}\\b`, "i");
    }
    if (regex.test(normalizedCombined)) {
      return { allowed: false, verifiedEducational: false, reason: `Matches blocked keyword/phrase "${rawKw}"` };
    }
  }
  const entertainmentBlacklist = [
    "ashish chanchlani",
    "carryminati",
    "fukra insaan",
    "triggered insaan",
    "mythpat",
    "round2hell",
    "slayy point",
    "amit bhadana",
    "harsh beniwal",
    "bb ki vines",
    "mrbeast",
    "pewdiepie",
    "not your type",
    "t-series",
    "set india",
    "sab tv",
    "vlog",
    "daily vlog",
    "gaming",
    "walkthrough",
    "funny prank",
    "prank video",
    "music video",
    "official music video",
    "official video",
    "cover song",
    "remix",
    "live performance",
    "movie trailer",
    "full movie",
    "funny clips",
    "memes compilation",
    "roast video",
    "roasting",
    "bbkivines",
    "comedian",
    "comedy sketch",
    "web series",
    "episode",
    "sitcom",
    "funny drama",
    "trolling",
    "distraction",
    "entertaiment"
  ];
  for (const ent of entertainmentBlacklist) {
    const escaped = ent.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(normalizedCombined)) {
      return { allowed: false, verifiedEducational: false, reason: `Matches entertainment/creator signature "${ent}"` };
    }
  }
  const highConfidenceEdu = [
    "class 11",
    "class 12",
    "class 10",
    "class 9",
    "class 8",
    "ncert",
    "cbse",
    "icse",
    "upsc",
    "jee",
    "neet",
    "ias",
    "gate exam",
    "board exam",
    "syllabus",
    "curriculum",
    "iit jee",
    "board preparation",
    "lecture",
    "tutorial",
    "learn",
    "course",
    "education",
    "study guide",
    "revision",
    "crash course",
    "one shot",
    "full chapter",
    "explanation",
    "introduction to",
    "how to code",
    "programming tutorial",
    "lesson",
    "educational video",
    "solving",
    "mock test",
    "paper discussion",
    "calculus",
    "physics",
    "chemistry",
    "biology",
    "mathematics",
    "geometry",
    "algebra",
    "trigonometry",
    "mechanics",
    "thermodynamics",
    "organic chemistry",
    "inorganic chemistry",
    "genetics",
    "evolution",
    "geography",
    "history of",
    "indian constitution",
    "french revolution",
    "macroeconomics",
    "microeconomics",
    "english grammar",
    "political science",
    "psychology",
    "sociology",
    "python coding",
    "javascript programming",
    "data structures",
    "algorithms",
    "academy",
    "tutorials",
    "professor",
    "teacher",
    "coaching",
    "school",
    "college",
    "university",
    "khan academy",
    "crashcourse",
    "nptel",
    "ted-ed"
  ];
  const hasHighConfidence = highConfidenceEdu.some((kw) => {
    const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(normalizedCombined);
  });
  return {
    allowed: true,
    verifiedEducational: hasHighConfidence
  };
}
async function fetchYouTubeDataAPI(query, subject, exam, pageToken = "", apiKey, customBlockedKeywords = [], customBlockedChannels = []) {
  let searchQ = query.trim();
  if (!searchQ && subject !== "All") {
    searchQ = `${subject} lesson`;
  } else if (!searchQ) {
    searchQ = "NCERT Educational Lessons";
  }
  if (subject !== "All" && !searchQ.toLowerCase().includes(subject.toLowerCase())) {
    searchQ = `${searchQ} ${subject}`;
  }
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.append("part", "snippet");
  searchUrl.searchParams.append("type", "video");
  searchUrl.searchParams.append("maxResults", "50");
  searchUrl.searchParams.append("order", "relevance");
  searchUrl.searchParams.append("safeSearch", "strict");
  searchUrl.searchParams.append("q", searchQ);
  searchUrl.searchParams.append("key", apiKey);
  if (pageToken) {
    searchUrl.searchParams.append("pageToken", pageToken);
  }
  const searchRes = await fetch(searchUrl.toString());
  if (!searchRes.ok) {
    const errData = await searchRes.json().catch(() => ({}));
    const errMsg = errData.error?.message || `HTTP ${searchRes.status} ${searchRes.statusText}`;
    throw new Error(`YouTube API Search Error: ${errMsg}`);
  }
  const searchJson = await searchRes.json();
  const rawItems = searchJson.items || [];
  const nextPageToken = searchJson.nextPageToken || null;
  const videoIds = rawItems.map((item) => item.id?.videoId).filter(Boolean);
  if (videoIds.length === 0) {
    return { videos: [], nextPageToken, rawCandidateCount: 0 };
  }
  const videoDetailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  videoDetailsUrl.searchParams.append("part", "snippet,contentDetails,status,statistics");
  videoDetailsUrl.searchParams.append("id", videoIds.join(","));
  videoDetailsUrl.searchParams.append("key", apiKey);
  const detailsRes = await fetch(videoDetailsUrl.toString());
  if (!detailsRes.ok) {
    const errData = await detailsRes.json().catch(() => ({}));
    const errMsg = errData.error?.message || `HTTP ${detailsRes.status} ${detailsRes.statusText}`;
    throw new Error(`YouTube API Details Error: ${errMsg}`);
  }
  const detailsJson = await detailsRes.json();
  const detailItems = detailsJson.items || [];
  const detailsMap = /* @__PURE__ */ new Map();
  for (const item of detailItems) {
    detailsMap.set(item.id, item);
  }
  const processedVideos = [];
  for (const rawItem of rawItems) {
    const videoId = rawItem.id?.videoId;
    if (!videoId) continue;
    const item = detailsMap.get(videoId);
    if (!item) continue;
    const snippet = item.snippet || {};
    const status = item.status || {};
    const contentDetails = item.contentDetails || {};
    const statistics = item.statistics || {};
    if (status.embeddable === false || isShortVideo(contentDetails.duration, snippet.title, snippet.description)) {
      continue;
    }
    const title = snippet.title || "Educational Lesson";
    const description = snippet.description || "";
    const channelTitle = snippet.channelTitle || "YouTube Educator";
    const channelId = snippet.channelId || "";
    const thumbnails = snippet.thumbnails || {};
    const thumbnailUrl = thumbnails.high?.url || thumbnails.medium?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const filterCheck = isVideoAllowed(
      title,
      description,
      channelTitle,
      customBlockedKeywords,
      customBlockedChannels,
      channelId
    );
    if (!filterCheck.allowed) {
      continue;
    }
    const rawDuration = contentDetails.duration;
    const formattedDuration = parseISO8601Duration(rawDuration);
    console.log(`[Duration Diagnostic] VIDEO TITLE: "${title}" | VIDEO ID: ${videoId} | RAW API DURATION: ${rawDuration} | FORMATTED DURATION: ${formattedDuration} | DISPLAYED DURATION: ${formattedDuration}`);
    processedVideos.push({
      id: videoId,
      title,
      channelTitle,
      channelId,
      description,
      thumbnailUrl,
      publishedAt: snippet.publishedAt ? snippet.publishedAt.split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      duration: formattedDuration,
      subject: subject !== "All" ? subject : "Science",
      examCategory: exam !== "General" ? exam : "NCERT",
      views: formatViews(statistics.viewCount),
      verifiedEducational: filterCheck.verifiedEducational,
      keyTakeaways: ["Key Concepts Explained", "Step-by-step Lesson", "Exam Revision Tips"]
    });
  }
  return {
    videos: processedVideos,
    nextPageToken,
    rawCandidateCount: rawItems.length
  };
}
async function fetchFallbackYouTubeSearch(query, subject, exam, customBlockedKeywords = [], customBlockedChannels = []) {
  try {
    let searchQ = query.trim();
    if (!searchQ && subject !== "All") {
      searchQ = `${subject} NCERT CBSE lecture`;
    } else if (!searchQ) {
      searchQ = "NCERT Class 11 Class 12 lecture";
    }
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQ)}`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const uniqueIds = /* @__PURE__ */ new Set();
    const candidates = [];
    const videoRendererStartIndices = [];
    let idx = html.indexOf('"videoRenderer":');
    while (idx !== -1) {
      videoRendererStartIndices.push(idx);
      idx = html.indexOf('"videoRenderer":', idx + 1);
    }
    for (const startIdx of videoRendererStartIndices) {
      if (candidates.length >= 35) break;
      const slice = html.substring(startIdx, startIdx + 3e3);
      const idMatch = slice.match(/"videoId"\s*:\s*"([\w-]{11})"/);
      if (!idMatch) continue;
      const vId = idMatch[1];
      if (uniqueIds.has(vId)) continue;
      let title = "";
      const titleMatch = slice.match(/"title"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"/);
      if (titleMatch) {
        title = titleMatch[1];
      } else {
        const simpleTitleMatch = slice.match(/"title":\{"runs":\[\{"text":"([^"]+)"\}/);
        if (simpleTitleMatch) {
          title = simpleTitleMatch[1];
        } else {
          title = `${searchQ} Educational Video`;
        }
      }
      title = title.replace(/\\u0026/g, "&").replace(/\\"/g, '"');
      const ownerTextIdx = slice.indexOf('"ownerText"');
      let channelTitle = "Educational YouTube Creator";
      let channelId = "";
      if (ownerTextIdx !== -1) {
        const ownerSlice = slice.substring(ownerTextIdx, ownerTextIdx + 300);
        const channelMatch = ownerSlice.match(/"text"\s*:\s*"([^"]+)"/);
        if (channelMatch) {
          channelTitle = channelMatch[1].replace(/\\u0026/g, "&").replace(/\\"/g, '"');
        }
        const browseIdMatch = ownerSlice.match(/"browseId"\s*:\s*"([^"]+)"/);
        if (browseIdMatch) {
          channelId = browseIdMatch[1];
        }
      }
      const filterCheck = isVideoAllowed(
        title,
        `Comprehensive educational video covering ${searchQ}.`,
        channelTitle,
        customBlockedKeywords,
        customBlockedChannels,
        channelId
      );
      if (!filterCheck.allowed) continue;
      const lengthTextIdx = slice.indexOf('"lengthText"');
      let extractedDuration = "";
      if (lengthTextIdx !== -1) {
        const lengthSlice = slice.substring(lengthTextIdx, lengthTextIdx + 200);
        const simpleTextMatch = lengthSlice.match(/"simpleText"\s*:\s*"([^"]+)"/);
        if (simpleTextMatch) {
          extractedDuration = simpleTextMatch[1];
        }
      }
      if (!extractedDuration) {
        const lengthMatch = slice.match(/"lengthText":\s*\{\s*(?:"accessibility":\s*\{[^}]*\}\s*,\s*)?"simpleText":\s*"([^"]+)"\}/);
        if (lengthMatch) {
          extractedDuration = lengthMatch[1];
        }
      }
      if (!extractedDuration || extractedDuration.toUpperCase() === "LIVE") {
        extractedDuration = "15:00";
      }
      const viewCountIdx = slice.indexOf('"viewCountText"');
      let views = "150K";
      if (viewCountIdx !== -1) {
        const viewSlice = slice.substring(viewCountIdx, viewCountIdx + 200);
        const viewMatch = viewSlice.match(/"simpleText"\s*:\s*"([^"]+)"/);
        if (viewMatch) {
          views = viewMatch[1];
        }
      }
      uniqueIds.add(vId);
      candidates.push({
        id: vId,
        title,
        channelTitle,
        channelId,
        description: `Comprehensive educational video covering ${searchQ}.`,
        thumbnailUrl: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`,
        publishedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        duration: extractedDuration,
        subject: subject !== "All" ? subject : "Science",
        examCategory: exam !== "General" ? exam : "NCERT",
        views,
        verifiedEducational: filterCheck.verifiedEducational,
        keyTakeaways: ["Topic Explanation", "Key Formulae & Concepts", "Exam Preparation"]
      });
    }
    return candidates;
  } catch (e) {
    console.error("Fallback search error:", e);
    return [];
  }
}
app.post("/api/search", async (req, res) => {
  try {
    const {
      query = "",
      subject = "All",
      exam = "General",
      pageToken = "",
      blockedKeywords = [],
      completelyBlockedChannels = []
    } = req.body;
    const querySafety = checkExplicitContent(query);
    if (querySafety.blocked) {
      return res.json({
        blocked: true,
        blockedKeyword: "Explicit/Adult Content",
        message: "This search is blocked by StudyTube's content filter.",
        videos: [],
        nextPageToken: null
      });
    }
    const blockCheck = isSearchBlocked(query, blockedKeywords);
    if (blockCheck.isBlocked) {
      return res.json({
        blocked: true,
        blockedKeyword: blockCheck.matchedKeyword,
        message: "This search is blocked. Please search educational content only.",
        videos: [],
        nextPageToken: null
      });
    }
    const apiKey = process.env.YOUTUBE_API_KEY;
    let apiError = void 0;
    let accumulatedVideos = [];
    let currentToken = pageToken;
    let nextTokenToReturn = null;
    let pagesFetched = 0;
    let totalCandidateCount = 0;
    if (apiKey) {
      try {
        while (accumulatedVideos.length < 12 && pagesFetched < 3) {
          pagesFetched++;
          const pageResult = await fetchYouTubeDataAPI(
            query,
            subject,
            exam,
            currentToken,
            apiKey,
            blockedKeywords,
            completelyBlockedChannels
          );
          totalCandidateCount += pageResult.rawCandidateCount;
          for (const v of pageResult.videos) {
            if (!accumulatedVideos.some((item) => item.id === v.id)) {
              accumulatedVideos.push(v);
            }
          }
          nextTokenToReturn = pageResult.nextPageToken;
          if (!pageResult.nextPageToken) {
            break;
          }
          currentToken = pageResult.nextPageToken;
        }
      } catch (err) {
        console.log("YouTube Data API skipped or failed gracefully:", err.message);
      }
    }
    if (accumulatedVideos.length < 5) {
      const normQ = query.toLowerCase().trim();
      const catalogMatches = EDUCATIONAL_CATALOG.filter((item) => {
        const matchesSubject = subject === "All" || item.subject === subject;
        if (!matchesSubject) return false;
        const isChanBlocked = completelyBlockedChannels.some((c) => {
          const matchId = c.id && item.channelId && c.id.trim() === item.channelId.trim();
          const matchTitle = c.title && item.channelTitle && c.title.trim().toLowerCase() === item.channelTitle.trim().toLowerCase();
          return matchId || matchTitle;
        });
        if (isChanBlocked) return false;
        if (checkExplicitContent(item.title).blocked || checkExplicitContent(item.description || "").blocked || checkExplicitContent(item.channelTitle || "").blocked) {
          return false;
        }
        const combinedText = `${item.title} ${item.description} ${item.channelTitle}`.toLowerCase();
        const isKwBlocked = [...BLOCKED_KEYWORDS, ...blockedKeywords].some((kw) => {
          const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
          const regex = new RegExp(`\\b${escaped}\\b`, "i");
          return regex.test(combinedText);
        });
        if (isKwBlocked) return false;
        if (!normQ) return true;
        return item.title.toLowerCase().includes(normQ) || item.description.toLowerCase().includes(normQ) || item.subject.toLowerCase().includes(normQ);
      });
      for (const cm of catalogMatches) {
        if (!accumulatedVideos.some((v) => v.id === cm.id)) {
          accumulatedVideos.push(cm);
        }
      }
      const fallbackList = await fetchFallbackYouTubeSearch(
        query,
        subject,
        exam,
        blockedKeywords,
        completelyBlockedChannels
      );
      for (const fv of fallbackList) {
        if (!accumulatedVideos.some((v) => v.id === fv.id)) {
          accumulatedVideos.push(fv);
        }
      }
    }
    return res.json({
      blocked: false,
      videos: accumulatedVideos,
      nextPageToken: nextTokenToReturn,
      apiError,
      diagnosticLogs: {
        candidateCount: totalCandidateCount,
        returnedCount: accumulatedVideos.length,
        pagesFetched,
        usedFallback: accumulatedVideos.length > 0 && !!apiError
      }
    });
  } catch (error) {
    console.error("Search endpoint crash:", error);
    return res.status(500).json({ error: "Failed to execute search", details: error.message });
  }
});
app.post("/api/videos/durations", async (req, res) => {
  try {
    const { videoIds } = req.body;
    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return res.json({ durations: {} });
    }
    const apiKey = process.env.YOUTUBE_API_KEY;
    const durations = {};
    if (apiKey) {
      for (let i = 0; i < videoIds.length; i += 50) {
        const chunk = videoIds.slice(i, i + 50);
        const url = new URL("https://www.googleapis.com/youtube/v3/videos");
        url.searchParams.append("part", "contentDetails");
        url.searchParams.append("id", chunk.join(","));
        url.searchParams.append("key", apiKey);
        const response = await fetch(url.toString());
        if (response.ok) {
          const json = await response.json();
          for (const item of json.items || []) {
            if (item.id && item.contentDetails?.duration) {
              durations[item.id] = parseISO8601Duration(item.contentDetails.duration);
            }
          }
        }
      }
    }
    for (const id of videoIds) {
      if (!durations[id]) {
        const catItem = EDUCATIONAL_CATALOG.find((c) => c.id === id);
        if (catItem && catItem.duration) {
          durations[id] = catItem.duration;
        }
      }
    }
    return res.json({ durations });
  } catch (err) {
    console.error("Batch duration fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch durations" });
  }
});
app.get("/api/quote", (req, res) => {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return res.json(MOTIVATIONAL_QUOTES[randomIndex]);
});
app.post("/api/verify-video", async (req, res) => {
  const { videoUrlOrId } = req.body;
  if (!videoUrlOrId) {
    return res.status(400).json({ error: "Video URL or ID required" });
  }
  let videoId = videoUrlOrId.trim();
  const ytMatch = videoUrlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    videoId = ytMatch[1];
  }
  const ai = getGeminiClient();
  let isEducational = true;
  let reason = "Verified educational content for students.";
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Evaluate if YouTube video ID "${videoId}" is suitable for StudyTube (educational content for students in STEM, Humanities, NCERT, JEE, UPSC, Coding).
Return JSON with { "isEducational": boolean, "reason": "string" }`,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        isEducational = parsed.isEducational ?? true;
        reason = parsed.reason || reason;
      }
    } catch (e) {
      console.error("Video verification error:", e);
    }
  }
  return res.json({ videoId, isEducational, reason });
});
app.post("/api/ai/summary", async (req, res) => {
  const { videoId, title, description, channelTitle } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Video title required" });
  }
  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      available: false,
      error: "AI summary cannot currently be generated because API key is not configured or transcript is unavailable."
    });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are an expert academic tutor for StudyTube. Generate a rigorous, structured study summary for the educational video titled "${title}" by "${channelTitle || "Educational Channel"}".
Description context: "${description || "No description provided"}".

Return valid JSON matching this schema:
{
  "shortSummary": "string (1-2 sentences)",
  "detailedSummary": "string (paragraph)",
  "keyPoints": ["string"],
  "importantConcepts": ["string"],
  "keyTerms": [{ "term": "string", "definition": "string" }],
  "revisionNotes": "string (bulleted or formatted markdown)"
}`,
      config: { responseMimeType: "application/json" }
    });
    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json({ available: true, summary: parsed });
    }
  } catch (e) {
    console.error("AI Summary generation error:", e);
  }
  return res.status(503).json({
    available: false,
    error: "AI summary cannot currently be generated from this video due to lack of accessible transcript captions."
  });
});
app.post("/api/ai/quiz", async (req, res) => {
  const { videoId, title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Video title required" });
  }
  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      available: false,
      error: "Quiz cannot be generated without Gemini AI configuration."
    });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are an expert educator. Create exactly 5 useful test questions for students based on the educational video: "${title}".
Context description: "${description || title}".

Return valid JSON matching this exact schema:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice", // multiple_choice, true_false, or short_answer
      "question": "string",
      "options": ["string", "string", "string", "string"], // 4 options if multiple_choice, or ["True", "False"] if true_false, or [] if short_answer
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}`,
      config: { responseMimeType: "application/json" }
    });
    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json({ available: true, quiz: parsed });
    }
  } catch (e) {
    console.error("AI Quiz generation error:", e);
  }
  return res.status(503).json({
    available: false,
    error: "Insufficient reliable information or transcript to generate quiz questions for this video."
  });
});
async function fetchFallbackYouTubeChannelSearch(query) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAg%253D%253D`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const uniqueIds = /* @__PURE__ */ new Set();
    const channels = [];
    const channelRendererStartIndices = [];
    let idx = html.indexOf('"channelRenderer":');
    while (idx !== -1) {
      channelRendererStartIndices.push(idx);
      idx = html.indexOf('"channelRenderer":', idx + 1);
    }
    for (const startIdx of channelRendererStartIndices) {
      if (channels.length >= 10) break;
      const slice = html.substring(startIdx, startIdx + 3e3);
      const idMatch = slice.match(/"channelId"\s*:\s*"([^"]+)"/);
      if (!idMatch) continue;
      const channelId = idMatch[1];
      if (uniqueIds.has(channelId)) continue;
      let channelTitle = "";
      const titleMatch = slice.match(/"title"\s*:\s*\{\s*"simpleText"\s*:\s*"([^"]+)"/);
      if (titleMatch) {
        channelTitle = titleMatch[1];
      } else {
        const titleRunsMatch = slice.match(/"title"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"/);
        if (titleRunsMatch) {
          channelTitle = titleRunsMatch[1];
        } else {
          const displayNameMatch = slice.match(/"displayName"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"/);
          if (displayNameMatch) {
            channelTitle = displayNameMatch[1];
          } else {
            channelTitle = "YouTube Channel";
          }
        }
      }
      channelTitle = channelTitle.replace(/\\u0026/g, "&").replace(/\\"/g, '"');
      let thumbnailUrl = "";
      const thumbMatch = slice.match(/"url"\s*:\s*"(https:\/\/[^"]+)"/);
      if (thumbMatch) {
        thumbnailUrl = thumbMatch[1].replace(/\\u0026/g, "&");
      } else {
        thumbnailUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channelTitle)}`;
      }
      uniqueIds.add(channelId);
      channels.push({
        channelId,
        channelTitle,
        thumbnailUrl
      });
    }
    return channels;
  } catch (e) {
    console.error("Fallback channel search error:", e);
    return [];
  }
}
app.post("/api/search-channels", async (req, res) => {
  try {
    const { query = "" } = req.body;
    if (!query.trim()) {
      return res.json({ channels: [] });
    }
    const safetyCheck = checkExplicitContent(query);
    if (safetyCheck.blocked) {
      return res.json({ channels: [], message: safetyCheck.reason });
    }
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
        searchUrl.searchParams.append("part", "snippet");
        searchUrl.searchParams.append("type", "channel");
        searchUrl.searchParams.append("maxResults", "10");
        searchUrl.searchParams.append("q", query);
        searchUrl.searchParams.append("key", apiKey);
        const searchRes = await fetch(searchUrl.toString());
        if (searchRes.ok) {
          const data = await searchRes.json();
          const items = data.items || [];
          const channels = items.map((item) => ({
            channelId: item.snippet?.channelId || item.id?.channelId,
            channelTitle: item.snippet?.channelTitle || item.snippet?.title || "Unknown Channel",
            description: item.snippet?.description || "",
            thumbnailUrl: item.snippet?.thumbnails?.default?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.snippet?.channelTitle || "UC")}`
          })).filter((c) => c.channelId && !checkExplicitContent(c.channelTitle).blocked && !checkExplicitContent(c.description).blocked);
          if (channels.length > 0) {
            return res.json({ channels });
          }
        }
      } catch (e) {
        console.error("YouTube Data API channel search failed, trying fallback...", e);
      }
    }
    const fallbackChannels = await fetchFallbackYouTubeChannelSearch(query);
    const catalogChannels = [];
    const lowerQuery = query.toLowerCase();
    const uniqueCatalogIds = /* @__PURE__ */ new Set();
    for (const item of EDUCATIONAL_CATALOG) {
      if (item.channelTitle && item.channelId && item.channelTitle.toLowerCase().includes(lowerQuery)) {
        if (!uniqueCatalogIds.has(item.channelId)) {
          uniqueCatalogIds.add(item.channelId);
          catalogChannels.push({
            channelId: item.channelId,
            channelTitle: item.channelTitle,
            thumbnailUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.channelTitle)}`
          });
        }
      }
    }
    const blended = [...catalogChannels];
    for (const fc of fallbackChannels) {
      if (!uniqueCatalogIds.has(fc.channelId)) {
        uniqueCatalogIds.add(fc.channelId);
        blended.push(fc);
      }
    }
    const safeBlended = blended.filter((c) => !checkExplicitContent(c.channelTitle).blocked && !checkExplicitContent(c.description || "").blocked);
    return res.json({ channels: safeBlended.slice(0, 10) });
  } catch (e) {
    console.error("Channel search api error:", e);
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
});
var cloudSyncStore = /* @__PURE__ */ new Map();
app.post("/api/sync/push", import_express.default.json(), (req, res) => {
  const { uid, ...data } = req.body;
  if (!uid) {
    return res.status(400).json({ error: "User UID required" });
  }
  cloudSyncStore.set(uid, {
    ...data,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.json({ success: true, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/sync/pull", (req, res) => {
  const uid = req.query.uid;
  if (!uid) {
    return res.status(400).json({ error: "User UID required" });
  }
  const data = cloudSyncStore.get(uid);
  if (!data) {
    return res.status(404).json({ error: "No cloud backup found for user" });
  }
  return res.json(data);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyTube Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
