package com.medicare.ai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.medicare.ai.data.local.model.SyncState
import com.medicare.ai.data.local.model.UserRole
import java.util.UUID

/**
 * User Entity representing a Patient or Caregiver in the local database.
 * Conforms to PRD Section 5, 40, 41, 49.
 */
@Entity(
    tableName = "users",
    indices = [
        Index(value = ["phone"], unique = true),
        Index(value = ["syncState"]),
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
)
