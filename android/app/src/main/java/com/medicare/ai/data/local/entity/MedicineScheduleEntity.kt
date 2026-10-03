package com.medicare.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.medicare.ai.data.local.model.ScheduleFrequency
import com.medicare.ai.data.local.model.SyncState
import java.util.UUID

/**
 * Medicine Schedule Entity dictating reminder timing and consumption frequency.
 * Conforms to PRD Section 8.2, 9, 11, 49.
 */
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

    /**
     * Exact 24-hour time representation (e.g., "08:00", "14:30", "20:00").
     * Utilized directly by AlarmManager / exact alarm scheduling.
     */
    @ColumnInfo(name = "time_of_day")
    val timeOfDay: String,

    @ColumnInfo(name = "dose_quantity")
    val doseQuantity: Double = 1.0,

    @ColumnInfo(name = "frequency")
    val frequency: ScheduleFrequency = ScheduleFrequency.ONCE_DAILY,

    /**
     * Bitmask or comma-separated days (e.g., "MON,TUE,WED,THU,FRI,SAT,SUN" or "ALL").
     */
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
)
