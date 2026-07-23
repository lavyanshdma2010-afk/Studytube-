/**
 * StudyTube Focus Environment
 * Permanent System-Level Explicit & Adult Content Filter
 */

// Clearly explicit / adult entertainment signature terms
const EXPLICIT_SIGNATURES = [
  // Core explicit
  'porn', 'porno', 'pornography', 'pornstar', 'xxx', 'xvideos', 'pornhub', 'redtube', 'xhamster',
  'hentai', 'milf', 'erotica', 'erotic', 'slut', 'whore', 'bitch', 'fuck', 'fucker', 'motherfucker',
  
  // Anatomy slang & explicit acts
  'boobs', 'tits', 'titties', 'pussy', 'dick', 'cock', 'blowjob', 'handjob', 'cum', 'cumming', 'semen',
  'orgasm', 'masturbate', 'masturbation', 'squirting', 'creampie', 'gloryhole', 'bukakke', 'dildo', 'vibrator', 'sex toy',
  
  // Acts / Kinks
  'hardcore', 'softcore', 'bdsm', 'fetish', 'anal', 'striptease', 'strip club', 'sensual', 'sexy',
  'lust', 'incest', 'kinky', 'threesome', 'orgy', 'gangbang', 'shibari', 'voyeur', 'exhibitionist', 'nympho',
  
  // Industry / Culture
  'playboy', 'onlyfans', 'camgirl', 'webcam girl', 'escort', 'prostitute', 'prostitution',
  'brazzers', 'bangbros', 'rule 34', 'rule34', 'nsfw', '18+', 'x-rated', 'mature content',
  'smut', 'lemon', 'doujinshi', 'yaoi', 'yuri', 'ahegao',
  
  // Context specific explicit phrasing
  'sex video', 'sex movie', 'sexy video', 'hot video', 'hot scene', 'hot girl', 'hot babe', 'hot women', 'hot guy',
  'nude', 'naked', 'nudity', 'nudist', 'uncensored', 'bikini haul', 'lingerie haul', 'sex tape', 'sex scene',
  'stepmom', 'stepsister', 'step fantasy'
];

// Pre-compute regexes for performance
const EXPLICIT_REGEXES = EXPLICIT_SIGNATURES.map(term => {
  const escapedTermChars = term.split('').map(c => {
    if (c === ' ') return '\\s+';
    return c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  });
  const spacedPattern = escapedTermChars.join('[\\s\\-_\\.\\*\\?\\!]*');
  // Match with non-word boundaries or start/end.
  // Allow common variations (s, es, ing, ed, y, er, ers).
  return {
    term,
    regex: new RegExp(`(?:^|\\W)${spacedPattern}(?:s|es|ing|ed|y|er|ers)?(?:\\W|$)`, 'i')
  };
});

// Anatomy / biology / medical terms that may be educational but can be misused
const ANATOMY_BIOLOGY_TERMS = [
  'reproduction', 'reproductive', 'anatomy', 'biology', 'vagina', 'penis', 'clitoris',
  'uterus', 'puberty', 'ovary', 'testes', 'testicles', 'sperm', 'fertilization', 'egg cell', 'hormone',
  'endocrine', 'urinary', 'bladder', 'menstruation', 'menstrual', 'copulation', 'intercourse',
  'sex', 'sexual', 'sexuality', 'breasts', 'nipples', 'genitals', 'genitalia', 'scrotum', 'prostate',
  'gynecology', 'urology', 'obstetrics', 'mating', 'spawning'
];

// Pre-compute anatomy regexes
const ANATOMY_REGEXES = ANATOMY_BIOLOGY_TERMS.map(term => {
  const escapedTermChars = term.split('').map(c => {
    if (c === ' ') return '\\s+';
    return c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  });
  const spacedPattern = escapedTermChars.join('[\\s\\-_\\.\\*\\?\\!]*');
  return {
    term,
    regex: new RegExp(`(?:^|\\W)${spacedPattern}(?:s|es|ing|ed|y|al|ity)?(?:\\W|$)`, 'i')
  };
});

