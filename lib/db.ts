// IndexedDB wrapper for local-first storage
import { openDB, IDBPDatabase } from 'idb'

interface VerificationData {
  id: string
  fullName: string
  email: string
  indexNumber: string
  referenceCode: string
  timestamp: number
  synced: boolean
  retryCount: number
}

interface CodeData {
  code: string
  indexNumber: string
  status: 'unused' | 'used'
  generatedAt: number
  synced: boolean
}

interface SyncQueueItem {
  id?: number
  type: 'verification' | 'code_generation' | 'code_usage'
  data: any
  timestamp: number
  retryCount: number
}

class LocalDB {
  private db: IDBPDatabase | null = null
  private readonly DB_NAME = 'verification-platform'
  private readonly DB_VERSION = 1

  async init() {
    if (this.db) return this.db

    this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Store pending verifications
        if (!db.objectStoreNames.contains('verifications')) {
          const verificationStore = db.createObjectStore('verifications', {
            keyPath: 'email',
          })
          verificationStore.createIndex('synced', 'synced')
          verificationStore.createIndex('timestamp', 'timestamp')
        }

        // Store reference codes locally
        if (!db.objectStoreNames.contains('codes')) {
          const codesStore = db.createObjectStore('codes', {
            keyPath: 'code',
          })
          codesStore.createIndex('status', 'status')
          codesStore.createIndex('synced', 'synced')
        }

        // Sync queue for all operations
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true,
          })
          syncStore.createIndex('type', 'type')
          syncStore.createIndex('timestamp', 'timestamp')
        }
      },
    })

    return this.db
  }

  // Add verification to local storage
  async addVerification(data: {
    fullName: string
    email: string
    indexNumber: string
    referenceCode: string
  }) {
    const db = await this.init()
    const verification = {
      id: crypto.randomUUID(),
      ...data,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0,
    }

    await db.add('verifications', verification)
    
    // Add to sync queue
    await db.add('syncQueue', {
      type: 'verification',
      data: verification,
      timestamp: Date.now(),
      retryCount: 0,
    })

    return verification
  }

  // Get unsynced verifications
  async getUnsyncedVerifications() {
    const db = await this.init()
    const index = db.transaction('verifications').store.index('synced')
    return await index.getAll(IDBKeyRange.only(false))
  }

  // Mark verification as synced
  async markVerificationSynced(email: string) {
    const db = await this.init()
    const verification = await db.get('verifications', email)
    if (verification) {
      verification.synced = true
      await db.put('verifications', verification)
    }
  }

  // Add code to local storage
  async addCode(code: string, indexNumber: string) {
    const db = await this.init()
    await db.add('codes', {
      code,
      indexNumber,
      status: 'unused',
      generatedAt: Date.now(),
      synced: false,
    })
  }

  // Get code from local storage
  async getCode(code: string) {
    const db = await this.init()
    return await db.get('codes', code)
  }

  // Mark code as used locally
  async markCodeUsed(code: string) {
    const db = await this.init()
    const codeData = await db.get('codes', code)
    if (codeData) {
      codeData.status = 'used'
      codeData.synced = false
      await db.put('codes', codeData)

      // Add to sync queue
      await db.add('syncQueue', {
        type: 'code_usage',
        data: { code },
        timestamp: Date.now(),
        retryCount: 0,
      })
    }
  }

  // Get all unsynced items in queue
  async getSyncQueue() {
    const db = await this.init()
    return await db.getAll('syncQueue')
  }

  // Remove item from sync queue
  async removeSyncQueueItem(id: number) {
    const db = await this.init()
    await db.delete('syncQueue', id)
  }

  // Update retry count for sync queue item
  async incrementSyncRetry(id: number) {
    const db = await this.init()
    const item = await db.get('syncQueue', id)
    if (item) {
      item.retryCount++
      await db.put('syncQueue', item)
    }
  }

  // Cache reference codes for offline access
  async cacheReferenceCodes(codes: any[]) {
    const db = await this.init()
    const tx = db.transaction('codes', 'readwrite')
    
    for (const code of codes) {
      await tx.store.put({
        code: code.code,
        indexNumber: code.index_number,
        status: code.status,
        generatedAt: new Date(code.created_at).getTime(),
        synced: true,
      })
    }
    
    await tx.done
  }

  // Get all codes from local cache
  async getAllCodes() {
    const db = await this.init()
    return await db.getAll('codes')
  }

  // Clear all data (for testing/debugging)
  async clearAll() {
    const db = await this.init()
    await db.clear('verifications')
    await db.clear('codes')
    await db.clear('syncQueue')
  }

  // Get stats
  async getStats() {
    const db = await this.init()
    const [verifications, codes, syncQueue] = await Promise.all([
      db.count('verifications'),
      db.count('codes'),
      db.count('syncQueue'),
    ])

    const unsyncedVerifications = await this.getUnsyncedVerifications()

    return {
      totalVerifications: verifications,
      totalCodes: codes,
      syncQueueSize: syncQueue,
      unsyncedCount: unsyncedVerifications.length,
    }
  }
}

export const localDB = new LocalDB()
