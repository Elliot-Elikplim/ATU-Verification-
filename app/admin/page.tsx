"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, CheckCircle, Clock } from "lucide-react"

interface ReferenceCode {
  id: number
  code: string
  index_number: string
  status: "unused" | "used"
  created_at: string
  used_at: string | null
}

interface VerifiedUser {
  id: number
  name: string
  email: string
  index_number: string
  verified_at: string
}

export default function AdminDashboard() {
  const [referenceCodesData, setReferenceCodesData] = useState<ReferenceCode[]>([])
  const [verifiedUsers, setVerifiedUsers] = useState<VerifiedUser[]>([])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [codesRes, usersRes] = await Promise.all([
        fetch("/api/admin/reference-codes"),
        fetch("/api/admin/verified-users"),
      ])

      if (codesRes.ok) {
        const codes = await codesRes.json()
        setReferenceCodesData(codes)
      }

      if (usersRes.ok) {
        const users = await usersRes.json()
        setVerifiedUsers(users)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const totalCodes = referenceCodesData.length
  const usedCodes = referenceCodesData.filter((c) => c.status === "used").length
  const unusedCodes = referenceCodesData.filter((c) => c.status === "unused").length
  const totalUsers = verifiedUsers.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-300">Welcome to the admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Codes</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalCodes}</div>
            <p className="text-xs text-slate-400">All reference codes generated</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Used Codes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{usedCodes}</div>
            <p className="text-xs text-slate-400">Codes that have been redeemed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Unused Codes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{unusedCodes}</div>
            <p className="text-xs text-slate-400">Available for verification</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Verified Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalUsers}</div>
            <p className="text-xs text-slate-400">Successfully verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Codes</CardTitle>
            <CardDescription className="text-slate-400">Latest generated reference codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referenceCodesData.slice(0, 5).map((code) => (
                <div key={code.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono text-blue-300">{code.code}</code>
                    <p className="text-xs text-slate-400 mt-1">Index: {code.index_number}</p>
                  </div>
                  <Badge
                    variant={code.status === "unused" ? "default" : "secondary"}
                    className={code.status === "unused" ? "bg-green-600" : "bg-slate-600"}
                  >
                    {code.status}
                  </Badge>
                </div>
              ))}
              {referenceCodesData.length === 0 && (
                <p className="text-slate-400 text-sm">No codes generated yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Verifications</CardTitle>
            <CardDescription className="text-slate-400">Latest verified users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verifiedUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <Badge className="bg-green-600 text-xs">Verified</Badge>
                </div>
              ))}
              {verifiedUsers.length === 0 && <p className="text-slate-400 text-sm">No verified users yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
