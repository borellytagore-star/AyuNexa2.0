package com.medicare.ai.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.medicare.ai.data.local.entity.MedicineEntity
import com.medicare.ai.data.local.model.SyncState
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for Medicine inventory and catalog management.
 * Powers the Medicine Engine and Stock Management (PRD Section 8, 13, 14, 15).
 */
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

    /**
     * Identifies medicines whose stock has dropped to or below the configured reorder threshold.
     * Triggers smart refill recommendations (PRD Section 14, 15, 16).
     */
    @Query("SELECT * FROM medicines WHERE patient_id = :patientId AND is_active = 1 AND current_stock <= reorder_threshold ORDER BY current_stock ASC")
    fun observeLowStockMedicines(patientId: String): Flow<List<MedicineEntity>>

    @Query("SELECT * FROM medicines WHERE patient_id = :patientId AND is_active = 1 AND current_stock <= reorder_threshold ORDER BY current_stock ASC")
    suspend fun getLowStockMedicines(patientId: String): List<MedicineEntity>

    @Query("SELECT * FROM medicines WHERE sync_state IN ('LOCAL', 'QUEUED', 'FAILED') ORDER BY timestamp ASC")
    fun observePendingSyncMedicines(): Flow<List<MedicineEntity>>

    @Query("SELECT * FROM medicines WHERE sync_state IN ('LOCAL', 'QUEUED', 'FAILED') ORDER BY timestamp ASC")
    suspend fun getMedicinesPendingSync(): List<MedicineEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMedicine(medicine: MedicineEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMedicines(medicines: List<MedicineEntity>): List<Long>

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

    @Query("UPDATE medicines SET sync_state = :syncState, timestamp = :timestamp WHERE medicine_id = :medicineId")
    suspend fun updateSyncState(medicineId: String, syncState: SyncState, timestamp: Long = System.currentTimeMillis())

    @Query("UPDATE medicines SET is_active = :isActive, timestamp = :timestamp, sync_state = 'LOCAL' WHERE medicine_id = :medicineId")
    suspend fun setMedicineActiveStatus(medicineId: String, isActive: Boolean, timestamp: Long = System.currentTimeMillis()): Int

    @Delete
    suspend fun deleteMedicine(medicine: MedicineEntity): Int

    @Query("DELETE FROM medicines WHERE medicine_id = :medicineId")
    suspend fun deleteMedicineById(medicineId: String): Int
}
