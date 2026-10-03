package com.medicare.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.medicare.ai.data.local.model.DoseStatus
import com.medicare.ai.data.local.model.DoseVerificationType
import com.medicare.ai.data.local.model.SyncState
import java.util.UUID

/**
 * Dose Event Entity tracking every reminder instance, response status, and verification mode.
 * Conforms to PRD Section 11, 12, 20, 40, 41, 49.
 */
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

    /**
     * Timestamp (epoch millis) when this dose was scheduled to be consumed.
     */
    @ColumnInfo(name = "scheduled_time")
    val scheduledTime: Long,

    /**
     * Timestamp (epoch millis) when the patient or caregiver executed an action (Taken, Skipped, etc.).
     */
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
)
