"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSettings } from "@/lib/settings-store"
import { useState, useEffect } from "react"
import { Wifi, WifiOff, Database, Globe, RefreshCw } from "lucide-react"
import { localDB } from "@/lib/db"
import { syncManager } from "@/lib/sync-manager"

export default function SettingsPage() {
  const { offlineMode, setOfflineMode, apiEndpoint, setApiEndpoint } = useSettings()
  const [localEndpoint, setLocalEndpoint] = useState(apiEndpoint)
  const [dbStats, setDbStats] = useState<any>(null)
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    const stats = await localDB.getStats()
    const status = await syncManager.getStatus()
    setDbStats(stats)
    setSyncStatus(status)
  }

  const handleSaveEndpoint = () => {
    setApiEndpoint(localEndpoint)
    setMessage({ type: 'success', text: 'API endpoint updated successfully' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleToggleOfflineMode = (enabled: boolean) => {
    setOfflineMode(enabled)
    
    if (enabled) {
      syncManager.startAutoSync()
      setMessage({ type: 'success', text: 'Offline mode enabled - data will sync automatically' })
    } else {
      syncManager.stopAutoSync()
      setMessage({ type: 'success', text: 'Online-only mode enabled - all operations direct to server' })
    }
    
    setTimeout(() => setMessage(null), 3000)
  }

  const handleClearLocalData = async () => {
    if (confirm('Are you sure? This will delete all local data. Synced data will remain on the server.')) {
      await localDB.clearAll()
      setMessage({ type: 'success', text: 'Local database cleared successfully' })
      loadStats()
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleForceSync = async () => {
    setMessage({ type: 'success', text: 'Syncing...' })
    await syncManager.forceSyncNow()
    await loadStats()
    setMessage({ type: 'success', text: 'Sync completed successfully' })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-600">Configure offline mode and API endpoints</p>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-900' : 'text-red-900'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Offline Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {offlineMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            Offline-First Mode
          </CardTitle>
          <CardDescription>
            Enable local-first architecture with automatic background sync
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="offline-mode" className="text-base font-medium">
                Enable Offline Mode
              </Label>
              <p className="text-sm text-slate-600">
                {offlineMode
                  ? 'Data is stored locally and synced automatically when online'
                  : 'All operations go directly to the server (requires stable internet)'}
              </p>
            </div>
            <Switch
              id="offline-mode"
              checked={offlineMode}
              onCheckedChange={handleToggleOfflineMode}
            />
          </div>

          {offlineMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Local Database Status
              </h4>
              {dbStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-600 font-medium">Verifications</p>
                    <p className="text-2xl font-bold text-blue-900">{dbStats.totalVerifications}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Cached Codes</p>
                    <p className="text-2xl font-bold text-blue-900">{dbStats.totalCodes}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Sync Queue</p>
                    <p className="text-2xl font-bold text-blue-900">{dbStats.syncQueueSize}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Unsynced</p>
                    <p className="text-2xl font-bold text-blue-900">{dbStats.unsyncedCount}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleForceSync} size="sm" variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Force Sync Now
                </Button>
                <Button onClick={handleClearLocalData} size="sm" variant="destructive">
                  Clear Local Data
                </Button>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">💡 When to use each mode:</h4>
            <ul className="space-y-1 text-sm text-amber-800">
              <li><strong>Offline Mode:</strong> Field events, unstable networks, remote locations</li>
              <li><strong>Online-Only:</strong> Stable internet, real-time sync required, shared devices</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoint Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            API Endpoint
          </CardTitle>
          <CardDescription>
            Configure the API endpoint for syncing data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-endpoint">API Base URL</Label>
            <div className="flex gap-2">
              <Input
                id="api-endpoint"
                type="text"
                value={localEndpoint}
                onChange={(e) => setLocalEndpoint(e.target.value)}
                placeholder="/api or https://your-domain.com/api"
                className="flex-1"
              />
              <Button onClick={handleSaveEndpoint}>Save</Button>
            </div>
            <p className="text-sm text-slate-600">
              Current: <code className="bg-slate-100 px-2 py-1 rounded">{apiEndpoint}</code>
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Examples:</h4>
            <ul className="space-y-1 text-sm text-slate-700 font-mono">
              <li>• <code>/api</code> - Use same domain (default)</li>
              <li>• <code>http://localhost:3000/api</code> - Local development</li>
              <li>• <code>https://api.yourdomain.com</code> - Custom API server</li>
              <li>• <code>https://your-vercel-app.vercel.app/api</code> - Vercel deployment</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Sync Status */}
      {offlineMode && syncStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Network Status</p>
                <p className="text-lg font-semibold">
                  {syncStatus.isOnline ? (
                    <span className="text-green-600 flex items-center gap-2">
                      <Wifi className="w-4 h-4" /> Online
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-2">
                      <WifiOff className="w-4 h-4" /> Offline
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Sync Status</p>
                <p className="text-lg font-semibold">
                  {syncStatus.isSyncing ? (
                    <span className="text-blue-600">Syncing...</span>
                  ) : (
                    <span className="text-green-600">Idle</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
