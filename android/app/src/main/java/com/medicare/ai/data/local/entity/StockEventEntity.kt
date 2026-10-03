package com.medicare.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.medicare.ai.data.local.model.StockEventReason
import com.medicare.ai.data.local.model.SyncState
import java.util.UUID

/**
 * Stock Event Entity providing an immutable audit ledger for inventory changes.
 * Conforms to PRD Section 13, 14, 40, 41, 49.
 */
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

    /**
     * Quantity difference (+ for refill, - for dose consumed or discarded).
     */
    @ColumnInfo(name = "quantity_change")
    val quantityChange: Double,

    /**
     * Snapshot of the total stock remaining after this event took effect.
     */
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
)
