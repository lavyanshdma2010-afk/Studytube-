import { SearchResult, SubjectCategory, VideoItem } from '../types';
import { EDUCATIONAL_CATALOG, BLOCKED_KEYWORDS } from '../data/educationalCatalog';
import { StorageService } from './storageService';

import { checkExplicitContent } from '../utils/explicitFilter';

export class VideoService {
  static async enrichVideosWithDurations(videos: VideoItem[]): Promise<VideoItem[]> {
    if (!videos || videos.length === 0) return videos;

    // Clone videos and their properties to avoid mutating imported static arrays (which causes React 19 static flag issues)
    const clonedVideos = videos.map(v => ({ ...v }));
    const cache = StorageService.getDurationCache();
    const missingIds: string[] = [];

    for (const v of clonedVideos) {
      if (cache[v.id]) {
        v.duration = cache[v.id];
      } else if (!v.duration || v.duration === '15:00' || v.duration === '') {
        missingIds.push(v.id);
      }
    }

    const allIds = clonedVideos.map(v => v.id).filter(id => !cache[id]);
    const uniqueIds = Array.from(new Set([...missingIds, ...allIds]));

    if (uniqueIds.length > 0) {
      try {
        const response = await fetch('/api/videos/durations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoIds: uniqueIds })
        });

        if (response.ok) {
          const data = await response.json();
          const durations = data.durations || {};
          StorageService.cacheDurations(durations);

          for (const v of clonedVideos) {
            if (durations[v.id]) {
              v.duration = durations[v.id];
            } else if (cache[v.id]) {
              v.duration = cache[v.id];
            }
          }
        }
      } catch (e) {
        console.warn('Failed to batch fetch durations:', e);
      }
    } else {
      for (const v of clonedVideos) {
        if (cache[v.id]) {
          v.duration = cache[v.id];
        }
      }
    }

    return clonedVideos;
  }

  static async searchVideos(
    query: string,
    subject: SubjectCategory = 'All',
    exam: string = 'General',
    pageToken?: string
  ): Promise<SearchResult> {
    // 0. Permanent System-Level Explicit Content Filter (Query Inspection)
    if (query) {
      const explicitCheck = checkExplicitContent(query);
      if (explicitCheck.blocked) {
        return {
          blocked: true,
          blockedKeyword: 'Explicit/Adult Content',
          message: "This search is blocked by StudyTube's content filter.",
          videos: [],
          nextPageToken: null
        };
      }
    }

    // Client-side quick keyword safety guard (including custom blocked keywords)
    if (query && StorageService.isKeywordBlocked(query)) {
      return {
        blocked: true,
        blockedKeyword: query,
        message: "This search contains content you've blocked in StudyTube.",
        videos: [],
        nextPageToken: null
      };
    }

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          subject, 
          exam, 
          pageToken,
          blockedKeywords: StorageService.getBlockedKeywords(),
          completelyBlockedChannels: StorageService.getCompletelyBlockedChannels()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.videos) {
          // Double safety client-side filtering matching the personal block lists & explicit content filters
          data.videos = data.videos.filter((v: any) => {
            const explicitTitle = checkExplicitContent(v.title);
            const explicitDesc = checkExplicitContent(v.description);
            const explicitChannel = checkExplicitContent(v.channelTitle || '');
            
            if (explicitTitle.blocked || explicitDesc.blocked || explicitChannel.blocked) {
              return false;
            }

            const isKwBlocked = StorageService.isKeywordBlocked(v.title) || 
                               StorageService.isKeywordBlocked(v.description) || 
                               StorageService.isKeywordBlocked(v.channelTitle);
            const isChanBlocked = StorageService.isChannelCompletelyBlocked(v.channelId || '', v.channelTitle);
            return !isKwBlocked && !isChanBlocked;
          });
          await this.enrichVideosWithDurations(data.videos);
        }
        return data;
      }
    } catch (err) {
      console.warn('Backend search API unreachable, falling back to local catalog search:', err);
    }

    // Fallback local search
    const lowerQ = query.toLowerCase().trim();
    const filtered = EDUCATIONAL_CATALOG.filter(v => {
      // First check explicit block rules
      const explicitTitle = checkExplicitContent(v.title);
      const explicitDesc = checkExplicitContent(v.description);
      const explicitChannel = checkExplicitContent(v.channelTitle || '');
      
      if (explicitTitle.blocked || explicitDesc.blocked || explicitChannel.blocked) {
        return false;
      }

      // Check personal block rules
      const isKwBlocked = StorageService.isKeywordBlocked(v.title) || 
                          StorageService.isKeywordBlocked(v.description) || 
                          StorageService.isKeywordBlocked(v.channelTitle);
      const isChanBlocked = StorageService.isChannelCompletelyBlocked(v.channelId || '', v.channelTitle);
      if (isKwBlocked || isChanBlocked) return false;

      const matchesSubject = subject === 'All' || v.subject === subject;
      if (!matchesSubject) return false;

      if (!lowerQ) return true;

      return (
        v.title.toLowerCase().includes(lowerQ) ||
        v.description.toLowerCase().includes(lowerQ) ||
        v.channelTitle.toLowerCase().includes(lowerQ) ||
        v.subject.toLowerCase().includes(lowerQ) ||
        (v.examCategory && v.examCategory.toLowerCase().includes(lowerQ))
      );
    });

    await this.enrichVideosWithDurations(filtered);

    return {
      blocked: false,
      videos: filtered
    };
  }

  static async searchChannels(query: string): Promise<{ channelId: string; channelTitle: string; thumbnailUrl: string }[]> {
    if (query) {
      const explicitCheck = checkExplicitContent(query);
      if (explicitCheck.blocked) {
        return [];
      }
    }

    try {
      const response = await fetch('/api/search-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        const data = await response.json();
        const channels = data.channels || [];
        return channels.filter((c: any) => !checkExplicitContent(c.channelTitle).blocked && !checkExplicitContent(c.description || '').blocked);
      }
    } catch (e) {
      console.warn('Failed to search channels on backend:', e);
    }
    
    // Fallback local search from EDUCATIONAL_CATALOG
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return [];
    
    const catalogChannels: any[] = [];
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
    return catalogChannels.filter((c: any) => !checkExplicitContent(c.channelTitle).blocked);
  }
}
