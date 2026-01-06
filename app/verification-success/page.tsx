"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Home } from "lucide-react"
import Link from "next/link"

interface VerificationData {
  name: string
  email: string
  index_number: string
  verification_id: string
  verified_at: string
}

function VerificationSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [userData, setUserData] = useState<VerificationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email = searchParams.get("email")
    if (!email) {
      router.push("/")
      return
    }

    fetchVerificationData(email)
  }, [searchParams, router])

  const fetchVerificationData = async (email: string) => {
    try {
      const response = await fetch(`/api/verification-status?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error("Error fetching verification data:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadConfirmation = () => {
    if (!userData) return

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
          <h2 style="text-align: center; color: #10b981;">Payment Verified Successfully</h2>

          <div class="content">
            <div class="field">
              <div class="label">Full Name</div>
              <div class="value">${userData.name}</div>
            </div>

            <div class="field">
              <div class="label">Email Address</div>
              <div class="value">${userData.email}</div>
            </div>

            <div class="field">
              <div class="label">Index Number</div>
              <div class="value">${userData.index_number}</div>
            </div>

            <div class="field">
              <div class="label">Verification Date</div>
              <div class="value">${new Date(userData.verified_at).toLocaleString()}</div>
            </div>
          </div>

          <div class="verification-id">
            <div style="font-size: 12px; margin-bottom: 10px;">UNIQUE VERIFICATION ID</div>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">
              ${userData.verification_id}
            </div>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <strong>Important:</strong> Keep this verification ID safe. You may be required to present this 
            confirmation and ID during the next phase of the registration process.
          </div>

          <div class="footer">
            <p>Computer Science Department - 2026 Fee Verification System</p>
            <p>This is an official computer-generated document. No signature required.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `

    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Verification-${userData.verification_id}.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-300 text-center">Verification data not found.</p>
            <Link href="/">
              <Button className="w-full mt-4">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="bg-gradient-to-r from-green-900 to-green-800 border-green-700">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Payment Verified Successfully!</h1>
            <p className="text-green-200">
              Your fee payment has been confirmed. You may now proceed to the next phase of registration.
            </p>
          </CardContent>
        </Card>

        {/* Verification Details */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Verification Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Full Name</p>
                <p className="text-white font-medium">{userData.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Email Address</p>
                <p className="text-white font-medium">{userData.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Index Number</p>
                <p className="text-white font-medium">{userData.index_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Verification Date</p>
                <p className="text-white font-medium">{new Date(userData.verified_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-2">
                Unique Verification ID
              </p>
              <p className="text-2xl font-bold text-blue-400 tracking-wider">{userData.verification_id}</p>
              <p className="text-xs text-slate-500 mt-2">Keep this ID for your records</p>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="bg-amber-900/30 border-amber-700">
          <CardContent className="pt-6">
            <h3 className="text-amber-400 font-semibold mb-2">📋 Next Steps</h3>
            <ul className="text-amber-200 space-y-2 text-sm">
              <li>• Download your verification confirmation for your records</li>
              <li>• Keep your Verification ID safe - you'll need it for the next phase</li>
              <li>• Proceed to the department office to complete your registration</li>
              <li>• You can check your verification status anytime using the "Check Status" page</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={downloadConfirmation} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Download Confirmation
          </Button>
          <Link href="/check-status" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              Check Status Again
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerificationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <VerificationSuccessContent />
    </Suspense>
  )
}
