"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { localDB } from "@/lib/db"
import { syncManager } from "@/lib/sync-manager"
import { OfflineIndicator } from "@/components/offline-indicator"
import { useSettings } from "@/lib/settings-store"

export default function VerificationPage() {
  const { offlineMode, apiEndpoint } = useSettings()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    indexNumber: "",
    referenceCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!formData.fullName.trim()) {
      setMessage({ type: "error", text: "Full name is required" })
      return
    }
    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "Email is required" })
      return
    }
    if (!formData.indexNumber.trim()) {
      setMessage({ type: "error", text: "Student ID is required" })
      return
    }
    if (!formData.referenceCode.trim()) {
      setMessage({ type: "error", text: "Verification code is required" })
      return
    }

    setIsLoading(true)

    try {
      // Check if online
      const isOnline = typeof navigator !== 'undefined' && navigator.onLine

      // If offline mode is disabled, only try online
      if (!offlineMode) {
        const response = await fetch(`${apiEndpoint}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (response.ok) {
          if (data.redirectUrl) {
            window.location.href = data.redirectUrl
          } else {
            setMessage({ type: "success", text: data.message })
            setFormData({ fullName: "", email: "", indexNumber: "", referenceCode: "" })
          }
        } else {
          setMessage({ type: "error", text: data.error || "Verification failed" })
        }
        return
      }

      // Offline mode enabled - try online first, fallback to local
      if (isOnline) {
        // Try online verification first
        try {
          const response = await fetch(`${apiEndpoint}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          })

          const data = await response.json()

          if (response.ok) {
            // Redirect to success page
            if (data.redirectUrl) {
              window.location.href = data.redirectUrl
            } else {
              setMessage({ type: "success", text: data.message })
              setFormData({ fullName: "", email: "", indexNumber: "", referenceCode: "" })
            }
            return
          } else {
            setMessage({ type: "error", text: data.error || "Verification failed" })
            return
          }
        } catch (fetchError) {
          console.error("Online verification failed, falling back to offline mode:", fetchError)
          // Fall through to offline mode
        }
      }

      // Offline mode or online request failed
      await localDB.addVerification(formData)
      setMessage({ 
        type: "success", 
        text: "Saved offline! Your verification will sync automatically when online." 
      })
      setFormData({ fullName: "", email: "", indexNumber: "", referenceCode: "" })
      
      // Trigger sync if online
      if (isOnline) {
        syncManager.forceSyncNow()
      }
    } catch (error) {
      console.error("Verification error:", error)
      setMessage({ type: "error", text: "Failed to save verification. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white p-4 flex flex-col">
      <header className="py-8 text-center mb-12">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
            CS
          </div>
        </div>
        <h1 className="text-4xl font-bold text-primary mb-2">Computer Science Department</h1>
        <p className="text-lg text-muted-foreground">2026 Fee Verification Portal</p>
      </header>

      <div className="flex items-center justify-center flex-1">
        <Card className="w-full max-w-md shadow-2xl border">
          <CardHeader className="space-y-2 bg-white border-b">
            <CardTitle className="text-2xl text-primary">Fee Verification Portal</CardTitle>
            <CardDescription className="text-base">
              Enter your details and verification code to confirm your fee payment status
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Full Name</label>
                <Input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="bg-white border-gray-300 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Email Address</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="john@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white border-gray-300 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Index Number</label>
                <Input
                  type="text"
                  name="indexNumber"
                  placeholder="CS202X0001"
                  value={formData.indexNumber}
                  onChange={handleChange}
                  required
                  className="bg-white border-gray-300 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Verification Code</label>
                <Input
                  type="text"
                  name="referenceCode"
                  placeholder="CPS-XXXXX"
                  value={formData.referenceCode}
                  onChange={handleChange}
                  required
                  className="font-mono text-sm tracking-widest bg-white border-gray-300 focus:border-primary uppercase"
                />
                <p className="text-xs text-muted-foreground">Format: CPS-XXXXX (provided by department)</p>
              </div>

              {message && (
                <Alert
                  className={
                    message.type === "success"
                      ? "border-green-200 bg-green-50 text-green-900"
                      : "border-red-200 bg-red-50 text-red-900"
                  }
                >
                  <AlertDescription
                    className={message.type === "success" ? "text-green-800 font-medium" : "text-red-800 font-medium"}
                  >
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-colors"
              >
                {isLoading ? "Verifying..." : "Verify Payment"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                If you haven't received your verification code, please contact the Computer Science Department office.
                Your data is secure and encrypted.
              </p>
              <div className="text-center">
                <a href="/check-status" className="text-sm text-primary hover:underline font-medium">
                  Already verified? Check your status →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Offline indicator */}
      <OfflineIndicator />
    </main>
  )
}
