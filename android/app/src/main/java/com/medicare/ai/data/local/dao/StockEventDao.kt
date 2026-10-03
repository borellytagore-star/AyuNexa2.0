package com.medicare.ai.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.medicare.ai.data.local.entity.StockEventEntity
import com.medicare.ai.data.local.model.SyncState
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for Stock Events.
 * Provides an append-only audit trail for all medication inventory adjustments (PRD Section 13, 14, 49).
 */
@Dao
interface StockEventDao {

    @Query("SELECT * FROM stock_events WHERE patient_id = :patientId ORDER BY timestamp DESC")
    fun observeAllStockEvents(patientId: String): Flow<List<StockEventEntity>>

    @Query("SELECT * FROM stock_events WHERE medicine_id = :medicineId ORDER BY timestamp DESC")
    fun observeStockHistoryForMedicine(medicineId: String): Flow<List<StockEventEntity>>

    @Query("SELECT * FROM stock_events WHERE patient_id = :patientId AND timestamp BETWEEN :startTime AND :endTime ORDER BY timestamp DESC")
    fun observeStockEventsForPeriod(patientId: String, startTime: Long, endTime: Long): Flow<List<StockEventEntity>>

    @Query("SELECT * FROM stock_events WHERE sync_state IN ('LOCAL', 'QUEUED', 'FAILED') ORDER BY timestamp ASC")
    fun observePendingSyncStockEvents(): Flow<List<StockEventEntity>>

    @Query("SELECT * FROM stock_events WHERE sync_state IN ('LOCAL', 'QUEUED', 'FAILED') ORDER BY timestamp ASC")
    suspend fun getStockEventsPendingSync(): List<StockEventEntity>

    @Query("SELECT * FROM stock_events WHERE event_id = :eventId LIMIT 1")
    suspend fun getStockEventById(eventId: String): StockEventEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockEvent(stockEvent: StockEventEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockEvents(stockEvents: List<StockEventEntity>): List<Long>

    @Query("UPDATE stock_events SET sync_state = :syncState, timestamp = :timestamp WHERE event_id = :eventId")
    suspend fun updateSyncState(eventId: String, syncState: SyncState, timestamp: Long = System.currentTimeMillis())

    @Delete
    suspend fun deleteStockEvent(stockEvent: StockEventEntity): Int
}
