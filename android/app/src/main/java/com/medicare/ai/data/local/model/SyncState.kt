package com.medicare.ai.data.local.model

/**
 * Lifecycle states for event-based offline-first synchronization.
 * Follows PRD Section 40 & 41: Local -> Queued -> Uploading -> Synced / Failed.
 */
enum class SyncState {
    /**
     * Stored strictly in local Room database, awaiting offline work or queueing.
     */
    LOCAL,

    /**
     * Marked ready for background sync worker (WorkManager).
     */
    QUEUED,

    /**
     * Currently being transferred to the remote backend or caregiver broker.
     */
    UPLOADING,

    /**
     * Successfully acknowledged and synchronized with the remote backend.
     */
    SYNCED,

    /**
     * Upload failed due to network error or validation, scheduled for exponential backoff retry.
     */
    FAILED
}
