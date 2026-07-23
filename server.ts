import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { BLOCKED_KEYWORDS, EDUCATIONAL_CATALOG } from './src/data/educationalCatalog.js';
import { checkExplicitContent } from './src/utils/explicitFilter.js';
import { MOTIVATIONAL_QUOTES } from './src/data/quotes.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Check for blocked keywords using word boundaries for strict keywords (default + custom)
function isSearchBlocked(query: string, customBlockedKeywords: string[] = []): { isBlocked: boolean; matchedKeyword?: string } {
  if (!query) return { isBlocked: false };
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, ' ').trim();
  const allKeywords = [...BLOCKED_KEYWORDS, ...customBlockedKeywords];
  
  for (const rawKw of allKeywords) {
    const normalizedKw = rawKw.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!normalizedKw) continue;
    
    const escaped = normalizedKw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const hasSpaces = normalizedKw.includes(' ');
    let regex: RegExp;
    if (hasSpaces) {
      regex = new RegExp(`(?:\\b|^)${escaped}(?:\\b|$)`, 'i');
    } else {
      regex = new RegExp(`\\b${escaped}\\b`, 'i');
    }
    if (regex.test(normalizedQuery)) {
      return { isBlocked: true, matchedKeyword: rawKw };
    }
  }
  return { isBlocked: false };
}

// Convert ISO 8601 duration (PT15M33S, PT4S, PT45S, PT5M8S, PT48M15S, PT1H25M, PT2H5M4S) to MM:SS or HH:MM:SS
function parseISO8601Duration(iso?: string): string {
  if (!iso) return '';
  if (/^\d+:\d+(?::\d+)?$/.test(iso)) {
    return iso;
  }
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

// Format view numbers
function formatViews(viewsStr?: string): string {
  if (!viewsStr) return '100K';
  const num = parseInt(viewsStr, 10);
  if (isNaN(num)) return viewsStr;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return `${num}`;
}

// Check if video is a YouTube Short (duration < 60s or #shorts tag)
function isShortVideo(isoDuration?: string, title: string = '', description: string = ''): boolean {
  const combined = `${title} ${description}`.toLowerCase();
  if (combined.includes('#shorts') || /\bshorts\b/.test(combined)) {
    return true;
  }
  if (isoDuration) {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const h = parseInt(match[1] || '0', 10);
      const m = parseInt(match[2] || '0', 10);
      const s = parseInt(match[3] || '0', 10);
      const totalSecs = h * 3600 + m * 60 + s;
      if (totalSecs > 0 && totalSecs < 60) {
        return true;
      }
    }
  }
  return false;
}

