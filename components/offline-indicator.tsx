"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WifiOff, Wifi, RefreshCw } from "lucide-react"
import { syncManager } from "@/lib/sync-manager"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    // Initialize sync manager
    syncManager.startAutoSync()

    // Update online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    updateOnlineStatus()
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    // Update sync status periodically
    const interval = setInterval(async () => {
      const status = await syncManager.getStatus()
      setSyncStatus(status)
    }, 5000)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
      clearInterval(interval)
    }
  }, [])

  const handleForceSync = async () => {
    setSyncing(true)
    await syncManager.forceSyncNow()
    const status = await syncManager.getStatus()
    setSyncStatus(status)
    setSyncing(false)
  }

  if (isOnline && (!syncStatus || syncStatus.syncQueueSize === 0)) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {!isOnline ? (
        <Alert className="bg-amber-50 border-amber-300">
          <WifiOff className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>Offline Mode</strong>
            <br />
            You're working offline. Data will sync automatically when online.
          </AlertDescription>
        </Alert>
      ) : syncStatus && syncStatus.syncQueueSize > 0 ? (
        <Alert className="bg-blue-50 border-blue-300">
          <Wifi className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 flex items-center justify-between">
            <div>
              <strong>Syncing Data...</strong>
              <br />
              {syncStatus.syncQueueSize} item(s) pending sync
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleForceSync}
              disabled={syncing}
              className="ml-2"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
