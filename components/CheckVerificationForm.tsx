"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VerificationResult {
  verified: boolean
  fullName?: string
  email?: string
  indexNumber?: string
  verifiedAt?: string
}

export default function CheckVerificationForm() {
  const [email, setEmail] = useState("")
  const [indexNumber, setIndexNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    setError(null)

    if (!email.trim()) {
      setError("Email address is required")
      return
    }
    if (!indexNumber.trim()) {
      setError("Student ID is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/check-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, indexNumber }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Failed to check verification status")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Email Address</label>
        <Input
          type="email"
          placeholder="john@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-input border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Student ID</label>
        <Input
          type="text"
          placeholder="CS202X0001"
          value={indexNumber}
          onChange={(e) => setIndexNumber(e.target.value)}
          required
          className="bg-input border-border focus:border-primary"
        />
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert
          className={
            result.verified
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-orange-200 bg-orange-50 text-orange-900"
          }
        >
          <AlertDescription className={result.verified ? "text-green-800 font-medium" : "text-orange-800 font-medium"}>
            {result.verified ? "✓ Verification Status: VERIFIED" : "✗ Verification Status: NOT VERIFIED"}
          </AlertDescription>
          {result.verified && (
            <div className="mt-3 space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {result.fullName}
              </p>
              <p>
                <strong>Email:</strong> {result.email}
              </p>
              <p>
                <strong>Student ID:</strong> {result.indexNumber}
              </p>
              <p>
                <strong>Verified On:</strong>{" "}
                {result.verifiedAt ? new Date(result.verifiedAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          )}
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-colors"
      >
        {isLoading ? "Checking..." : "Check Verification Status"}
      </Button>
    </form>
  )
}
