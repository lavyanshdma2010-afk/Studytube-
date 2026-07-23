package com.studytube.app.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

data class SubjectSummary(
    val subjectCategory: String,
    val totalMins: Int
)

data class DailySummary(
    val dateStr: String,
    val totalMins: Int
)

@Dao
interface StudySessionDao {

    @Query("SELECT * FROM study_sessions ORDER BY timestamp DESC")
    fun getAllSessions(): Flow<List<StudySessionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: StudySessionEntity)

    @Query("SELECT SUM(durationMinutes) FROM study_sessions WHERE sessionType = 'study'")
    fun getTotalMinutesStudied(): Flow<Int?>

    @Query("SELECT subjectCategory, SUM(durationMinutes) as totalMins FROM study_sessions WHERE sessionType = 'study' GROUP BY subjectCategory ORDER BY totalMins DESC")
    fun getMinutesBySubject(): Flow<List<SubjectSummary>>

    @Query("SELECT dateStr, SUM(durationMinutes) as totalMins FROM study_sessions WHERE sessionType = 'study' GROUP BY dateStr ORDER BY dateStr DESC")
    fun getDailySummaries(): Flow<List<DailySummary>>

    @Query("SELECT DISTINCT dateStr FROM study_sessions WHERE sessionType = 'study'")
    fun getActiveDates(): Flow<List<String>>
}
