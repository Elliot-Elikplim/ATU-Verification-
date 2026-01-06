"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Users, ListChecks, Menu, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import Image from "next/image"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Generate Codes",
    href: "/admin/generate-codes",
    icon: FileText,
  },
  {
    name: "Reference Codes",
    href: "/admin/reference-codes",
    icon: ListChecks,
  },
  {
    name: "Verified Users",
    href: "/admin/verified-users",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-slate-800 border-r border-slate-700">
      <div className="p-6 flex items-center gap-3">
        <Image 
          src="/ATU-LOGO.png" 
          alt="ATU Logo" 
          width={40} 
          height={40}
          className="object-contain"
        />
        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <Link href="/">
          <Button variant="outline" className="w-full">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

function MobileSidebar() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="bg-slate-800 border-slate-700">
        <Menu className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="bg-slate-800 border-slate-700">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-slate-800 border-slate-700">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 h-full">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <MobileSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
