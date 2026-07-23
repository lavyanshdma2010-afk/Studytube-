package com.studytube.app.data.repository

import com.studytube.app.data.api.YouTubeSearchItem
import java.util.Locale

sealed class SearchResult {
    data class Success(val videos: List<YouTubeSearchItem>) : SearchResult()
    data class Blocked(val reason: String) : SearchResult()
    data class Error(val message: String) : SearchResult()
}

class EducationalVideoRepository {

    private val blockedKeywords = listOf(
        "minecraft", "gta", "gaming", "music", "movie", "anime", "netflix",
        "instagram", "reels", "shorts", "funny", "memes", "prank", "reaction",
        "vlog", "fortnite", "roblox", "pubg", "gameplay", "entertainment"
    )

    val priorityEducationalTerms = listOf(
        "NCERT", "CBSE", "UPSC", "JEE", "NEET", "Geography",
        "History", "Political Science", "Economics", "English",
        "Mathematics", "Science", "Programming"
    )

    fun isQueryBlocked(query: String): Boolean {
        val lowerQuery = query.lowercase(Locale.ROOT)
        return blockedKeywords.any { lowerQuery.contains(it) }
    }

    fun sanitizeAndFilterVideos(items: List<YouTubeSearchItem>?): List<YouTubeSearchItem> {
        if (items == null) return emptyList()

        return items.filter { item ->
            val title = item.snippet?.title?.lowercase(Locale.ROOT) ?: ""
            val desc = item.snippet?.description?.lowercase(Locale.ROOT) ?: ""
            val videoId = item.id?.videoId

            // Must have valid videoId and not match blocked terms in title
            videoId != null && blockedKeywords.none { title.contains(it) }
        }
    }
}
