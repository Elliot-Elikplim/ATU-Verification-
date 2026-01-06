import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  offlineMode: boolean
  setOfflineMode: (enabled: boolean) => void
  apiEndpoint: string
  setApiEndpoint: (endpoint: string) => void
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      // Default from env, fallback to true for offline-first
      offlineMode: process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true' || true,
      setOfflineMode: (enabled) => set({ offlineMode: enabled }),
      
      // Default API endpoint
      apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || '/api',
      setApiEndpoint: (endpoint) => set({ apiEndpoint: endpoint }),
    }),
    {
      name: 'verification-settings',
    }
  )
)
