package com.medicare.ai.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.medicare.ai.data.local.entity.MedicineScheduleEntity
import com.medicare.ai.data.local.model.SyncState
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for Medicine Schedules.
 * Drives exact AlarmManager and WorkManager reminder triggers (PRD Section 8.2, 11, 12).
 */
@Dao
interface MedicineScheduleDao {

    @Query("SELECT * FROM medicine_schedules WHERE patient_id = :patientId AND is_active = 1 ORDER BY time_of_day ASC")
    fun observeActiveSchedulesForPatient(patientId: String): Flow<List<MedicineScheduleEntity>>

    @Query("SELECT * FROM medicine_schedules WHERE patient_id = :patientId AND is_active = 1 ORDER BY time_of_day ASC")
    suspend fun getActiveSchedulesForPatient(patientId: String): List<MedicineScheduleEntity>

    @Query("SELECT * FROM medicine_schedules WHERE medicine_id = :medicineId AND is_active = 1 ORDER BY time_of_day ASC")
    fun observeSchedulesForMedicine(medicineId: String): Flow<List<MedicineScheduleEntity>>

    @Query("SELECT * FROM medicine_schedules WHERE schedule_id = :scheduleId LIMIT 1")
    fun observeScheduleById(scheduleId: String): Flow<MedicineScheduleEntity?>

    @Query("SELECT * FROM medicine_schedules WHERE schedule_id = :scheduleId LIMIT 1")
    suspend fun getScheduleById(scheduleId: String): MedicineScheduleEntity?

    @Query("SELECT * FROM medicine_schedules WHERE time_of_day = :timeOfDay AND is_active = 1")
    suspend fun getSchedulesForTime(timeOfDay: String): List<MedicineScheduleEntity>

    @Query("SELECT * FROM medicine_schedules WHERE sync_state IN ('LOCAL', 'QUEUED', 'FAILED') ORDER BY timestamp ASC")
    fun observePendingSyncSchedules(): Flow<List<MedicineScheduleEntity>>

    @Query("SELECT * FROM medicine_schedules WHERE sync_state IN ('LOCAL', 'QUEUED', 'FAILED') ORDER BY timestamp ASC")
    suspend fun getSchedulesPendingSync(): List<MedicineScheduleEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSchedule(schedule: MedicineScheduleEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSchedules(schedules: List<MedicineScheduleEntity>): List<Long>

    @Update
    suspend fun updateSchedule(schedule: MedicineScheduleEntity): Int

    @Query("UPDATE medicine_schedules SET is_active = :isActive, timestamp = :timestamp, sync_state = 'LOCAL' WHERE schedule_id = :scheduleId")
    suspend fun setScheduleActiveStatus(scheduleId: String, isActive: Boolean, timestamp: Long = System.currentTimeMillis()): Int

    @Query("UPDATE medicine_schedules SET sync_state = :syncState, timestamp = :timestamp WHERE schedule_id = :scheduleId")
    suspend fun updateSyncState(scheduleId: String, syncState: SyncState, timestamp: Long = System.currentTimeMillis())

    @Delete
    suspend fun deleteSchedule(schedule: MedicineScheduleEntity): Int

    @Query("DELETE FROM medicine_schedules WHERE schedule_id = :scheduleId")
    suspend fun deleteScheduleById(scheduleId: String): Int
}
