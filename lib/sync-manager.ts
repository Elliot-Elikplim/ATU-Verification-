// Sync manager for background sync operations
import { localDB } from './db'

class SyncManager {
  private syncing = false
  private syncInterval: NodeJS.Timeout | null = null
  private readonly SYNC_INTERVAL = 30000 // 30 seconds
  private readonly MAX_RETRIES = 5
  private apiEndpoint = '/api'

  // Set API endpoint
  setApiEndpoint(endpoint: string) {
    this.apiEndpoint = endpoint
  }

  // Start automatic background sync
  startAutoSync() {
    if (this.syncInterval) return

    // Initial sync
    this.syncAll()

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.syncAll()
    }, this.SYNC_INTERVAL)

    // Sync when coming online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('📡 Network online - syncing data...')
        this.syncAll()
      })

      window.addEventListener('offline', () => {
        console.log('📴 Network offline - using local storage')
      })
    }
  }

  // Stop automatic sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Check if online
  isOnline(): boolean {
    if (typeof window === 'undefined') return true
    return navigator.onLine
  }

  // Sync all pending items
  async syncAll() {
    if (this.syncing || !this.isOnline()) return

    this.syncing = true
    console.log('🔄 Starting sync...')

    try {
      const queue = await localDB.getSyncQueue()
      console.log(`📦 Found ${queue.length} items to sync`)

      for (const item of queue) {
        try {
          // Skip if too many retries
          if (item.retryCount >= this.MAX_RETRIES) {
            console.error(`❌ Max retries reached for item ${item.id}`, item)
            continue
          }

          switch (item.type) {
            case 'verification':
              await this.syncVerification(item.data)
              await localDB.removeSyncQueueItem(item.id)
              await localDB.markVerificationSynced(item.data.email)
              console.log(`✅ Synced verification: ${item.data.email}`)
              break

            case 'code_usage':
              await this.syncCodeUsage(item.data.code)
              await localDB.removeSyncQueueItem(item.id)
              console.log(`✅ Synced code usage: ${item.data.code}`)
              break

            case 'code_generation':
              // Handle bulk code generation sync if needed
              await localDB.removeSyncQueueItem(item.id)
              break
          }
        } catch (error) {
          console.error(`❌ Failed to sync item ${item.id}:`, error)
          await localDB.incrementSyncRetry(item.id)
        }
      }

      console.log('✅ Sync completed')
    } catch (error) {
      console.error('❌ Sync error:', error)
    } finally {
      this.syncing = false
    }
  }

  // Sync verification to Supabase
  private async syncVerification(data: any) {
    const response = await fetch(`${this.apiEndpoint}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        indexNumber: data.indexNumber,
        referenceCode: data.referenceCode,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Sync failed')
    }

    return await response.json()
  }

  // Sync code usage to Supabase
  private async syncCodeUsage(code: string) {
    const response = await fetch(`${this.apiEndpoint}/sync/code-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      throw new Error('Failed to sync code usage')
    }
  }

  // Force immediate sync
  async forceSyncNow() {
    if (this.syncing) {
      console.log('⏳ Sync already in progress...')
      return
    }
    await this.syncAll()
  }

  // Get sync status
  async getStatus() {
    const stats = await localDB.getStats()
    return {
      isOnline: this.isOnline(),
      isSyncing: this.syncing,
      ...stats,
    }
  }
}

export const syncManager = new SyncManager()
