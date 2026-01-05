"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, AlertCircle, Mail, User, Calendar } from "lucide-react"
import { Label } from "@/components/ui/label"

interface VerifiedUser {
  id: number
  name: string
  email: string
  index_number: string
  verified_at: string
}

export default function VerifiedUsersPage() {
  const [verifiedUsers, setVerifiedUsers] = useState<VerifiedUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<VerifiedUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [emergencyVerifyForm, setEmergencyVerifyForm] = useState({
    name: "",
    email: "",
    indexNumber: "",
  })
  const [emergencyVerifying, setEmergencyVerifying] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(verifiedUsers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = verifiedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.index_number.toLowerCase().includes(query)
    )
    setFilteredUsers(filtered)
  }, [searchQuery, verifiedUsers])

  const loadData = async () => {
    try {
      const response = await fetch("/api/admin/verified-users")
      if (response.ok) {
        const users = await response.json()
        setVerifiedUsers(users)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const emergencyVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !emergencyVerifyForm.name.trim() ||
      !emergencyVerifyForm.email.trim() ||
      !emergencyVerifyForm.indexNumber.trim()
    ) {
      setMessage({ type: "error", text: "All fields are required for emergency verification" })
      return
    }

    setEmergencyVerifying(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/emergency-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emergencyVerifyForm),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: `User verified: ${data.message}` })
        setEmergencyVerifyForm({ name: "", email: "", indexNumber: "" })
        loadData()
      } else {
        setMessage({ type: "error", text: data.error || "Emergency verification failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" })
    } finally {
      setEmergencyVerifying(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Verified Users</h1>
        <p className="text-slate-300">View and manage verified users</p>
      </div>

      {/* Stats */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Total Verified Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-white">{verifiedUsers.length}</div>
          <p className="text-sm text-slate-400 mt-2">Users who have completed verification</p>
        </CardContent>
      </Card>

      {/* Emergency Verification */}
      <Card className="bg-amber-900/30 border-amber-700">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div>
              <CardTitle className="text-white">Emergency Manual Verification</CardTitle>
              <CardDescription className="text-slate-300">
                Use this only if a student completed verification but the system failed to record it
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={emergencyVerify} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={emergencyVerifyForm.name}
                  onChange={(e) => setEmergencyVerifyForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={emergencyVerifyForm.email}
                  onChange={(e) => setEmergencyVerifyForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indexNumber" className="text-slate-300">
                  Index Number
                </Label>
                <Input
                  id="indexNumber"
                  type="text"
                  placeholder="CS12345"
                  value={emergencyVerifyForm.indexNumber}
                  onChange={(e) => setEmergencyVerifyForm((prev) => ({ ...prev, indexNumber: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {message && (
              <Alert
                className={
                  message.type === "success" ? "border-green-700 bg-green-900/30" : "border-red-700 bg-red-900/30"
                }
              >
                <AlertDescription className={message.type === "success" ? "text-green-300" : "text-red-300"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={emergencyVerifying}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {emergencyVerifying ? "Verifying..." : "Verify Manually"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Verified Users</CardTitle>
          <CardDescription className="text-slate-400">
            Showing {filteredUsers.length} of {verifiedUsers.length} users
          </CardDescription>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search by name, email, or index number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  {searchQuery ? "No users match your search" : "No users verified yet"}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <p className="font-medium text-white">{user.name}</p>
                        <Badge className="bg-green-600 text-white text-xs">Verified</Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-xs">
                            {user.index_number}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          Verified on {new Date(user.verified_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
