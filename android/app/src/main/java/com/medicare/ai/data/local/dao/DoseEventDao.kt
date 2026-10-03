package com.medicare.ai.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.medicare.ai.data.local.entity.DoseEventEntity
import com.medicare.ai.data.local.model.DoseStatus
import com.medicare.ai.data.local.model.DoseVerificationType
import com.medicare.ai.data.local.model.SyncState
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for Dose Events.
 * Tracks patient medication adherence, confirmations, and caregiver escalation events.
 * Conforms to PRD Section 11, 20, 36, 40, 49.
 */
@Dao
interface DoseEventDao {

    @Query("SELECT * FROM dose_events WHERE patient_id = :patientId ORDER BY scheduled_time DESC")
    fun observeAllDoseEvents(patientId: String): Flow<List<DoseEventEntity>>

    @Query("SELECT * FROM dose_events WHERE patient_id = :patientId AND scheduled_time BETWEEN :startTime AND :endTime ORDER BY scheduled_time ASC")
    fun observeDosesForDateRange(patientId: String, startTime: Long, endTime: Long): Flow<List<DoseEventEntity>>

    @Query("SELECT * FROM dose_events WHERE patient_id = :patientId AND status = :status ORDER BY scheduled_time DESC")
    fun observeDosesByStatus(patientId: String, status: DoseStatus): Flow<List<DoseEventEntity>>

    /**
     * Doses currently awaiting patient confirmation (SCHEDULED or REMINDER_SENT).
     */
    @Query("SELECT * FROM dose_events WHERE patient_id = :patientId AND status IN ('SCHEDULED', 'REMINDER_SENT', 'SNOOZED') AND scheduled_time <= :upToTime ORDER BY scheduled_time ASC")
    fun observeActionableDoses(patientId: String, upToTime: Long): Flow<List<DoseEventEntity>>

    /**
     * Identifies overdue reminders that have exceeded the escalation timeout
     * to notify caregivers (PRD Section 20: No-Response Escalation).
     */
    @Query("SELECT * FROM dose_events WHERE patient_id = :patientId AND status IN ('REMINDER_SENT', 'SCHEDULED') AND scheduled_time < :overdueThreshold")
    suspend fun getOverdueUnconfirmedDoses(patientId: String, overdueThreshold: Long): List<DoseEventEntity>

    @Query("SELECT * FROM dose_events WHERE event_id = :eventId LIMIT 1")
    fun observeDoseEventById(eventId: String): Flow<DoseEventEntity?>

    @Query("SELECT * FROM dose_events WHERE event_id = :eventId LIMIT 1")
    suspend fun getDoseEventById(eventId: String): DoseEventEntity?

    @Query("SELECT * FROM dose_events WHERE sync_state IN ('LOCAL', 'QUEUED', 'FAILED') ORDER BY timestamp ASC")
    fun observePendingSyncDoseEvents(): Flow<List<DoseEventEntity>>

    @Query("SELECT * FROM dose_events WHERE sync_state IN ('LOCAL', 'QUEUED', 'FAILED') ORDER BY timestamp ASC")
    suspend fun getDoseEventsPendingSync(): List<DoseEventEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDoseEvent(doseEvent: DoseEventEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDoseEvents(doseEvents: List<DoseEventEntity>): List<Long>

    @Update
    suspend fun updateDoseEvent(doseEvent: DoseEventEntity): Int

    @Query("UPDATE dose_events SET status = :newStatus, action_time = :actionTime, verification_type = :verificationType, notes = :notes, timestamp = :timestamp, sync_state = :syncState, version = version + 1 WHERE event_id = :eventId")
    suspend fun updateDoseStatus(
        eventId: String,
        newStatus: DoseStatus,
        actionTime: Long = System.currentTimeMillis(),
        verificationType: DoseVerificationType = DoseVerificationType.MANUAL_TAP,
        notes: String? = null,
        syncState: SyncState = SyncState.LOCAL,
        timestamp: Long = System.currentTimeMillis()
    ): Int

    @Query("UPDATE dose_events SET status = 'SNOOZED', snooze_until = :snoozeUntil, timestamp = :timestamp, sync_state = 'LOCAL' WHERE event_id = :eventId")
    suspend fun snoozeDose(eventId: String, snoozeUntil: Long, timestamp: Long = System.currentTimeMillis()): Int

    @Query("UPDATE dose_events SET sync_state = :syncState, timestamp = :timestamp WHERE event_id = :eventId")
    suspend fun updateSyncState(eventId: String, syncState: SyncState, timestamp: Long = System.currentTimeMillis())

    @Delete
    suspend fun deleteDoseEvent(doseEvent: DoseEventEntity): Int

    @Query("DELETE FROM dose_events WHERE event_id = :eventId")
    suspend fun deleteDoseEventById(eventId: String): Int
}
