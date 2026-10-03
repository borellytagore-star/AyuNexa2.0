export interface KotlinFile {
  id: string;
  name: string;
  path: string;
  package: string;
  description: string;
  category: 'entity' | 'dao' | 'database' | 'model' | 'config';
  code: string;
}

export const KOTLIN_FILES: KotlinFile[] = [
  {
    id: 'sync-state',
    name: 'SyncState.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/model/SyncState.kt',
    package: 'com.medicare.ai.data.local.model',
    category: 'model',
    description: 'Event-based offline sync lifecycle states (PRD §40 & §41)',
    code: `package com.medicare.ai.data.local.model

/**
 * Lifecycle states for event-based offline-first synchronization.
 * Follows PRD Section 40 & 41: Local -> Queued -> Uploading -> Synced / Failed.
 */
enum class SyncState {
    /** Stored strictly in local Room database, awaiting offline work or queueing. */
    LOCAL,

    /** Marked ready for background sync worker (WorkManager). */
    QUEUED,

    /** Currently being transferred to the remote backend or caregiver broker. */
    UPLOADING,

    /** Successfully acknowledged and synchronized with the remote backend. */
    SYNCED,

    /** Upload failed due to network error or validation, scheduled for exponential backoff retry. */
    FAILED
}`
  },
  {
    id: 'enums',
    name: 'Enums.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/model/Enums.kt',
    package: 'com.medicare.ai.data.local.model',
    category: 'model',
    description: 'Domain enumeration values for roles, forms, dose status, and stock reasons',
    code: `package com.medicare.ai.data.local.model

enum class UserRole {
    PATIENT,
    CAREGIVER,
    DOCTOR
}

enum class MedicineForm {
    TABLET,
    CAPSULE,
    LIQUID_ML,
    INJECTION,
    INHALER,
    DROPS,
    TOPICAL,
    PATCH,
    OTHER
}

enum class FoodInstruction {
    BEFORE_MEAL,
    AFTER_MEAL,
    WITH_MEAL,
    EMPTY_STOMACH,
    NO_RESTRICTION
}

enum class ScheduleFrequency {
    ONCE_DAILY,
    TWICE_DAILY,
    THRICE_DAILY,
    FOUR_TIMES_DAILY,
    EVERY_N_HOURS,
    SPECIFIC_DAYS,
    ALTERNATE_DAYS,
    WEEKLY,
    AS_NEEDED_PRN
}

enum class DoseStatus {
    SCHEDULED,
    REMINDER_SENT,
    TAKEN,
    SNOOZED,
    SKIPPED,
    UNABLE_TO_TAKE,
    NO_RESPONSE
}

enum class DoseVerificationType {
    MANUAL_TAP,
    VOICE_CONFIRMATION,
    CAREGIVER_CONFIRMATION,
    SMART_PILLBOX,
    SYSTEM_TIMEOUT,
    NONE
}

enum class StockEventReason {
    INITIAL_STOCK,
    DOSE_CONSUMED,
    REFILL_RECEIVED,
    MANUAL_CORRECTION,
    MEDICINE_DISCARDED,
    PRESCRIPTION_CHANGED
}`
  },
  {
    id: 'user-entity',
    name: 'UserEntity.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/entity/UserEntity.kt',
    package: 'com.medicare.ai.data.local.entity',
    category: 'entity',
    description: 'Patient/Caregiver profile entity with sync tracking and emergency info',
    code: `package com.medicare.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.medicare.ai.data.local.model.SyncState
import com.medicare.ai.data.local.model.UserRole
import java.util.UUID

@Entity(
    tableName = "users",
    indices = [
        Index(value = ["phone"], unique = true),
        Index(value = ["sync_state"]),
        Index(value = ["timestamp"])
    ]
)
data class UserEntity(
    @PrimaryKey
    @ColumnInfo(name = "user_id")
    val userId: String = UUID.randomUUID().toString(),

    @ColumnInfo(name = "name")
    val name: String,

    @ColumnInfo(name = "phone")
    val phone: String,

    @ColumnInfo(name = "role")
    val role: UserRole = UserRole.PATIENT,

    @ColumnInfo(name = "emergency_contact")
    val emergencyContact: String? = null,

    @ColumnInfo(name = "primary_caregiver_id")
    val primaryCaregiverId: String? = null,

    @ColumnInfo(name = "allergies")
    val allergies: String? = null,

    @ColumnInfo(name = "is_active_profile")
    val isActiveProfile: Boolean = true,

    // --- Offline-First Event Synchronization Fields ---
    @ColumnInfo(name = "event_id")
    val eventId: String = UUID.randomUUID().toString(),

    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "sync_state")
    val syncState: SyncState = SyncState.LOCAL,

    @ColumnInfo(name = "version")
    val version: Long = 1L
)`
  },
  {
    id: 'medicine-entity',
    name: 'MedicineEntity.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/entity/MedicineEntity.kt',
    package: 'com.medicare.ai.data.local.entity',
    category: 'entity',
    description: 'Medication catalog and current inventory stock (PRD §8, §13, §14)',
    code: `package com.medicare.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.medicare.ai.data.local.model.FoodInstruction
import com.medicare.ai.data.local.model.MedicineForm
import com.medicare.ai.data.local.model.SyncState
import java.util.UUID

@Entity(
    tableName = "medicines",
    foreignKeys = [
        ForeignKey(
            entity = UserEntity::class,
            parentColumns = ["user_id"],
            childColumns = ["patient_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["patient_id"]),
        Index(value = ["name"]),
        Index(value = ["sync_state"]),
        Index(value = ["timestamp"])
    ]
)
data class MedicineEntity(
    @PrimaryKey
    @ColumnInfo(name = "medicine_id")
    val medicineId: String = UUID.randomUUID().toString(),

    @ColumnInfo(name = "patient_id")
    val patientId: String,

    @ColumnInfo(name = "name")
    val name: String,

    @ColumnInfo(name = "strength")
    val strength: String,

    @ColumnInfo(name = "form")
    val form: MedicineForm = MedicineForm.TABLET,

    @ColumnInfo(name = "current_stock")
    val currentStock: Double,

    @ColumnInfo(name = "unit")
    val unit: String = "tablets",

    @ColumnInfo(name = "reorder_threshold")
    val reorderThreshold: Double = 7.0,

    @ColumnInfo(name = "food_instruction")
    val foodInstruction: FoodInstruction = FoodInstruction.NO_RESTRICTION,

    @ColumnInfo(name = "color_hex")
    val colorHex: String? = null,

    @ColumnInfo(name = "photo_uri")
    val photoUri: String? = null,

    @ColumnInfo(name = "instructions")
    val instructions: String? = null,

    @ColumnInfo(name = "is_active")
    val isActive: Boolean = true,

    // --- Offline-First Event Synchronization Fields ---
    @ColumnInfo(name = "event_id")
    val eventId: String = UUID.randomUUID().toString(),

    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "sync_state")
    val syncState: SyncState = SyncState.LOCAL,

    @ColumnInfo(name = "version")
    val version: Long = 1L
)`
  },
  {
    id: 'schedule-entity',
    name: 'MedicineScheduleEntity.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/entity/MedicineScheduleEntity.kt',
    package: 'com.medicare.ai.data.local.entity',
    category: 'entity',
    description: 'Exact reminder timing & dosage rules for AlarmManager & WorkManager',
    code: `package com.medicare.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.medicare.ai.data.local.model.ScheduleFrequency
import com.medicare.ai.data.local.model.SyncState
import java.util.UUID

@Entity(
    tableName = "medicine_schedules",
    foreignKeys = [
        ForeignKey(
            entity = MedicineEntity::class,
            parentColumns = ["medicine_id"],
            childColumns = ["medicine_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["medicine_id"]),
        Index(value = ["patient_id"]),
        Index(value = ["time_of_day"]),
        Index(value = ["sync_state"]),
        Index(value = ["timestamp"])
    ]
)
data class MedicineScheduleEntity(
    @PrimaryKey
    @ColumnInfo(name = "schedule_id")
    val scheduleId: String = UUID.randomUUID().toString(),

    @ColumnInfo(name = "medicine_id")
    val medicineId: String,

    @ColumnInfo(name = "patient_id")
    val patientId: String,

    @ColumnInfo(name = "time_of_day")
    val timeOfDay: String,

    @ColumnInfo(name = "dose_quantity")
    val doseQuantity: Double = 1.0,

    @ColumnInfo(name = "frequency")
    val frequency: ScheduleFrequency = ScheduleFrequency.ONCE_DAILY,

    @ColumnInfo(name = "days_of_week")
    val daysOfWeek: String = "ALL",

    @ColumnInfo(name = "interval_hours")
    val intervalHours: Int? = null,

    @ColumnInfo(name = "start_date")
    val startDate: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "end_date")
    val endDate: Long? = null,

    @ColumnInfo(name = "is_active")
    val isActive: Boolean = true,

    // --- Offline-First Event Synchronization Fields ---
    @ColumnInfo(name = "event_id")
    val eventId: String = UUID.randomUUID().toString(),

    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "sync_state")
    val syncState: SyncState = SyncState.LOCAL,

    @ColumnInfo(name = "version")
    val version: Long = 1L
)`
  },
  {
    id: 'dose-event-entity',
    name: 'DoseEventEntity.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/entity/DoseEventEntity.kt',
    package: 'com.medicare.ai.data.local.entity',
    category: 'entity',
    description: 'Dose lifecycle tracking (Scheduled, Taken, Snoozed, Skipped, No Response)',
    code: `package com.medicare.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.medicare.ai.data.local.model.DoseStatus
import com.medicare.ai.data.local.model.DoseVerificationType
import com.medicare.ai.data.local.model.SyncState
import java.util.UUID

@Entity(
    tableName = "dose_events",
    foreignKeys = [
        ForeignKey(
            entity = MedicineScheduleEntity::class,
            parentColumns = ["schedule_id"],
            childColumns = ["schedule_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = MedicineEntity::class,
            parentColumns = ["medicine_id"],
            childColumns = ["medicine_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["schedule_id"]),
        Index(value = ["medicine_id"]),
        Index(value = ["patient_id"]),
        Index(value = ["scheduled_time"]),
        Index(value = ["status"]),
        Index(value = ["sync_state"]),
        Index(value = ["timestamp"])
    ]
)
data class DoseEventEntity(
    @PrimaryKey
    @ColumnInfo(name = "event_id")
    val eventId: String = UUID.randomUUID().toString(),

    @ColumnInfo(name = "schedule_id")
    val scheduleId: String,

    @ColumnInfo(name = "medicine_id")
    val medicineId: String,

    @ColumnInfo(name = "patient_id")
    val patientId: String,

    @ColumnInfo(name = "scheduled_time")
    val scheduledTime: Long,

    @ColumnInfo(name = "action_time")
    val actionTime: Long? = null,

    @ColumnInfo(name = "status")
    val status: DoseStatus = DoseStatus.SCHEDULED,

    @ColumnInfo(name = "snooze_until")
    val snoozeUntil: Long? = null,

    @ColumnInfo(name = "verification_type")
    val verificationType: DoseVerificationType = DoseVerificationType.NONE,

    @ColumnInfo(name = "notes")
    val notes: String? = null,

    // --- Offline-First Event Synchronization Fields ---
    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "sync_state")
    val syncState: SyncState = SyncState.LOCAL,

    @ColumnInfo(name = "version")
    val version: Long = 1L
)`
  },
  {
    id: 'stock-event-entity',
    name: 'StockEventEntity.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/entity/StockEventEntity.kt',
    package: 'com.medicare.ai.data.local.entity',
    category: 'entity',
    description: 'Immutable audit ledger for all inventory modifications (PRD §13)',
    code: `package com.medicare.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.medicare.ai.data.local.model.StockEventReason
import com.medicare.ai.data.local.model.SyncState
import java.util.UUID

@Entity(
    tableName = "stock_events",
    foreignKeys = [
        ForeignKey(
            entity = MedicineEntity::class,
            parentColumns = ["medicine_id"],
            childColumns = ["medicine_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["medicine_id"]),
        Index(value = ["patient_id"]),
        Index(value = ["associated_dose_event_id"]),
        Index(value = ["sync_state"]),
        Index(value = ["timestamp"])
    ]
)
data class StockEventEntity(
    @PrimaryKey
    @ColumnInfo(name = "event_id")
    val eventId: String = UUID.randomUUID().toString(),

    @ColumnInfo(name = "medicine_id")
    val medicineId: String,

    @ColumnInfo(name = "patient_id")
    val patientId: String,

    @ColumnInfo(name = "quantity_change")
    val quantityChange: Double,

    @ColumnInfo(name = "resulting_stock")
    val resultingStock: Double,

    @ColumnInfo(name = "reason")
    val reason: StockEventReason,

    @ColumnInfo(name = "associated_dose_event_id")
    val associatedDoseEventId: String? = null,

    @ColumnInfo(name = "notes")
    val notes: String? = null,

    // --- Offline-First Event Synchronization Fields ---
    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "sync_state")
    val syncState: SyncState = SyncState.LOCAL,

    @ColumnInfo(name = "version")
    val version: Long = 1L
)`
  },
  {
    id: 'user-dao',
    name: 'UserDao.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/dao/UserDao.kt',
    package: 'com.medicare.ai.data.local.dao',
    category: 'dao',
    description: 'Reactive DAO for user accounts, roles, and caregivers',
    code: `package com.medicare.ai.data.local.dao

import androidx.room.*
import com.medicare.ai.data.local.entity.UserEntity
import com.medicare.ai.data.local.model.SyncState
import com.medicare.ai.data.local.model.UserRole
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE is_active_profile = 1 LIMIT 1")
    fun observeActiveUser(): Flow<UserEntity?>

    @Query("SELECT * FROM users WHERE user_id = :userId LIMIT 1")
    fun observeUserById(userId: String): Flow<UserEntity?>

    @Query("SELECT * FROM users WHERE user_id = :userId LIMIT 1")
    suspend fun getUserById(userId: String): UserEntity?

    @Query("SELECT * FROM users WHERE role = :role")
    fun observeUsersByRole(role: UserRole): Flow<List<UserEntity>>

    @Query("SELECT * FROM users WHERE primary_caregiver_id = :caregiverId")
    fun observePatientsForCaregiver(caregiverId: String): Flow<List<UserEntity>>

    @Query("SELECT * FROM users WHERE sync_state IN ('LOCAL', 'QUEUED', 'FAILED') ORDER BY timestamp ASC")
    suspend fun getUsersPendingSync(): List<UserEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUsers(users: List<UserEntity>): List<Long>

    @Update
    suspend fun updateUser(user: UserEntity): Int

    @Query("UPDATE users SET sync_state = :syncState, timestamp = :timestamp WHERE user_id = :userId")
    suspend fun updateSyncState(userId: String, syncState: SyncState, timestamp: Long = System.currentTimeMillis())

    @Delete
    suspend fun deleteUser(user: UserEntity): Int
}`
  },
  {
    id: 'medicine-dao',
    name: 'MedicineDao.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/dao/MedicineDao.kt',
    package: 'com.medicare.ai.data.local.dao',
    category: 'dao',
    description: 'Medicine catalog, reactive stock monitoring, and low-stock alerts',
    code: `package com.medicare.ai.data.local.dao

import androidx.room.*
import com.medicare.ai.data.local.entity.MedicineEntity
import com.medicare.ai.data.local.model.SyncState
import kotlinx.coroutines.flow.Flow

@Dao
interface MedicineDao {
    @Query("SELECT * FROM medicines WHERE patient_id = :patientId ORDER BY name ASC")
    fun observeAllMedicines(patientId: String): Flow<List<MedicineEntity>>

    @Query("SELECT * FROM medicines WHERE patient_id = :patientId AND is_active = 1 ORDER BY name ASC")
    fun observeActiveMedicines(patientId: String): Flow<List<MedicineEntity>>

    @Query("SELECT * FROM medicines WHERE medicine_id = :medicineId LIMIT 1")
    fun observeMedicineById(medicineId: String): Flow<MedicineEntity?>

    @Query("SELECT * FROM medicines WHERE medicine_id = :medicineId LIMIT 1")
    suspend fun getMedicineById(medicineId: String): MedicineEntity?

    @Query("SELECT * FROM medicines WHERE patient_id = :patientId AND is_active = 1 AND current_stock <= reorder_threshold ORDER BY current_stock ASC")
    fun observeLowStockMedicines(patientId: String): Flow<List<MedicineEntity>>

    @Query("SELECT * FROM medicines WHERE sync_state IN ('LOCAL', 'QUEUED', 'FAILED') ORDER BY timestamp ASC")
    fun observePendingSyncMedicines(): Flow<List<MedicineEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMedicine(medicine: MedicineEntity): Long

    @Update
    suspend fun updateMedicine(medicine: MedicineEntity): Int

    @Query("UPDATE medicines SET current_stock = :newStock, timestamp = :timestamp, sync_state = :syncState, event_id = :eventId, version = version + 1 WHERE medicine_id = :medicineId")
    suspend fun updateStock(
        medicineId: String,
        newStock: Double,
        eventId: String,
        syncState: SyncState = SyncState.LOCAL,
        timestamp: Long = System.currentTimeMillis()
    ): Int

    @Delete
    suspend fun deleteMedicine(medicine: MedicineEntity): Int
}`
  },
  {
    id: 'schedule-dao',
    name: 'MedicineScheduleDao.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/dao/MedicineScheduleDao.kt',
    package: 'com.medicare.ai.data.local.dao',
    category: 'dao',
    description: 'Schedule timing queries for reactive UI and OS AlarmManager triggers',
    code: `package com.medicare.ai.data.local.dao

import androidx.room.*
import com.medicare.ai.data.local.entity.MedicineScheduleEntity
import com.medicare.ai.data.local.model.SyncState
import kotlinx.coroutines.flow.Flow

@Dao
interface MedicineScheduleDao {
    @Query("SELECT * FROM medicine_schedules WHERE patient_id = :patientId AND is_active = 1 ORDER BY time_of_day ASC")
    fun observeActiveSchedulesForPatient(patientId: String): Flow<List<MedicineScheduleEntity>>

    @Query("SELECT * FROM medicine_schedules WHERE medicine_id = :medicineId AND is_active = 1 ORDER BY time_of_day ASC")
    fun observeSchedulesForMedicine(medicineId: String): Flow<List<MedicineScheduleEntity>>

    @Query("SELECT * FROM medicine_schedules WHERE schedule_id = :scheduleId LIMIT 1")
    fun observeScheduleById(scheduleId: String): Flow<MedicineScheduleEntity?>

    @Query("SELECT * FROM medicine_schedules WHERE time_of_day = :timeOfDay AND is_active = 1")
    suspend fun getSchedulesForTime(timeOfDay: String): List<MedicineScheduleEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSchedule(schedule: MedicineScheduleEntity): Long

    @Update
    suspend fun updateSchedule(schedule: MedicineScheduleEntity): Int

    @Delete
    suspend fun deleteSchedule(schedule: MedicineScheduleEntity): Int
}`
  },
  {
    id: 'dose-event-dao',
    name: 'DoseEventDao.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/dao/DoseEventDao.kt',
    package: 'com.medicare.ai.data.local.dao',
    category: 'dao',
    description: 'Dose confirmations, overdue no-response detector, adherence Flow',
    code: `package com.medicare.ai.data.local.dao

import androidx.room.*
import com.medicare.ai.data.local.entity.DoseEventEntity
import com.medicare.ai.data.local.model.DoseStatus
import com.medicare.ai.data.local.model.DoseVerificationType
import com.medicare.ai.data.local.model.SyncState
import kotlinx.coroutines.flow.Flow

@Dao
interface DoseEventDao {
    @Query("SELECT * FROM dose_events WHERE patient_id = :patientId ORDER BY scheduled_time DESC")
    fun observeAllDoseEvents(patientId: String): Flow<List<DoseEventEntity>>

    @Query("SELECT * FROM dose_events WHERE patient_id = :patientId AND scheduled_time BETWEEN :startTime AND :endTime ORDER BY scheduled_time ASC")
    fun observeDosesForDateRange(patientId: String, startTime: Long, endTime: Long): Flow<List<DoseEventEntity>>

    @Query("SELECT * FROM dose_events WHERE patient_id = :patientId AND status IN ('SCHEDULED', 'REMINDER_SENT', 'SNOOZED') AND scheduled_time <= :upToTime ORDER BY scheduled_time ASC")
    fun observeActionableDoses(patientId: String, upToTime: Long): Flow<List<DoseEventEntity>>

    @Query("SELECT * FROM dose_events WHERE patient_id = :patientId AND status IN ('REMINDER_SENT', 'SCHEDULED') AND scheduled_time < :overdueThreshold")
    suspend fun getOverdueUnconfirmedDoses(patientId: String, overdueThreshold: Long): List<DoseEventEntity>

    @Query("SELECT * FROM dose_events WHERE event_id = :eventId LIMIT 1")
    suspend fun getDoseEventById(eventId: String): DoseEventEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDoseEvent(doseEvent: DoseEventEntity): Long

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
}`
  },
  {
    id: 'stock-event-dao',
    name: 'StockEventDao.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/dao/StockEventDao.kt',
    package: 'com.medicare.ai.data.local.dao',
    category: 'dao',
    description: 'Auditable append-only ledger queries for inventory changes',
    code: `package com.medicare.ai.data.local.dao

import androidx.room.*
import com.medicare.ai.data.local.entity.StockEventEntity
import com.medicare.ai.data.local.model.SyncState
import kotlinx.coroutines.flow.Flow

@Dao
interface StockEventDao {
    @Query("SELECT * FROM stock_events WHERE patient_id = :patientId ORDER BY timestamp DESC")
    fun observeAllStockEvents(patientId: String): Flow<List<StockEventEntity>>

    @Query("SELECT * FROM stock_events WHERE medicine_id = :medicineId ORDER BY timestamp DESC")
    fun observeStockHistoryForMedicine(medicineId: String): Flow<List<StockEventEntity>>

    @Query("SELECT * FROM stock_events WHERE patient_id = :patientId AND timestamp BETWEEN :startTime AND :endTime ORDER BY timestamp DESC")
    fun observeStockEventsForPeriod(patientId: String, startTime: Long, endTime: Long): Flow<List<StockEventEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockEvent(stockEvent: StockEventEntity): Long

    @Query("UPDATE stock_events SET sync_state = :syncState, timestamp = :timestamp WHERE event_id = :eventId")
    suspend fun updateSyncState(eventId: String, syncState: SyncState, timestamp: Long = System.currentTimeMillis())
}`
  },
  {
    id: 'transaction-dao',
    name: 'MedicineTransactionDao.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/local/dao/MedicineTransactionDao.kt',
    package: 'com.medicare.ai.data.local.dao',
    category: 'dao',
    description: 'Atomic SQLite Room @Transaction coordinating dose confirmations & stock updates',
    code: `package com.medicare.ai.data.local.dao

import androidx.room.Dao
import androidx.room.Transaction
import com.medicare.ai.data.local.entity.*
import com.medicare.ai.data.local.model.*
import java.util.UUID

@Dao
abstract class MedicineTransactionDao {
    @Transaction
    open suspend fun confirmDoseTaken(
        doseEventDao: DoseEventDao,
        medicineDao: MedicineDao,
        stockEventDao: StockEventDao,
        doseEventId: String,
        consumedQuantity: Double,
        verificationType: DoseVerificationType = DoseVerificationType.MANUAL_TAP,
        notes: String? = null
    ): Boolean {
        val doseEvent = doseEventDao.getDoseEventById(doseEventId) ?: return false
        val medicine = medicineDao.getMedicineById(doseEvent.medicineId) ?: return false

        val currentTime = System.currentTimeMillis()
        val newStock = (medicine.currentStock - consumedQuantity).coerceAtLeast(0.0)

        // 1. Update Dose Status
        doseEventDao.updateDoseStatus(
            eventId = doseEventId,
            newStatus = DoseStatus.TAKEN,
            actionTime = currentTime,
            verificationType = verificationType,
            notes = notes,
            syncState = SyncState.LOCAL,
            timestamp = currentTime
        )

        // 2. Decrement Medicine Stock
        val stockUpdateEventId = UUID.randomUUID().toString()
        medicineDao.updateStock(
            medicineId = medicine.medicineId,
            newStock = newStock,
            eventId = stockUpdateEventId,
            syncState = SyncState.LOCAL,
            timestamp = currentTime
        )

        // 3. Write Immutable Stock Event Ledger Entry
        val stockEvent = StockEventEntity(
            eventId = stockUpdateEventId,
            medicineId = medicine.medicineId,
            patientId = medicine.patientId,
            quantityChange = -consumedQuantity,
            resultingStock = newStock,
            reason = StockEventReason.DOSE_CONSUMED,
            associatedDoseEventId = doseEventId,
            notes = notes ?: "Dose confirmed taken at $currentTime",
            timestamp = currentTime,
            syncState = SyncState.LOCAL,
            version = 1L
        )
        stockEventDao.insertStockEvent(stockEvent)
        return true
    }
}`
  },
  {
    id: 'database',
    name: 'AyuNexaDatabase.kt',
    path: 'android/app/src/main/java/com/ayunexa/app/data/local/database/AyuNexaDatabase.kt',
    package: 'com.ayunexa.app.data.local.database',
    category: 'database',
    description: 'Thread-safe Room Database singleton with TypeConverters and PRAGMA foreign keys',
    code: `package com.ayunexa.app.data.local.database

import android.content.Context
import androidx.room.*
import androidx.sqlite.db.SupportSQLiteDatabase
import com.ayunexa.app.data.local.converter.Converters
import com.ayunexa.app.data.local.dao.*
import com.ayunexa.app.data.local.entity.*

@Database(
    entities = [
        UserEntity::class,
        MedicineEntity::class,
        MedicineScheduleEntity::class,
        DoseEventEntity::class,
        StockEventEntity::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class AyuNexaDatabase : RoomDatabase() {

    abstract fun userDao(): UserDao
    abstract fun medicineDao(): MedicineDao
    abstract fun medicineScheduleDao(): MedicineScheduleDao
    abstract fun doseEventDao(): DoseEventDao
    abstract fun stockEventDao(): StockEventDao
    abstract fun medicineTransactionDao(): MedicineTransactionDao

    companion object {
        const val DATABASE_NAME = "ayunexa.db"

        @Volatile
        private var INSTANCE: AyuNexaDatabase? = null

        fun getInstance(context: Context): AyuNexaDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AyuNexaDatabase::class.java,
                    DATABASE_NAME
                )
                    .fallbackToDestructiveMigration()
                    .addCallback(DatabaseCallback())
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback : Callback() {
            override fun onOpen(db: SupportSQLiteDatabase) {
                super.onOpen(db)
                db.execSQL("PRAGMA foreign_keys=ON;")
            }
        }
    }
}`
  },
  {
    id: 'biometric-auth',
    name: 'BiometricAuthManager.kt',
    path: 'android/app/src/main/java/com/medicare/ai/security/BiometricAuthManager.kt',
    package: 'com.medicare.ai.security',
    category: 'config',
    description: 'Hardware-backed biometric authentication (Fingerprint / Face ID) via Android BiometricPrompt API',
    code: `package com.medicare.ai.security

import android.content.Context
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity

/**
 * AyuNexa Hardware-Backed Biometric Security Manager.
 * Wraps AndroidX BiometricPrompt for protecting sensitive medical data (PRD §44 & §45).
 */
class BiometricAuthManager(private val activity: FragmentActivity) {

    fun isBiometricAvailable(): Boolean {
        val biometricManager = BiometricManager.from(activity)
        return biometricManager.canAuthenticate(BIOMETRIC_STRONG or DEVICE_CREDENTIAL) == BiometricManager.BIOMETRIC_SUCCESS
    }

    fun authenticate(
        title: String = "Biometric Verification Required",
        subtitle: String = "Verify identity to access prescription and medical records",
        negativeButtonText: String = "Use Device PIN",
        onSuccess: () -> Unit,
        onError: (errorCode: Int, errString: CharSequence) -> Unit,
        onFailed: () -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(activity)
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setAllowedAuthenticators(BIOMETRIC_STRONG or DEVICE_CREDENTIAL)
            .build()

        val biometricPrompt = BiometricPrompt(
            activity,
            executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    onSuccess()
                }

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    onError(errorCode, errString)
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    onFailed()
                }
            }
        )

        biometricPrompt.authenticate(promptInfo)
    }
}`
  },
  {
    id: 'room-sync-manager',
    name: 'RoomSyncManager.kt',
    path: 'android/app/src/main/java/com/medicare/ai/data/sync/RoomSyncManager.kt',
    package: 'com.medicare.ai.data.sync',
    category: 'config',
    description: 'Connectivity detection and Room SQLite database cloud backup synchronizer',
    code: `package com.medicare.ai.data.sync

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import androidx.work.*
import com.medicare.ai.data.local.AyuNexaDatabase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.concurrent.TimeUnit

/**
 * AyuNexa Room SQLite Synchronization Manager.
 * Detects network connectivity changes and syncs local Room records with remote cloud backup (PRD §40 & §41).
 */
class RoomSyncManager(private val context: Context, private val database: AyuNexaDatabase) {

    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    private val _isOnline = MutableStateFlow(false)
    val isOnline: StateFlow<Boolean> = _isOnline

    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            _isOnline.value = true
            // Connectivity re-established: automatically trigger Room sync work
            scheduleImmediateCloudSync()
        }

        override fun onLost(network: Network) {
            _isOnline.value = false
        }
    }

    init {
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        connectivityManager.registerNetworkCallback(request, networkCallback)
    }

    fun scheduleImmediateCloudSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = OneTimeWorkRequestBuilder<RoomCloudSyncWorker>()
            .setConstraints(constraints)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.SECONDS)
            .addTag("AYUNEXA_ROOM_CLOUD_SYNC")
            .build()

        WorkManager.getInstance(context).enqueueUniqueWork(
            "UniqueRoomCloudSync",
            ExistingWorkPolicy.REPLACE,
            syncRequest
        )
    }
}`
  },
  {
    id: 'medication-csv-exporter',
    name: 'MedicationCsvExporter.kt',
    path: 'android/app/src/main/java/com/medicare/ai/export/MedicationCsvExporter.kt',
    package: 'com.medicare.ai.export',
    category: 'config',
    description: 'Exports Room database medication records to RFC 4180 CSV for doctor clinical visits',
    code: `package com.medicare.ai.export

import android.content.Context
import android.net.Uri
import com.medicare.ai.data.local.AyuNexaDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.OutputStreamWriter
import java.text.SimpleDateFormat
import java.util.*

/**
 * AyuNexa Medication CSV Exporter.
 * Queries local Room database and writes formatted clinical medication summary for physician visits.
 */
class MedicationCsvExporter(private val context: Context, private val database: AyuNexaDatabase) {

    suspend fun exportToUri(destinationUri: Uri): Int = withContext(Dispatchers.IO) {
        val medicines = database.medicineDao().getAllMedicinesSync()
        val stream = context.contentResolver.openOutputStream(destinationUri) ?: return@withContext 0
        val writer = OutputStreamWriter(stream)

        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
        val now = dateFormat.format(Date())

        writer.write("# AYUNEXA CONNECTED CARE - OFFICIAL PATIENT MEDICATION REPORT\\n")
        writer.write("# Generated for Clinical Consultation with Physician\\n")
        writer.write("# Export Date: $now\\n")
        writer.write("# Database Source: Local Room SQLite Database\\n\\n")

        // CSV Header
        writer.write("Medicine Name,Generic Name,Strength,Form,Instructions,Current Stock,Unit,Prescription Active\\n")

        for (med in medicines) {
            val line = listOf(
                escape(med.name),
                escape(med.genericName ?: "Standard"),
                escape(med.strength),
                escape(med.form.name),
                escape(med.instructions ?: ""),
                escape(med.currentStock.toString()),
                escape(med.unit),
                escape(if (med.isActive) "ACTIVE" else "INACTIVE")
            ).joinToString(",")

            writer.write("$line\\n")
        }

        writer.flush()
        writer.close()
        medicines.size
    }

    private fun escape(value: String): String {
        val clean = value.replace("\\"", "\\"\\"")
        return "\\"\"$clean\\\"\""
    }
}`
  }
];
