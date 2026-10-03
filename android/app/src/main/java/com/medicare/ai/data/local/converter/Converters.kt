package com.medicare.ai.data.local.converter

import androidx.room.TypeConverter
import com.medicare.ai.data.local.model.DoseStatus
import com.medicare.ai.data.local.model.DoseVerificationType
import com.medicare.ai.data.local.model.FoodInstruction
import com.medicare.ai.data.local.model.MedicineForm
import com.medicare.ai.data.local.model.ScheduleFrequency
import com.medicare.ai.data.local.model.StockEventReason
import com.medicare.ai.data.local.model.SyncState
import com.medicare.ai.data.local.model.UserRole

/**
 * Room Type Converters for Enums, Lists, and complex domain objects.
 */
class Converters {

    @TypeConverter
    fun fromSyncState(value: SyncState?): String? = value?.name

    @TypeConverter
    fun toSyncState(value: String?): SyncState =
        value?.let { runCatching { SyncState.valueOf(it) }.getOrDefault(SyncState.LOCAL) } ?: SyncState.LOCAL

    @TypeConverter
    fun fromUserRole(value: UserRole?): String? = value?.name

    @TypeConverter
    fun toUserRole(value: String?): UserRole =
        value?.let { runCatching { UserRole.valueOf(it) }.getOrDefault(UserRole.PATIENT) } ?: UserRole.PATIENT

    @TypeConverter
    fun fromMedicineForm(value: MedicineForm?): String? = value?.name

    @TypeConverter
    fun toMedicineForm(value: String?): MedicineForm =
        value?.let { runCatching { MedicineForm.valueOf(it) }.getOrDefault(MedicineForm.TABLET) } ?: MedicineForm.TABLET

    @TypeConverter
    fun fromFoodInstruction(value: FoodInstruction?): String? = value?.name

    @TypeConverter
    fun toFoodInstruction(value: String?): FoodInstruction =
        value?.let { runCatching { FoodInstruction.valueOf(it) }.getOrDefault(FoodInstruction.NO_RESTRICTION) } ?: FoodInstruction.NO_RESTRICTION

    @TypeConverter
    fun fromScheduleFrequency(value: ScheduleFrequency?): String? = value?.name

    @TypeConverter
    fun toScheduleFrequency(value: String?): ScheduleFrequency =
        value?.let { runCatching { ScheduleFrequency.valueOf(it) }.getOrDefault(ScheduleFrequency.ONCE_DAILY) } ?: ScheduleFrequency.ONCE_DAILY

    @TypeConverter
    fun fromDoseStatus(value: DoseStatus?): String? = value?.name

    @TypeConverter
    fun toDoseStatus(value: String?): DoseStatus =
        value?.let { runCatching { DoseStatus.valueOf(it) }.getOrDefault(DoseStatus.SCHEDULED) } ?: DoseStatus.SCHEDULED

    @TypeConverter
    fun fromDoseVerificationType(value: DoseVerificationType?): String? = value?.name

    @TypeConverter
    fun toDoseVerificationType(value: String?): DoseVerificationType =
        value?.let { runCatching { DoseVerificationType.valueOf(it) }.getOrDefault(DoseVerificationType.NONE) } ?: DoseVerificationType.NONE

    @TypeConverter
    fun fromStockEventReason(value: StockEventReason?): String? = value?.name

    @TypeConverter
    fun toStockEventReason(value: String?): StockEventReason =
        value?.let { runCatching { StockEventReason.valueOf(it) }.getOrDefault(StockEventReason.MANUAL_CORRECTION) } ?: StockEventReason.MANUAL_CORRECTION
}
