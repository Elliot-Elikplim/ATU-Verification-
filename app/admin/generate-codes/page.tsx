"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Printer, Download, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface GeneratedCode {
  code: string
  index_number: string
}

export default function GenerateCodesPage() {
  const [count, setCount] = useState("1000")
  const [indexPrefix, setIndexPrefix] = useState("BULK")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    const numCount = parseInt(count)

    if (isNaN(numCount) || numCount < 1 || numCount > 10000) {
      setMessage({ type: "error", text: "Please enter a number between 1 and 10000" })
      return
    }

    setIsGenerating(true)
    setMessage(null)
    setGeneratedCodes([])

    try {
      const response = await fetch("/api/admin/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: numCount, indexPrefix }),
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedCodes(data.codes)
        setMessage({ type: "success", text: data.message })
      } else {
        setMessage({ type: "error", text: data.error || "Failed to generate codes" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while generating codes" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups to print")
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reference Codes - ${new Date().toLocaleDateString()}</title>
          <style>
            @media print {
              @page { margin: 1cm; }
              body { margin: 0; }
            }
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              background: white;
            }
            h1 {
              text-align: center;
              color: #1e293b;
              margin-bottom: 10px;
            }
            .subtitle {
              text-align: center;
              color: #64748b;
              margin-bottom: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f1f5f9;
              font-weight: bold;
              color: #1e293b;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .code {
              font-weight: bold;
              color: #3b82f6;
              font-size: 14px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #94a3b8;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>CPS Reference Codes</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
          <div class="subtitle">Total Codes: ${generatedCodes.length}</div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Reference Code</th>
                <th>Index Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${generatedCodes
                .map(
                  (item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td class="code">${item.code}</td>
                  <td>${item.index_number}</td>
                  <td>UNUSED</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Computer Science Department - Reference Code Generation System</p>
            <p>This document contains sensitive verification codes. Handle with care.</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const handleDownloadPDF = () => {
    // Trigger the print dialog which can save as PDF
    handlePrint()
  }

  const downloadCSV = () => {
    const csvContent = [
      ["Number", "Reference Code", "Index Number", "Status"],
      ...generatedCodes.map((item, idx) => [idx + 1, item.code, item.index_number, "UNUSED"]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `reference-codes-${Date.now()}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Generate Reference Codes</h1>
        <p className="text-slate-300">Bulk generate reference codes for verification</p>
      </div>

      {/* Generation Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Bulk Generation</CardTitle>
          <CardDescription className="text-slate-400">
            Generate multiple reference codes at once (max 10,000)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count" className="text-slate-300">
                  Number of Codes
                </Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="10000"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prefix" className="text-slate-300">
                  Index Number Prefix
                </Label>
                <Input
                  id="prefix"
                  type="text"
                  value={indexPrefix}
                  onChange={(e) => setIndexPrefix(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="BULK"
                />
              </div>
            </div>

            {message && (
              <Alert
                className={
                  message.type === "success"
                    ? "border-green-700 bg-green-900/30"
                    : "border-red-700 bg-red-900/30"
                }
              >
                <AlertDescription className={message.type === "success" ? "text-green-300" : "text-red-300"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full md:w-auto gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Codes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generated Codes Display */}
      {generatedCodes.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Generated Codes</CardTitle>
                <CardDescription className="text-slate-400">
                  {generatedCodes.length} codes generated successfully
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadCSV} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
                <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button onClick={handlePrint} size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-700 border-b border-slate-600">
                  <tr>
                    <th className="text-left p-3 text-slate-300 font-medium">#</th>
                    <th className="text-left p-3 text-slate-300 font-medium">Reference Code</th>
                    <th className="text-left p-3 text-slate-300 font-medium">Index Number</th>
                    <th className="text-left p-3 text-slate-300 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedCodes.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="p-3 text-slate-400">{idx + 1}</td>
                      <td className="p-3">
                        <code className="text-blue-300 font-mono text-sm bg-slate-900 px-2 py-1 rounded">
                          {item.code}
                        </code>
                      </td>
                      <td className="p-3 text-slate-300">{item.index_number}</td>
                      <td className="p-3">
                        <Badge className="bg-green-600">UNUSED</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
