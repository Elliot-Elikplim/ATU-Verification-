"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Search, Download } from "lucide-react"
import Link from "next/link"

interface VerificationStatus {
  verified: boolean
  name?: string
  email?: string
  index_number?: string
  verification_id?: string
  verified_at?: string
}

export default function CheckStatusPage() {
  const [searchType, setSearchType] = useState<"email" | "index" | "id">("email")
  const [searchValue, setSearchValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError("Please enter a value to search")
      return
    }

    setLoading(true)
    setError("")
    setStatus(null)

    try {
      const params = new URLSearchParams()
      if (searchType === "email") params.set("email", searchValue)
      if (searchType === "index") params.set("index_number", searchValue)
      if (searchType === "id") params.set("verification_id", searchValue)

      const response = await fetch(`/api/verification-status?${params}`)
      const data = await response.json()

      if (response.ok) {
        setStatus({ verified: true, ...data })
      } else {
        setStatus({ verified: false })
      }
    } catch (err) {
      setError("Failed to check verification status")
    } finally {
      setLoading(false)
    }
  }

  const downloadConfirmation = () => {
    if (!status || !status.verified) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Payment Verification Confirmation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #1e293b;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #1e293b;
            }
            .content {
              background: #f8fafc;
              padding: 30px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .field {
              margin: 15px 0;
              padding: 10px;
              background: white;
              border-left: 4px solid #3b82f6;
            }
            .label {
              font-weight: bold;
              color: #64748b;
              font-size: 12px;
              text-transform: uppercase;
            }
            .value {
              font-size: 16px;
              color: #1e293b;
              margin-top: 5px;
            }
            .verification-id {
              background: #1e293b;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px;
              margin: 30px 0;
            }
            .footer {
              text-align: center;
              color: #64748b;
              font-size: 12px;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
            }
            .checkmark {
              color: #10b981;
              font-size: 48px;
              text-align: center;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">CS - Computer Science Department</div>
            <h1>Fee Payment Verification Confirmation</h1>
          </div>

          <div class="checkmark">✓</div>
          <h2 style="text-align: center; color: #10b981;">Payment Verified</h2>

          <div class="content">
            <div class="field">
              <div class="label">Full Name</div>
              <div class="value">${status.name}</div>
            </div>

            <div class="field">
              <div class="label">Email Address</div>
              <div class="value">${status.email}</div>
            </div>

            <div class="field">
              <div class="label">Index Number</div>
              <div class="value">${status.index_number}</div>
            </div>

            <div class="field">
              <div class="label">Verification Date</div>
              <div class="value">${new Date(status.verified_at!).toLocaleString()}</div>
            </div>
          </div>

          <div class="verification-id">
            <div style="font-size: 12px; margin-bottom: 10px;">UNIQUE VERIFICATION ID</div>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">
              ${status.verification_id}
            </div>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <strong>Important:</strong> Keep this verification ID safe. Present this confirmation 
            during the next phase of registration.
          </div>

          <div class="footer">
            <p>Computer Science Department - 2026 Fee Verification System</p>
            <p>This is an official computer-generated document. No signature required.</p>
            <p>Retrieved on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `

    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Verification-${status.verification_id}.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Check Verification Status</h1>
          <p className="text-slate-400">
            Look up your fee payment verification details using your email, index number, or verification ID
          </p>
        </div>

        {/* Search Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Search Verification</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your information to check if your fee payment has been verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={searchType === "email" ? "default" : "outline"}
                onClick={() => {
                  setSearchType("email")
                  setSearchValue("")
                  setStatus(null)
                  setError("")
                }}
                className="w-full"
              >
                Email
              </Button>
              <Button
                variant={searchType === "index" ? "default" : "outline"}
                onClick={() => {
                  setSearchType("index")
                  setSearchValue("")
                  setStatus(null)
                  setError("")
                }}
                className="w-full"
              >
                Index Number
              </Button>
              <Button
                variant={searchType === "id" ? "default" : "outline"}
                onClick={() => {
                  setSearchType("id")
                  setSearchValue("")
                  setStatus(null)
                  setError("")
                }}
                className="w-full"
              >
                Verification ID
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search" className="text-white">
                {searchType === "email" && "Email Address"}
                {searchType === "index" && "Index Number"}
                {searchType === "id" && "Verification ID"}
              </Label>
              <Input
                id="search"
                type={searchType === "email" ? "email" : "text"}
                placeholder={
                  searchType === "email"
                    ? "student@example.com"
                    : searchType === "index"
                    ? "1234567"
                    : "VER-2026-XXXXX"
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <Button onClick={handleSearch} disabled={loading} className="w-full gap-2">
              <Search className="w-4 h-4" />
              {loading ? "Searching..." : "Check Status"}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {status !== null && (
          <>
            {status.verified ? (
              <Card className="bg-gradient-to-r from-green-900 to-green-800 border-green-700">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-12 h-12 text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">✓ Verified</h3>
                      <p className="text-green-200 mb-4">
                        This student has successfully verified their fee payment.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/50 rounded-lg p-4">
                        <div>
                          <p className="text-xs text-green-300 uppercase font-semibold">Name</p>
                          <p className="text-white font-medium">{status.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-green-300 uppercase font-semibold">Email</p>
                          <p className="text-white font-medium">{status.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-green-300 uppercase font-semibold">Index Number</p>
                          <p className="text-white font-medium">{status.index_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-green-300 uppercase font-semibold">Verified On</p>
                          <p className="text-white font-medium">
                            {new Date(status.verified_at!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded-lg p-4 mt-4 text-center">
                        <p className="text-xs text-green-300 uppercase font-semibold mb-2">
                          Verification ID
                        </p>
                        <p className="text-2xl font-bold text-blue-400 tracking-wider">
                          {status.verification_id}
                        </p>
                      </div>

                      <Button
                        onClick={downloadConfirmation}
                        className="w-full mt-4 gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4" />
                        Download Confirmation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-r from-red-900 to-red-800 border-red-700">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <XCircle className="w-12 h-12 text-red-400 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Not Verified</h3>
                      <p className="text-red-200 mb-2">
                        No verification record found for this {searchType}.
                      </p>
                      <p className="text-sm text-red-300">
                        If you believe this is an error, please contact the department office or verify
                        your fee payment using a reference code.
                      </p>
                      <Link href="/">
                        <Button className="mt-4 bg-white text-red-900 hover:bg-slate-100">
                          Verify Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Info Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">ℹ️ How to Use This Page</h3>
            <ul className="text-slate-300 space-y-2 text-sm">
              <li>
                <strong className="text-white">For Students:</strong> Check if your payment has been
                verified and download your confirmation.
              </li>
              <li>
                <strong className="text-white">For Admins:</strong> Quickly verify student payment status
                without accessing the admin system.
              </li>
              <li>
                <strong className="text-white">Search Options:</strong> Use email, index number, or
                verification ID - whichever you have available.
              </li>
              <li>
                <strong className="text-white">Download:</strong> Once verified, you can download an
                official HTML confirmation document.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
