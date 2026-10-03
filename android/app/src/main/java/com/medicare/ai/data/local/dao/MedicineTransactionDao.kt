package com.medicare.ai.data.local.dao

import androidx.room.Dao
import androidx.room.Transaction
import com.medicare.ai.data.local.entity.DoseEventEntity
import com.medicare.ai.data.local.entity.StockEventEntity
import com.medicare.ai.data.local.model.DoseStatus
import com.medicare.ai.data.local.model.DoseVerificationType
import com.medicare.ai.data.local.model.StockEventReason
import com.medicare.ai.data.local.model.SyncState
import java.util.UUID

/**
 * High-reliability transaction DAO coordinating composite atomic operations
 * across DoseEvents, Medicine inventory, and StockEvents (PRD Section 13 & 60).
 */
@Dao
abstract class MedicineTransactionDao {

    /**
     * Atomically records a consumed medication dose:
     * 1. Updates DoseEvent status to TAKEN with action timestamp & verification mode.
     * 2. Decrements current stock on MedicineEntity.
     * 3. Records an auditable StockEventEntity with resulting stock snapshot.
     */
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

        // 1. Update Dose Event Status
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

    /**
     * Atomically records a stock refill:
     * 1. Increments current stock on MedicineEntity.
     * 2. Writes an auditable REFILL_RECEIVED StockEvent.
     */
    @Transaction
    open suspend fun recordRefill(
        medicineDao: MedicineDao,
        stockEventDao: StockEventDao,
        medicineId: String,
        addedQuantity: Double,
        refillBatchNote: String? = null
    ): Boolean {
        val medicine = medicineDao.getMedicineById(medicineId) ?: return false

        val currentTime = System.currentTimeMillis()
        val newStock = medicine.currentStock + addedQuantity
        val eventId = UUID.randomUUID().toString()

        medicineDao.updateStock(
            medicineId = medicineId,
            newStock = newStock,
            eventId = eventId,
            syncState = SyncState.LOCAL,
            timestamp = currentTime
        )

        val stockEvent = StockEventEntity(
            eventId = eventId,
            medicineId = medicine.medicineId,
            patientId = medicine.patientId,
            quantityChange = addedQuantity,
            resultingStock = newStock,
            reason = StockEventReason.REFILL_RECEIVED,
            associatedDoseEventId = null,
            notes = refillBatchNote ?: "Refill received (+ $addedQuantity ${medicine.unit})",
            timestamp = currentTime,
            syncState = SyncState.LOCAL,
            version = 1L
        )
        stockEventDao.insertStockEvent(stockEvent)

        return true
    }
}