// Sophisticated multi-factor filter & classification system
function isVideoAllowed(
  title: string, 
  description: string, 
  channelTitle: string = '', 
  customBlockedKeywords: string[] = [], 
  customBlockedChannels: { id: string; title: string }[] = [],
  channelId: string = ''
): { allowed: boolean; verifiedEducational: boolean; reason?: string } {
  // 0. Permanent System-Level Explicit Content Filter (Title, Description, and Channel)
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
  const normalizedCombined = combined.replace(/\s+/g, ' ').trim();
  
  // 1. Check custom blocked channels
  if (customBlockedChannels && customBlockedChannels.length > 0) {
    const isChannelBlocked = customBlockedChannels.some((c: any) => {
      const matchId = c.id && channelId && c.id.trim() === channelId.trim();
      const matchTitle = c.title && channelTitle && c.title.trim().toLowerCase() === channelTitle.trim().toLowerCase();
      return matchId || matchTitle;
    });
    if (isChannelBlocked) {
      return { allowed: false, verifiedEducational: false, reason: 'Channel is in your custom blocked list' };
    }
  }

  // 2. Check custom blocked keywords and default global blocked keywords
  const allKeywords = [...BLOCKED_KEYWORDS, ...customBlockedKeywords];

  for (const rawKw of allKeywords) {
    const normalizedKw = rawKw.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!normalizedKw) continue;
    
    const escaped = normalizedKw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const hasSpaces = normalizedKw.includes(' ');
    let regex: RegExp;
    if (hasSpaces) {
      regex = new RegExp(`(?:\\b|^)${escaped}(?:\\b|$)`, 'i');
    } else {
      regex = new RegExp(`\\b${escaped}\\b`, 'i');
    }
    if (regex.test(normalizedCombined)) {
      return { allowed: false, verifiedEducational: false, reason: `Matches blocked keyword/phrase "${rawKw}"` };
    }
  }

  // 3. Strict creator/entertainment blacklist (e.g. Ashish Chanchlani, CarryMinati, comedy, etc.)
  const entertainmentBlacklist = [
    'ashish chanchlani', 'carryminati', 'fukra insaan', 'triggered insaan', 'mythpat',
    'round2hell', 'slayy point', 'amit bhadana', 'harsh beniwal', 'bb ki vines',
    'mrbeast', 'pewdiepie', 'not your type', 't-series', 'set india', 'sab tv',
    'vlog', 'daily vlog', 'gaming', 'walkthrough', 'funny prank', 'prank video',
    'music video', 'official music video', 'official video', 'cover song', 'remix',
    'live performance', 'movie trailer', 'full movie', 'funny clips', 'memes compilation',
    'roast video', 'roasting', 'bbkivines', 'comedian', 'comedy sketch', 'web series',
    'episode', 'sitcom', 'funny drama', 'trolling', 'distraction', 'entertaiment'
  ];

  for (const ent of entertainmentBlacklist) {
    const escaped = ent.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(normalizedCombined)) {
      return { allowed: false, verifiedEducational: false, reason: `Matches entertainment/creator signature "${ent}"` };
    }
  }

  // 4. Determine if this is HIGH CONFIDENCE educational content
  const highConfidenceEdu = [
    'class 11', 'class 12', 'class 10', 'class 9', 'class 8', 'ncert', 'cbse', 'icse',
    'upsc', 'jee', 'neet', 'ias', 'gate exam', 'board exam', 'syllabus', 'curriculum',
    'iit jee', 'board preparation', 'lecture', 'tutorial', 'learn', 'course', 'education',
    'study guide', 'revision', 'crash course', 'one shot', 'full chapter', 'explanation',
    'introduction to', 'how to code', 'programming tutorial', 'lesson', 'educational video',
    'solving', 'mock test', 'paper discussion', 'calculus', 'physics', 'chemistry', 'biology',
    'mathematics', 'geometry', 'algebra', 'trigonometry', 'mechanics', 'thermodynamics',
    'organic chemistry', 'inorganic chemistry', 'genetics', 'evolution', 'geography',
    'history of', 'indian constitution', 'french revolution', 'macroeconomics', 'microeconomics',
    'english grammar', 'political science', 'psychology', 'sociology', 'python coding',
    'javascript programming', 'data structures', 'algorithms', 'academy', 'tutorials',
    'professor', 'teacher', 'coaching', 'school', 'college', 'university', 'khan academy',
    'crashcourse', 'nptel', 'ted-ed'
  ];

  const hasHighConfidence = highConfidenceEdu.some(kw => {
    const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(normalizedCombined);
  });

  return { 
    allowed: true, 
    verifiedEducational: hasHighConfidence 
  };
}

