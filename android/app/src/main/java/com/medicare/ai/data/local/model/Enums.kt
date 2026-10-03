package com.medicare.ai.data.local.model

/**
 * User roles according to PRD Section 5 & 49.
 */
enum class UserRole {
    PATIENT,
    CAREGIVER,
    DOCTOR
}

/**
 * Physical form of medicine for dosage and UI rendering.
 */
enum class MedicineForm {
    TABLET,
    CAPSULE,
    LIQUID_ML,
    INJECTION,
    INHALER,
    DROPS,
    TOPICAL,
    PATCH,
    OTHER
}

/**
 * Meal context instruction to ensure safe ingestion.
 */
enum class FoodInstruction {
    BEFORE_MEAL,
    AFTER_MEAL,
    WITH_MEAL,
    EMPTY_STOMACH,
    NO_RESTRICTION
}

/**
 * Frequency patterns supported by the Medicine Engine wizard (PRD Section 8.2 & 9).
 */
enum class ScheduleFrequency {
    ONCE_DAILY,
    TWICE_DAILY,
    THRICE_DAILY,
    FOUR_TIMES_DAILY,
    EVERY_N_HOURS,
    SPECIFIC_DAYS,
    ALTERNATE_DAYS,
    WEEKLY,
    AS_NEEDED_PRN
}

/**
 * Complete status cycle for doses (PRD Section 11: Reminder States).
 * Important: NO_RESPONSE != Missed Dose.
 */
enum class DoseStatus {
    SCHEDULED,
    REMINDER_SENT,
    TAKEN,
    SNOOZED,
    SKIPPED,
    UNABLE_TO_TAKE,
    NO_RESPONSE
}

/**
 * Mechanism used to verify dose consumption.
 */
enum class DoseVerificationType {
    MANUAL_TAP,
    VOICE_CONFIRMATION,
    CAREGIVER_CONFIRMATION,
    SMART_PILLBOX,
    SYSTEM_TIMEOUT,
    NONE
}

/**
 * Auditable reasons for any inventory stock change (PRD Section 13 & 49).
 */
enum class StockEventReason {
    INITIAL_STOCK,
    DOSE_CONSUMED,
    REFILL_RECEIVED,
    MANUAL_CORRECTION,
    MEDICINE_DISCARDED,
    PRESCRIPTION_CHANGED
}
