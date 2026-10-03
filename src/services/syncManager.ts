import { SyncLogEntry, CloudBackupInfo } from '../types';

export type SyncStatusState =
  | 'IDLE'
  | 'CONNECTIVITY_LOST'
  | 'CONNECTIVITY_RESTORED'
  | 'PREPARING_ROOM_SNAPSHOT'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED';

export interface RoomDatabaseSnapshot {
  timestamp: number;
  checksum: string;
  entities: {
    medicines: number;
    doses: number;
    stockEvents: number;
    auditLogs: number;
    carePlans: number;
  };
}

export interface RoomSnapshotCounts {
  medicinesCount: number;
  dosesCount: number;
  stockEventsCount: number;
  auditLogsCount: number;
  carePlansCount: number;
}

class SynchronizationManager {
  private status: SyncStatusState = 'IDLE';
  private listeners: Set<(status: SyncStatusState, backupInfo: CloudBackupInfo) => void> = new Set();
  private autoSyncOnReconnect: boolean = true;
  private history: SyncLogEntry[] = [];
  private lastSyncTimestamp: string = 'Just now';
  private cloudEndpoint: string = 'https://api.ayunexa.health/v1/sync/room-backup';
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    this.initNetworkListeners();
    this.initHistory();
  }

  private initHistory() {
    this.history = [
      {
        id: 'sync-init-1',
        timestamp: '10:00 AM',
        trigger: 'SCHEDULED_INTERVAL',
        status: 'SUCCESS',
        entitiesCount: {
          medicines: 3,
          doses: 4,
          stockEvents: 3,
          auditLogs: 12,
          carePlans: 2,
        },
        snapshotChecksum: 'sha256:7f4a9b81...e2c4',
        durationMs: 380,
        message: 'Initial Room database cloud backup completed successfully.',
      },
    ];
  }

  private initNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleConnectivityRestored();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.status = 'CONNECTIVITY_LOST';
      this.notifyListeners();
    });
  }

  public subscribe(listener: (status: SyncStatusState, backupInfo: CloudBackupInfo) => void) {
    this.listeners.add(listener);
    listener(this.status, this.getCloudBackupInfo(0));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(pendingQueue: number = 0) {
    const info = this.getCloudBackupInfo(pendingQueue);
    this.listeners.forEach((listener) => listener(this.status, info));
  }

  public setAutoSyncOnReconnect(enabled: boolean) {
    this.autoSyncOnReconnect = enabled;
  }

  public isAutoSyncEnabled(): boolean {
    return this.autoSyncOnReconnect;
  }

  public getHistory(): SyncLogEntry[] {
    return [...this.history];
  }

  public getCloudBackupInfo(pendingQueue: number = 0): CloudBackupInfo {
    return {
      version: 'v2.4-AES256-GCM',
      lastBackupTime: this.lastSyncTimestamp,
      status: !this.isOnline ? 'OFFLINE' : this.status === 'SYNCING' ? 'SYNCING' : pendingQueue > 0 ? 'PENDING' : 'SYNCED',
      pendingQueueLength: pendingQueue,
      serverEndpoint: this.cloudEndpoint,
      encryption: 'AES-256-GCM (Zero-Knowledge Patient Enclave)',
    };
  }

  /**
   * Called when network connectivity returns (either by browser online event or simulated toggle)
   */
  public async handleConnectivityRestored(
    onSyncComplete?: (entry: SyncLogEntry) => void,
    snapshotData?: {
      medicinesCount: number;
      dosesCount: number;
      stockEventsCount: number;
      auditLogsCount: number;
      carePlansCount: number;
    }
  ): Promise<SyncLogEntry | null> {
    this.isOnline = true;
    this.status = 'CONNECTIVITY_RESTORED';
    this.notifyListeners();

    if (!this.autoSyncOnReconnect) {
      return null;
    }

    return this.executeSync('CONNECTIVITY_RESTORED', snapshotData, onSyncComplete);
  }

  /**
   * Execute synchronization pipeline between local Room database and remote cloud backup
   */
  public async executeSync(
    trigger: 'CONNECTIVITY_RESTORED' | 'MANUAL_TRIGGER' | 'SCHEDULED_INTERVAL',
    snapshotData?: RoomSnapshotCounts,
    onComplete?: (entry: SyncLogEntry) => void
  ): Promise<SyncLogEntry> {
    const startTime = Date.now();
    this.status = 'PREPARING_ROOM_SNAPSHOT';
    this.notifyListeners();

    // Small delay to simulate local SQLite Room transactional snapshot extraction
    await new Promise((resolve) => setTimeout(resolve, 350));

    this.status = 'SYNCING';
    this.notifyListeners();

    // Simulate encrypted cloud upload & remote acknowledgement
    await new Promise((resolve) => setTimeout(resolve, 600));

    const counts: RoomSnapshotCounts = snapshotData || {
      medicinesCount: 3,
      dosesCount: 4,
      stockEventsCount: 3,
      auditLogsCount: 15,
      carePlansCount: 2,
    };

    const hashHex = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const checksum = `sha256:ayunexa_${hashHex}_${Date.now().toString(16)}`;
    const duration = Date.now() - startTime;
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.lastSyncTimestamp = 'Just now';
    this.status = 'SYNCED';

    const logEntry: SyncLogEntry = {
      id: `sync-${Date.now()}`,
      timestamp: nowTimeStr,
      trigger,
      status: 'SUCCESS',
      entitiesCount: {
        medicines: counts.medicinesCount,
        doses: counts.dosesCount,
        stockEvents: counts.stockEventsCount,
        auditLogs: counts.auditLogsCount,
        carePlans: counts.carePlansCount,
      },
      snapshotChecksum: checksum,
      durationMs: duration,
      message: `Room SQLite snapshot synchronized with remote cloud backup (${duration}ms).`,
    };

    this.history.unshift(logEntry);
    if (this.history.length > 20) this.history.pop();

    this.notifyListeners(0);
    if (onComplete) {
      onComplete(logEntry);
    }

    return logEntry;
  }
}

export const syncManager = new SynchronizationManager();