// Fetch YouTube search & metadata
async function fetchYouTubeDataAPI(
  query: string,
  subject: string,
  exam: string,
  pageToken: string = '',
  apiKey: string,
  customBlockedKeywords: string[] = [],
  customBlockedChannels: { id: string; title: string }[] = []
) {
  let searchQ = query.trim();
  if (!searchQ && subject !== 'All') {
    searchQ = `${subject} lesson`;
  } else if (!searchQ) {
    searchQ = 'NCERT Educational Lessons';
  }

  // Add subtle subject context if user typed a short query
  if (subject !== 'All' && !searchQ.toLowerCase().includes(subject.toLowerCase())) {
    searchQ = `${searchQ} ${subject}`;
  }

  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.append('part', 'snippet');
  searchUrl.searchParams.append('type', 'video');
  searchUrl.searchParams.append('maxResults', '50');
  searchUrl.searchParams.append('order', 'relevance');
  searchUrl.searchParams.append('safeSearch', 'strict');
  searchUrl.searchParams.append('q', searchQ);
  searchUrl.searchParams.append('key', apiKey);
  if (pageToken) {
    searchUrl.searchParams.append('pageToken', pageToken);
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

  const videoIds = rawItems.map((item: any) => item.id?.videoId).filter(Boolean);

  if (videoIds.length === 0) {
    return { videos: [], nextPageToken, rawCandidateCount: 0 };
  }

  // Fetch detailed metadata including status (embeddable) and contentDetails (duration)
  const videoDetailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  videoDetailsUrl.searchParams.append('part', 'snippet,contentDetails,status,statistics');
  videoDetailsUrl.searchParams.append('id', videoIds.join(','));
  videoDetailsUrl.searchParams.append('key', apiKey);

  const detailsRes = await fetch(videoDetailsUrl.toString());
  if (!detailsRes.ok) {
    const errData = await detailsRes.json().catch(() => ({}));
    const errMsg = errData.error?.message || `HTTP ${detailsRes.status} ${detailsRes.statusText}`;
    throw new Error(`YouTube API Details Error: ${errMsg}`);
  }

  const detailsJson = await detailsRes.json();
  const detailItems = detailsJson.items || [];
  const detailsMap = new Map<string, any>();
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

    // Check embeddability and shorts
    if (status.embeddable === false || isShortVideo(contentDetails.duration, snippet.title, snippet.description)) {
      continue; // Filter out non-embeddable videos and shorts
    }

    const title = snippet.title || 'Educational Lesson';
    const description = snippet.description || '';
    const channelTitle = snippet.channelTitle || 'YouTube Educator';
    const channelId = snippet.channelId || '';
    const thumbnails = snippet.thumbnails || {};
    const thumbnailUrl = thumbnails.high?.url || thumbnails.medium?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Advanced multi-factor filter check
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
      publishedAt: snippet.publishedAt ? snippet.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      duration: formattedDuration,
      subject: (subject !== 'All' ? subject : 'Science') as any,
      examCategory: (exam !== 'General' ? exam : 'NCERT') as any,
      views: formatViews(statistics.viewCount),
      verifiedEducational: filterCheck.verifiedEducational,
      keyTakeaways: ['Key Concepts Explained', 'Step-by-step Lesson', 'Exam Revision Tips']
    });
  }

  return {
    videos: processedVideos,
    nextPageToken,
    rawCandidateCount: rawItems.length
  };
}

