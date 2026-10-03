package com.medicare.ai.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.medicare.ai.data.local.entity.UserEntity
import com.medicare.ai.data.local.model.SyncState
import com.medicare.ai.data.local.model.UserRole
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for User & Profile management.
 */
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

    @Query("SELECT * FROM users WHERE sync_state = :syncState ORDER BY timestamp ASC")
    fun observeUsersBySyncState(syncState: SyncState): Flow<List<UserEntity>>

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

    @Query("DELETE FROM users WHERE user_id = :userId")
    suspend fun deleteUserById(userId: String): Int
}
