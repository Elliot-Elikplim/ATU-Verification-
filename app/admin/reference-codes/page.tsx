"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, Trash2, Plus, Search, AlertCircle, Trash } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ReferenceCode {
  id: number
  code: string
  index_number: string
  status: "unused" | "used"
  created_at: string
  used_at: string | null
}

function FlushButton({ totalCodes, onFlush, isFlushing }: { totalCodes: number; onFlush: () => void; isFlushing: boolean }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="destructive" className="gap-2" disabled={true}>
        <Trash className="w-4 h-4" />
        Flush All Codes
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2" disabled={totalCodes === 0}>
          <Trash className="w-4 h-4" />
          Flush All Codes
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-800 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            This action cannot be undone. This will permanently delete all{" "}
            <strong>{totalCodes} reference codes</strong> from the database.
            <br />
            <br />
            This includes both used and unused codes. All verification history will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onFlush}
            disabled={isFlushing}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isFlushing ? "Deleting..." : "Yes, Delete All"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function ReferenceCodesPage() {
  const [referenceCodesData, setReferenceCodesData] = useState<ReferenceCode[]>([])
  const [filteredCodes, setFilteredCodes] = useState<ReferenceCode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [indexNumber, setIndexNumber] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "unused" | "used">("all")
  const [isFlushing, setIsFlushing] = useState(false)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let filtered = referenceCodesData

    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) => c.code.toLowerCase().includes(query) || c.index_number.toLowerCase().includes(query)
      )
    }

    setFilteredCodes(filtered)
  }, [searchQuery, filterStatus, referenceCodesData])

  const loadData = async () => {
    try {
      const response = await fetch("/api/admin/reference-codes")
      if (response.ok) {
        const codes = await response.json()
        setReferenceCodesData(codes)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const generateReferenceCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!indexNumber.trim()) {
      setMessage({ type: "error", text: "Index number is required" })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indexNumber }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: `Code generated: ${data.code}` })
        setIndexNumber("")
        loadData()
      } else {
        setMessage({ type: "error", text: data.error || "Failed to generate code" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCode = async (id: number) => {
    if (!confirm("Are you sure you want to delete this code?")) return

    try {
      const response = await fetch(`/api/admin/reference-codes/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Code deleted successfully" })
        loadData()
      } else {
        setMessage({ type: "error", text: "Failed to delete code" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" })
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const flushAllCodes = async () => {
    setIsFlushing(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/flush-codes", {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "All codes deleted successfully" })
        loadData()
      } else {
        setMessage({ type: "error", text: data.error || "Failed to flush codes" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" })
    } finally {
      setIsFlushing(false)
    }
  }

  const totalCodes = referenceCodesData.length
  const usedCodes = referenceCodesData.filter((c) => c.status === "used").length
  const unusedCodes = referenceCodesData.filter((c) => c.status === "unused").length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reference Codes</h1>
          <p className="text-slate-300">Manage and view all reference codes</p>
        </div>
        <FlushButton totalCodes={totalCodes} onFlush={flushAllCodes} isFlushing={isFlushing} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Total Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalCodes}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Unused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{unusedCodes}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-400">{usedCodes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Single Code */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Generate Single Code</CardTitle>
          <CardDescription className="text-slate-400">
            Create a new CPS reference code for a specific user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateReferenceCode} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="indexNumber" className="text-slate-300 sr-only">
                  Index Number
                </Label>
                <Input
                  id="indexNumber"
                  type="text"
                  placeholder="Enter index number"
                  value={indexNumber}
                  onChange={(e) => setIndexNumber(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Generate
              </Button>
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
          </form>
        </CardContent>
      </Card>

      {/* Codes List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Reference Codes</CardTitle>
          <CardDescription className="text-slate-400">
            Showing {filteredCodes.length} of {totalCodes} codes
          </CardDescription>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Search by code or index number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
                className={filterStatus === "all" ? "bg-blue-600" : ""}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "unused" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("unused")}
                className={filterStatus === "unused" ? "bg-green-600" : ""}
              >
                Unused
              </Button>
              <Button
                variant={filterStatus === "used" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("used")}
                className={filterStatus === "used" ? "bg-slate-600" : ""}
              >
                Used
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredCodes.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  {searchQuery || filterStatus !== "all" ? "No codes match your filters" : "No codes generated yet"}
                </p>
              </div>
            ) : (
              filteredCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono text-blue-300 bg-slate-900 px-2 py-1 rounded">
                        {code.code}
                      </code>
                      <Badge
                        variant={code.status === "unused" ? "default" : "secondary"}
                        className={code.status === "unused" ? "bg-green-600 text-white" : "bg-slate-600 text-slate-200"}
                      >
                        {code.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">Index: {code.index_number}</p>
                    <p className="text-xs text-slate-500">
                      Created: {new Date(code.created_at).toLocaleDateString()}
                      {code.used_at && ` | Used: ${new Date(code.used_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(code.code)}
                      className="p-1.5 hover:bg-slate-600 rounded transition text-slate-300"
                      title="Copy code"
                    >
                      {copiedCode === code.code ? (
                        <span className="text-xs text-green-400">Copied!</span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteCode(code.id)}
                      className="p-1.5 hover:bg-red-900 rounded transition text-red-400"
                      title="Delete code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
