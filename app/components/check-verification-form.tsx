"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"

interface VerifiedUser {
  id: string
  name: string
  email: string
  index_number: string
  verified_at: string
}

export default function CheckVerificationForm() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchBy, setSearchBy] = useState<"email" | "index_number" | "name">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VerifiedUser | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setResult(null)

    if (!searchQuery.trim()) {
      setMessage({ type: "error", text: `Please enter a ${searchBy.replace("_", " ")}` })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/check-verification?query=${encodeURIComponent(searchQuery)}&searchBy=${searchBy}`,
      )
      const data = await response.json()

      if (response.ok && data.user) {
        setResult(data.user)
        setMessage({
          type: "success",
          text: `✓ ${data.user.name} is verified for 2026 fee payment`,
        })
      } else {
        setMessage({
          type: "error",
          text: data.error || "User not found or not verified",
        })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Search By</label>
        <div className="flex gap-3">
          {(["email", "index_number", "name"] as const).map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="searchBy"
                value={option}
                checked={searchBy === option}
                onChange={(e) => setSearchBy(e.target.value as typeof searchBy)}
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground capitalize">{option.replace("_", " ")}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          {searchBy === "email" && "Email Address"}
          {searchBy === "index_number" && "Student ID"}
          {searchBy === "name" && "Full Name"}
        </label>
        <Input
          type="text"
          placeholder={
            searchBy === "email" ? "john@university.edu" : searchBy === "index_number" ? "CS202X0001" : "John Doe"
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-input border-border focus:border-primary"
        />
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

      {result && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-semibold text-foreground">{result.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold text-foreground">{result.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="font-semibold text-foreground">{result.index_number}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Verified On</p>
              <p className="font-semibold text-foreground">
                {new Date(result.verified_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-colors"
      >
        {isLoading ? "Searching..." : "Check Verification"}
      </Button>
    </form>
  )
}