// High confidence educational keywords that indicate school/academic context
const EDUCATIONAL_CONTEXT_CUES = [
  'class 11', 'class 12', 'class 10', 'class 9', 'class 8', 'class 7', 'class 6',
  'ncert', 'cbse', 'icse', 'upsc', 'jee', 'neet', 'ias', 'gate exam', 'board exam',
  'syllabus', 'curriculum', 'iit jee', 'board preparation', 'lecture', 'tutorial',
  'learn', 'course', 'education', 'study guide', 'revision', 'crash course', 'one shot',
  'full chapter', 'explanation', 'introduction to', 'science', 'diagram', 'textbook',
  'academy', 'professor', 'teacher', 'coaching', 'school', 'college', 'university',
  'khan academy', 'crashcourse', 'nptel', 'ted-ed', 'lesson', 'physiology', 'clinical',
  'medical lecture', 'academic', 'subject', 'exam', 'documentary', 'history', 'human',
  'system', 'health', 'disease', 'condition', 'treatment', 'medical', 'medicine',
  'research', 'study', 'scientist', 'discovery', 'mechanism', 'development',
  'plants', 'animals', 'organisms', 'species', 'cellular', 'genetic', 'genes',
  'dna', 'rna', 'chromosome', 'evolution', 'life cycle', 'cell', 'function', 'structure'
];

/**
 * Normalizes text to defend against spacing, punctuation, and leetspeak bypasses.
 */
export function normalizeTextForSafety(text: string): string {
  if (!text) return '';
  
  // Lowercase and remove accents
  let normalized = text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Common leetspeak translations
  normalized = normalized
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/!/g, 'i')
    .replace(/\|/g, 'i');

  return normalized;
}

/**
 * Checks if a string contains any of the explicit words, considering spaced-out letters (e.g. p o r n).
 */
function containsExplicitSignature(normalizedText: string): { matched: boolean; term?: string } {
  // Check against pre-computed regexes
  for (const { term, regex } of EXPLICIT_REGEXES) {
    if (regex.test(normalizedText)) {
      return { matched: true, term };
    }
  }

  return { matched: false };
}

/**
 * Checks if a string contains biology/anatomy terms, considering spaced-out letters.
 */
function findAnatomyTerms(normalizedText: string): string[] {
  const found: string[] = [];
  for (const { term, regex } of ANATOMY_REGEXES) {
    if (regex.test(normalizedText)) {
      found.push(term);
    }
  }
  return found;
}

/**
 * Checks if a string contains educational context cues.
 */
function hasEducationalCues(normalizedText: string): boolean {
  for (const cue of EDUCATIONAL_CONTEXT_CUES) {
    const regex = new RegExp(`\\b${cue.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalizedText)) {
      return true;
    }
  }
  return false;
}

/**
 * Main evaluation function for the explicit content filter.
 * 
 * Returns { blocked: boolean, reason?: string }
 */
export function checkExplicitContent(text: string): { blocked: boolean; reason?: string } {
  if (!text) return { blocked: false };
  
  const normalized = normalizeTextForSafety(text);

  // 1. Direct check for any strictly explicit adult signatures
  const sigCheck = containsExplicitSignature(normalized);
  if (sigCheck.matched) {
    return { 
      blocked: true, 
      reason: `Blocked by StudyTube Content Filter (Adult Category: "${sigCheck.term}")` 
    };
  }

  // 2. Check for anatomy/biology terms
  const matchedAnatomy = findAnatomyTerms(normalized);
  if (matchedAnatomy.length > 0) {
    // If anatomy terms are present, check if there is strong educational context
    if (hasEducationalCues(normalized)) {
      // It is a legitimate educational context! Do not block.
      return { blocked: false };
    } else {
      // Missing educational context for sensitive anatomy terms
      return { 
        blocked: true, 
        reason: `Access to anatomy/biology term "${matchedAnatomy[0]}" requires educational context (e.g. "class", "biology", "lecture").` 
      };
    }
  }

  return { blocked: false };
}
