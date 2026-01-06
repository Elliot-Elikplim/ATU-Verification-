# 🔄 Offline-First & Auto-Sync Feature

## Overview
The verification platform now supports **local-first architecture** with IndexedDB for offline functionality and automatic background synchronization when online.

## Key Features

### 1. **Offline Storage (IndexedDB)**
- All verification data stored locally in browser
- Works completely offline
- No data loss even without internet
- ~50MB+ storage capacity per origin

### 2. **Automatic Sync**
- Auto-syncs every 30 seconds when online
- Immediate sync when connection restored
- Retries failed syncs up to 5 times
- Manual sync button available

### 3. **Smart Fallback**
- Try online verification first
- Fall back to offline if network fails
- Seamless user experience
- Clear status indicators

## Architecture

### Components

#### 1. `lib/db.ts` - IndexedDB Wrapper
```typescript
- verifications: Pending user verifications
- codes: Cached reference codes
- syncQueue: Operations waiting to sync
```

**Main Functions:**
- `addVerification()` - Store verification offline
- `getUnsyncedVerifications()` - Get items to sync
- `markVerificationSynced()` - Mark as synced
- `cacheReferenceCodes()` - Cache codes for offline use

#### 2. `lib/sync-manager.ts` - Sync Orchestrator
```typescript
- startAutoSync() - Begin background sync (30s interval)
- syncAll() - Process all pending items
- forceSyncNow() - Manual immediate sync
- getStatus() - Current sync state
```

**Event Listeners:**
- `online` - Triggers sync when connection restored
- `offline` - Logs offline mode

#### 3. `components/offline-indicator.tsx` - UI Component
- Shows offline status badge
- Displays pending sync count
- Manual sync button
- Auto-updates every 5 seconds

### Database Schema

```typescript
interface VerificationDB {
  verifications: {
    id: string          // UUID
    fullName: string
    email: string       // Primary key
    indexNumber: string
    referenceCode: string
    timestamp: number
    synced: boolean
    retryCount: number
  }
  
  codes: {
    code: string        // Primary key
    indexNumber: string
    status: 'unused' | 'used'
    generatedAt: number
    synced: boolean
  }
  
  syncQueue: {
    id: number          // Auto-increment
    type: 'verification' | 'code_generation' | 'code_usage'
    data: any
    timestamp: number
    retryCount: number
  }
}
```

## User Experience

### Online Mode (Default)
1. User submits verification form
2. Sends to `/api/verify` immediately
3. Success → Redirect to success page
4. Error → Show error message

### Offline Mode
1. User submits verification form
2. Detects offline (or online request fails)
3. Saves to IndexedDB
4. Shows "Saved offline! Will sync when online."
5. Yellow badge appears: "Offline Mode"

### Auto-Sync (When Online)
1. Every 30 seconds, check sync queue
2. Process each item in queue
3. On success: Remove from queue, mark synced
4. On error: Increment retry count
5. Skip after 5 failed retries

### Manual Sync
1. User sees blue badge: "3 items pending sync"
2. Clicks refresh button
3. Forces immediate sync
4. Updates badge status

## API Endpoints

### Existing
- `POST /api/verify` - Main verification endpoint
- `GET /api/verification-status` - Check status

### New
- `POST /api/sync/code-usage` - Sync code usage status

## Usage Examples

### Initialize Sync Manager
```typescript
import { syncManager } from '@/lib/sync-manager'

// Start auto-sync (called in app layout or page)
syncManager.startAutoSync()

// Force sync manually
await syncManager.forceSyncNow()

// Get status
const status = await syncManager.getStatus()
console.log(status.syncQueueSize) // Pending items
```

### Store Verification Offline
```typescript
import { localDB } from '@/lib/db'

await localDB.addVerification({
  fullName: "John Doe",
  email: "john@example.com",
  indexNumber: "123456",
  referenceCode: "CPS-ABC123"
})
```

### Check Sync Status
```typescript
const stats = await localDB.getStats()
console.log(stats)
// {
//   totalVerifications: 5,
//   totalCodes: 1000,
//   syncQueueSize: 3,
//   unsyncedCount: 2
// }
```