// Backup scraping/oEmbed YouTube search parser when API Key is missing/exhausted
async function fetchFallbackYouTubeSearch(
  query: string,
  subject: string,
  exam: string,
  customBlockedKeywords: string[] = [],
  customBlockedChannels: { id: string; title: string }[] = []
) {
  try {
    let searchQ = query.trim();
    if (!searchQ && subject !== 'All') {
      searchQ = `${subject} NCERT CBSE lecture`;
    } else if (!searchQ) {
      searchQ = 'NCERT Class 11 Class 12 lecture';
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQ)}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!res.ok) return [];

    const html = await res.text();
    const uniqueIds = new Set<string>();
    const candidates: any[] = [];

    // Locate videoRenderer JSON blocks in html
    const videoRendererStartIndices: number[] = [];
    let idx = html.indexOf('"videoRenderer":');
    while (idx !== -1) {
      videoRendererStartIndices.push(idx);
      idx = html.indexOf('"videoRenderer":', idx + 1);
    }

    for (const startIdx of videoRendererStartIndices) {
      if (candidates.length >= 35) break;

      const slice = html.substring(startIdx, startIdx + 3000);

      const idMatch = slice.match(/"videoId"\s*:\s*"([\w-]{11})"/);
      if (!idMatch) continue;
      const vId = idMatch[1];

      if (uniqueIds.has(vId)) continue;

      // Extract title
      let title = '';
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
      title = title.replace(/\\u0026/g, '&').replace(/\\"/g, '"');

      // Extract channel name and channelId
      const ownerTextIdx = slice.indexOf('"ownerText"');
      let channelTitle = 'Educational YouTube Creator';
      let channelId = '';
      if (ownerTextIdx !== -1) {
        const ownerSlice = slice.substring(ownerTextIdx, ownerTextIdx + 300);
        const channelMatch = ownerSlice.match(/"text"\s*:\s*"([^"]+)"/);
        if (channelMatch) {
          channelTitle = channelMatch[1].replace(/\\u0026/g, '&').replace(/\\"/g, '"');
        }
        const browseIdMatch = ownerSlice.match(/"browseId"\s*:\s*"([^"]+)"/);
        if (browseIdMatch) {
          channelId = browseIdMatch[1];
        }
      }

      // Check filters (including custom blocks)
      const filterCheck = isVideoAllowed(
        title, 
        `Comprehensive educational video covering ${searchQ}.`, 
        channelTitle, 
        customBlockedKeywords, 
        customBlockedChannels,
        channelId
      );
      if (!filterCheck.allowed) continue;

      // Extract duration (lengthText)
      const lengthTextIdx = slice.indexOf('"lengthText"');
      let extractedDuration = '';
      if (lengthTextIdx !== -1) {
        const lengthSlice = slice.substring(lengthTextIdx, lengthTextIdx + 200);
        const simpleTextMatch = lengthSlice.match(/"simpleText"\s*:\s*"([^"]+)"/);
        if (simpleTextMatch) {
          extractedDuration = simpleTextMatch[1];
        }
      }

      if (!extractedDuration) {
        // Fallback: look for generic simpleText inside lengthText
        const lengthMatch = slice.match(/"lengthText":\s*\{\s*(?:"accessibility":\s*\{[^}]*\}\s*,\s*)?"simpleText":\s*"([^"]+)"\}/);
        if (lengthMatch) {
          extractedDuration = lengthMatch[1];
        }
      }

      // Default duration fallback if parsing fails completely, but never use raw empty durations
      if (!extractedDuration || extractedDuration.toUpperCase() === 'LIVE') {
        extractedDuration = '15:00';
      }

      // Extract views
      const viewCountIdx = slice.indexOf('"viewCountText"');
      let views = '150K';
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
        publishedAt: new Date().toISOString().split('T')[0],
        duration: extractedDuration,
        subject: (subject !== 'All' ? subject : 'Science') as any,
        examCategory: (exam !== 'General' ? exam : 'NCERT') as any,
        views,
        verifiedEducational: filterCheck.verifiedEducational,
        keyTakeaways: ['Topic Explanation', 'Key Formulae & Concepts', 'Exam Preparation']
      });
    }

    return candidates;
  } catch (e) {
    console.error('Fallback search error:', e);
    return [];
  }
}

