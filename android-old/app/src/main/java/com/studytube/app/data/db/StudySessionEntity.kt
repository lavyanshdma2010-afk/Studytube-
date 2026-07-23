package com.studytube.app.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "study_sessions")
data class StudySessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val dateStr: String, // YYYY-MM-DD
    val durationMinutes: Int,
    val subjectCategory: String, // e.g. "Mathematics", "Science", "NCERT"
    val sessionType: String, // "study" or "break"
    val timestamp: Long = System.currentTimeMillis()
)