## Benefits

### For Users
✅ **Never lose data** - Works without internet
✅ **Seamless experience** - Auto-sync in background
✅ **Clear feedback** - Status indicators
✅ **Fast** - Local-first is instant

### For Admins
✅ **Reliability** - No verification lost due to network
✅ **Scalability** - Reduces server load
✅ **Offline events** - Can verify at locations without WiFi
✅ **Queue management** - See pending syncs

### Technical
✅ **Progressive Enhancement** - Works everywhere
✅ **Resilient** - Auto-retry failed syncs
✅ **Efficient** - Batch processing, 30s intervals
✅ **Observable** - Clear status and debugging

## Monitoring & Debugging

### Check Local Database
```typescript
// Open browser DevTools → Application → IndexedDB → verification-platform

// Or programmatically:
import { localDB } from '@/lib/db'

const stats = await localDB.getStats()
const queue = await localDB.getSyncQueue()
console.log('Pending items:', queue)
```

### Console Logs
```
🔄 Starting sync...
📦 Found 3 items to sync
✅ Synced verification: john@example.com
✅ Synced code usage: CPS-ABC123
✅ Sync completed
```

### Error Handling
```
❌ Failed to sync item 123: Network error
❌ Max retries reached for item 456
```

## Configuration

### Sync Settings (in `lib/sync-manager.ts`)
```typescript
private readonly SYNC_INTERVAL = 30000  // 30 seconds
private readonly MAX_RETRIES = 5        // Max retry attempts
```

### Storage Limits
- IndexedDB: ~50MB-100MB per origin (browser dependent)
- Enough for thousands of verifications
- Auto-managed by browser

## Future Enhancements

### Possible Additions
1. **Service Worker** - Background sync even when tab closed
2. **Conflict Resolution** - Handle simultaneous edits
3. **Compression** - Store more data
4. **Partial Sync** - Sync only changed fields
5. **Admin Dashboard** - View all pending syncs across users
6. **Export/Import** - Backup local data

### Advanced Features
- **Delta Sync** - Only sync changes, not full records
- **Optimistic UI** - Show success immediately, sync later
- **Offline Analytics** - Track offline usage patterns
- **Push Notifications** - Alert when sync completes

## Testing

### Test Offline Mode
1. Open DevTools → Network tab
2. Toggle "Offline" checkbox
3. Submit verification form
4. Should see "Saved offline!" message
5. Check Application → IndexedDB → verification-platform
6. Toggle online again
7. Watch console for sync logs

### Test Retry Logic
1. Submit verification offline
2. Stay offline for 2+ minutes
3. Check console for retry attempts
4. Go online before 5 retries
5. Should sync successfully

### Test Manual Sync
1. Add verifications offline
2. Go online
3. Click manual sync button in badge
4. Should see spinner and sync complete

## Troubleshooting

### Sync Not Working
1. Check browser console for errors
2. Verify IndexedDB is enabled (Private browsing disables it)
3. Check network tab for API call failures
4. Verify Supabase RLS policies allow operations

### Data Not Persisting
1. Check storage quota: `navigator.storage.estimate()`
2. Clear browser data if quota exceeded
3. Check if IndexedDB is disabled in settings

### Retries Failing
1. Check console for specific error messages
2. Verify API endpoints are working
3. Check if max retries (5) exceeded
4. Manually clear sync queue if needed:
   ```typescript
   await localDB.clearAll()
   ```

## Security Considerations

### Local Storage
- Data stored in browser (user's device)
- Not encrypted by default
- Cleared when user clears browser data
- **Don't store sensitive data** (passwords, payment info)

### Sync Safety
- All syncs use HTTPS
- Same authentication as direct API calls
- RLS policies still apply
- No bypass of security

### Best Practices
✅ Only store necessary verification data
✅ Clear synced data after success
✅ Implement data retention policies
✅ Log sync activities for audit

---

## Summary

The offline-first feature makes your verification platform:
- **Reliable**: Never lose data
- **Fast**: Instant local operations  
- **Resilient**: Auto-retry and recovery
- **User-friendly**: Clear status indicators

Perfect for events, field operations, or unstable networks! 🚀