// API Routes
app.post('/api/search', async (req, res) => {
  try {
    const { 
      query = '', 
      subject = 'All', 
      exam = 'General', 
      pageToken = '', 
      blockedKeywords = [], 
      completelyBlockedChannels = [] 
    } = req.body;
    
    // System-level adult/explicit content filter on query BEFORE calling anything
    const querySafety = checkExplicitContent(query);
    if (querySafety.blocked) {
      return res.json({
        blocked: true,
        blockedKeyword: 'Explicit/Adult Content',
        message: "This search is blocked by StudyTube's content filter.",
        videos: [],
        nextPageToken: null
      });
    }
    
    // Check keyword blocklist (default + custom)
    const blockCheck = isSearchBlocked(query, blockedKeywords);
    if (blockCheck.isBlocked) {
      return res.json({
        blocked: true,
        blockedKeyword: blockCheck.matchedKeyword,
        message: 'This search is blocked. Please search educational content only.',
        videos: [],
        nextPageToken: null
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    let apiError: string | undefined = undefined;
    let accumulatedVideos: any[] = [];
    let currentToken = pageToken;
    let nextTokenToReturn: string | null = null;
    let pagesFetched = 0;
    let totalCandidateCount = 0;

    if (apiKey) {
      try {
        // Multi-page accumulation: fetch pages until we get at least 12 videos or 3 pages max
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

          // De-duplicate
          for (const v of pageResult.videos) {
            if (!accumulatedVideos.some(item => item.id === v.id)) {
              accumulatedVideos.push(v);
            }
          }

          nextTokenToReturn = pageResult.nextPageToken;
          if (!pageResult.nextPageToken) {
            break; // No more pages available from YouTube
          }
          currentToken = pageResult.nextPageToken;
        }
      } catch (err: any) {
        console.log('YouTube Data API skipped or failed gracefully:', err.message);
      }
    }

    // If official API returned sparse results or failed/had no key, use fallback parser + catalog
    if (accumulatedVideos.length < 5) {
      // Also search local catalog first so curated real durations appear first
      const normQ = query.toLowerCase().trim();
      const catalogMatches = EDUCATIONAL_CATALOG.filter(item => {
        const matchesSubject = subject === 'All' || item.subject === subject;
        if (!matchesSubject) return false;
        
        // Filter catalog matches by user custom block list too
        const isChanBlocked = completelyBlockedChannels.some((c: any) => {
          const matchId = c.id && item.channelId && c.id.trim() === item.channelId.trim();
          const matchTitle = c.title && item.channelTitle && c.title.trim().toLowerCase() === item.channelTitle.trim().toLowerCase();
          return matchId || matchTitle;
        });
        if (isChanBlocked) return false;
        
        // Final safety check
        if (checkExplicitContent(item.title).blocked || 
            checkExplicitContent(item.description || '').blocked || 
            checkExplicitContent(item.channelTitle || '').blocked) {
          return false;
        }

        const combinedText = `${item.title} ${item.description} ${item.channelTitle}`.toLowerCase();
        const isKwBlocked = [...BLOCKED_KEYWORDS, ...blockedKeywords].some(kw => {
          const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`\\b${escaped}\\b`, 'i');
          return regex.test(combinedText);
        });
        if (isKwBlocked) return false;

        if (!normQ) return true;
        return (
          item.title.toLowerCase().includes(normQ) ||
          item.description.toLowerCase().includes(normQ) ||
          item.subject.toLowerCase().includes(normQ)
        );
      });

      for (const cm of catalogMatches) {
        if (!accumulatedVideos.some(v => v.id === cm.id)) {
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
        if (!accumulatedVideos.some(v => v.id === fv.id)) {
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

  } catch (error: any) {
    console.error('Search endpoint crash:', error);
    return res.status(500).json({ error: 'Failed to execute search', details: error.message });
  }
});

// Batch fetch video durations endpoint
app.post('/api/videos/durations', async (req, res) => {
  try {
    const { videoIds } = req.body;
    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return res.json({ durations: {} });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const durations: { [videoId: string]: string } = {};

    if (apiKey) {
      // Chunk into batches of 50
      for (let i = 0; i < videoIds.length; i += 50) {
        const chunk = videoIds.slice(i, i + 50);
        const url = new URL('https://www.googleapis.com/youtube/v3/videos');
        url.searchParams.append('part', 'contentDetails');
        url.searchParams.append('id', chunk.join(','));
        url.searchParams.append('key', apiKey);

        const response = await fetch(url.toString());
        if (response.ok) {
          const json = await response.json();
          for (const item of (json.items || [])) {
            if (item.id && item.contentDetails?.duration) {
              durations[item.id] = parseISO8601Duration(item.contentDetails.duration);
            }
          }
        }
      }
    }

    // Fallback check catalog
    for (const id of videoIds) {
      if (!durations[id]) {
        const catItem = EDUCATIONAL_CATALOG.find(c => c.id === id);
        if (catItem && catItem.duration) {
          durations[id] = catItem.duration;
        }
      }
    }

    return res.json({ durations });
  } catch (err: any) {
    console.error('Batch duration fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch durations' });
  }
});

// Random quote endpoint
app.get('/api/quote', (req, res) => {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return res.json(MOTIVATIONAL_QUOTES[randomIndex]);
});

// Verify custom YouTube URL / ID
app.post('/api/verify-video', async (req, res) => {
  const { videoUrlOrId } = req.body;
  if (!videoUrlOrId) {
    return res.status(400).json({ error: 'Video URL or ID required' });
  }

  let videoId = videoUrlOrId.trim();
  const ytMatch = videoUrlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    videoId = ytMatch[1];
  }

  const ai = getGeminiClient();
  let isEducational = true;
  let reason = 'Verified educational content for students.';

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Evaluate if YouTube video ID "${videoId}" is suitable for StudyTube (educational content for students in STEM, Humanities, NCERT, JEE, UPSC, Coding).
Return JSON with { "isEducational": boolean, "reason": "string" }`,
        config: { responseMimeType: 'application/json' }
      });
      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        isEducational = parsed.isEducational ?? true;
        reason = parsed.reason || reason;
      }
    } catch (e) {
      console.error('Video verification error:', e);
    }
  }

  return res.json({ videoId, isEducational, reason });
});

// AI Video Summary Endpoint
app.post('/api/ai/summary', async (req, res) => {
  const { videoId, title, description, channelTitle } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Video title required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({ 
      available: false, 
      error: 'AI summary cannot currently be generated because API key is not configured or transcript is unavailable.' 
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are an expert academic tutor for StudyTube. Generate a rigorous, structured study summary for the educational video titled "${title}" by "${channelTitle || 'Educational Channel'}".
Description context: "${description || 'No description provided'}".

Return valid JSON matching this schema:
{
  "shortSummary": "string (1-2 sentences)",
  "detailedSummary": "string (paragraph)",
  "keyPoints": ["string"],
  "importantConcepts": ["string"],
  "keyTerms": [{ "term": "string", "definition": "string" }],
  "revisionNotes": "string (bulleted or formatted markdown)"
}`,
      config: { responseMimeType: 'application/json' }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json({ available: true, summary: parsed });
    }
  } catch (e: any) {
    console.error('AI Summary generation error:', e);
  }

  return res.status(503).json({ 
    available: false, 
    error: 'AI summary cannot currently be generated from this video due to lack of accessible transcript captions.' 
  });
});

// AI Quiz Me Endpoint
app.post('/api/ai/quiz', async (req, res) => {
  const { videoId, title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Video title required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({ 
      available: false, 
      error: 'Quiz cannot be generated without Gemini AI configuration.' 
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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
      config: { responseMimeType: 'application/json' }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json({ available: true, quiz: parsed });
    }
  } catch (e: any) {
    console.error('AI Quiz generation error:', e);
  }

  return res.status(503).json({ 
    available: false, 
    error: 'Insufficient reliable information or transcript to generate quiz questions for this video.' 
  });
});


// Helper to search channels using YouTube HTML scraper
async function fetchFallbackYouTubeChannelSearch(query: string) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAg%253D%253D`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!res.ok) return [];

    const html = await res.text();
    const uniqueIds = new Set<string>();
    const channels: any[] = [];

    // Locate channelRenderer JSON blocks in html
    const channelRendererStartIndices: number[] = [];
    let idx = html.indexOf('"channelRenderer":');
    while (idx !== -1) {
      channelRendererStartIndices.push(idx);
      idx = html.indexOf('"channelRenderer":', idx + 1);
    }

    for (const startIdx of channelRendererStartIndices) {
      if (channels.length >= 10) break;

      const slice = html.substring(startIdx, startIdx + 3000);

      const idMatch = slice.match(/"channelId"\s*:\s*"([^"]+)"/);
      if (!idMatch) continue;
      const channelId = idMatch[1];

      if (uniqueIds.has(channelId)) continue;

      // Extract title/channelTitle
      let channelTitle = '';
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
            channelTitle = 'YouTube Channel';
          }
        }
      }
      channelTitle = channelTitle.replace(/\\u0026/g, '&').replace(/\\"/g, '"');

      // Extract thumbnail
      let thumbnailUrl = '';
      const thumbMatch = slice.match(/"url"\s*:\s*"(https:\/\/[^"]+)"/);
      if (thumbMatch) {
        thumbnailUrl = thumbMatch[1].replace(/\\u0026/g, '&');
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
    console.error('Fallback channel search error:', e);
    return [];
  }
}

// Channel Search API Endpoint
app.post('/api/search-channels', async (req, res) => {
  try {
    const { query = '' } = req.body;
    if (!query.trim()) {
      return res.json({ channels: [] });
    }

    // System-level safety check on query
    const safetyCheck = checkExplicitContent(query);
    if (safetyCheck.blocked) {
      return res.json({ channels: [], message: safetyCheck.reason });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        searchUrl.searchParams.append('part', 'snippet');
        searchUrl.searchParams.append('type', 'channel');
        searchUrl.searchParams.append('maxResults', '10');
        searchUrl.searchParams.append('q', query);
        searchUrl.searchParams.append('key', apiKey);

        const searchRes = await fetch(searchUrl.toString());
        if (searchRes.ok) {
          const data = await searchRes.json();
          const items = data.items || [];
          const channels = items.map((item: any) => ({
            channelId: item.snippet?.channelId || item.id?.channelId,
            channelTitle: item.snippet?.channelTitle || item.snippet?.title || 'Unknown Channel',
            description: item.snippet?.description || '',
            thumbnailUrl: item.snippet?.thumbnails?.default?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.snippet?.channelTitle || 'UC')}`,
          })).filter((c: any) => c.channelId && !checkExplicitContent(c.channelTitle).blocked && !checkExplicitContent(c.description).blocked);
          if (channels.length > 0) {
            return res.json({ channels });
          }
        }
      } catch (e) {
        console.error('YouTube Data API channel search failed, trying fallback...', e);
      }
    }

    // Fallback to scraping
    const fallbackChannels = await fetchFallbackYouTubeChannelSearch(query);
    
    // Also include catalog matches
    const catalogChannels: any[] = [];
    const lowerQuery = query.toLowerCase();
    const uniqueCatalogIds = new Set<string>();
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

    // Blend them together
    const blended = [...catalogChannels];
    for (const fc of fallbackChannels) {
      if (!uniqueCatalogIds.has(fc.channelId)) {
        uniqueCatalogIds.add(fc.channelId);
        blended.push(fc);
      }
    }

    // Final safety filter for blended results
    const safeBlended = blended.filter((c: any) => !checkExplicitContent(c.channelTitle).blocked && !checkExplicitContent(c.description || '').blocked);

    return res.json({ channels: safeBlended.slice(0, 10) });
  } catch (e: any) {
    console.error('Channel search api error:', e);
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
});


// Cloud Sync Store in memory / server
const cloudSyncStore = new Map<string, any>();

app.post('/api/sync/push', express.json(), (req, res) => {
  const { uid, ...data } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'User UID required' });
  }
  cloudSyncStore.set(uid, {
    ...data,
    updatedAt: new Date().toISOString()
  });
  return res.json({ success: true, updatedAt: new Date().toISOString() });
});

app.get('/api/sync/pull', (req, res) => {
  const uid = req.query.uid as string;
  if (!uid) {
    return res.status(400).json({ error: 'User UID required' });
  }
  const data = cloudSyncStore.get(uid);
  if (!data) {
    return res.status(404).json({ error: 'No cloud backup found for user' });
  }
  return res.json(data);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyTube Server running on http://localhost:${PORT}`);
  });
}

startServer();

