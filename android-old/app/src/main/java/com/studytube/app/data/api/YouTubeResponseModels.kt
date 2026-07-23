package com.studytube.app.data.api

import com.google.gson.annotations.SerializedName

data class YouTubeSearchResponse(
    @SerializedName("kind") val kind: String?,
    @SerializedName("etag") val etag: String?,
    @SerializedName("nextPageToken") val nextPageToken: String?,
    @SerializedName("items") val items: List<YouTubeSearchItem>?
)

data class YouTubeSearchItem(
    @SerializedName("id") val id: ResourceId?,
    @SerializedName("snippet") val snippet: VideoSnippet?
)

data class ResourceId(
    @SerializedName("kind") val kind: String?,
    @SerializedName("videoId") val videoId: String?
)

data class VideoSnippet(
    @SerializedName("publishedAt") val publishedAt: String?,
    @SerializedName("channelId") val channelId: String?,
    @SerializedName("title") val title: String?,
    @SerializedName("description") val description: String?,
    @SerializedName("thumbnails") val thumbnails: Thumbnails?,
    @SerializedName("channelTitle") val channelTitle: String?
)

data class Thumbnails(
    @SerializedName("high") val high: ThumbnailDetails?,
    @SerializedName("medium") val medium: ThumbnailDetails?
)

data class ThumbnailDetails(
    @SerializedName("url") val url: String?
)
