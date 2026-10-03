package com.medicare.ai.data.local.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.db.SupportSQLiteDatabase
import com.medicare.ai.data.local.converter.Converters
import com.medicare.ai.data.local.dao.DoseEventDao
import com.medicare.ai.data.local.dao.MedicineDao
import com.medicare.ai.data.local.dao.MedicineScheduleDao
import com.medicare.ai.data.local.dao.MedicineTransactionDao
import com.medicare.ai.data.local.dao.StockEventDao
import com.medicare.ai.data.local.dao.UserDao
import com.medicare.ai.data.local.entity.DoseEventEntity
import com.medicare.ai.data.local.entity.MedicineEntity
import com.medicare.ai.data.local.entity.MedicineScheduleEntity
import com.medicare.ai.data.local.entity.StockEventEntity
import com.medicare.ai.data.local.entity.UserEntity

/**
 * MediCare AI Room Database.
 * The persistent offline-first source of truth for all local medication operations.
 *
 * Implements:
 * - PRD Section 40 & 41: Event-based synchronization ledger
 * - PRD Section 49: Core Data Models (User, Medicine, MedicineSchedule, DoseEvent, StockEvent)
 * - PRD Section 60: Priority 1 & 2 (Medicine Engine & Local Database Foundation)
 */
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
abstract class MediCareDatabase : RoomDatabase() {

    abstract fun userDao(): UserDao
    abstract fun medicineDao(): MedicineDao
    abstract fun medicineScheduleDao(): MedicineScheduleDao
    abstract fun doseEventDao(): DoseEventDao
    abstract fun stockEventDao(): StockEventDao
    abstract fun medicineTransactionDao(): MedicineTransactionDao

    companion object {
        const val DATABASE_NAME = "medicare_ai.db"

        @Volatile
        private var INSTANCE: MediCareDatabase? = null

        fun getInstance(context: Context): MediCareDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    MediCareDatabase::class.java,
                    DATABASE_NAME
                )
                    .fallbackToDestructiveMigration() // Switch to explicit Migration objects in production
                    .addCallback(DatabaseCallback())
                    .build()
                INSTANCE = instance
                instance
            }
        }

        /**
         * Room lifecycle callback for initial seeding or database preparation.
         */
        private class DatabaseCallback : Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                // DB created. Initial seed data or system triggers can be initialized here
            }

            override fun onOpen(db: SupportSQLiteDatabase) {
                super.onOpen(db)
                // Enable SQLite Foreign Key constraints
                db.execSQL("PRAGMA foreign_keys=ON;")
            }
        }
    }
}
