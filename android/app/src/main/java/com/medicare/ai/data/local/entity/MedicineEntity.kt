package com.medicare.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.medicare.ai.data.local.model.FoodInstruction
import com.medicare.ai.data.local.model.MedicineForm
import com.medicare.ai.data.local.model.SyncState
import java.util.UUID

/**
 * Medicine Entity storing patient medications and current inventory stock.
 * Conforms to PRD Section 8, 13, 14, 49.
 */
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
)
