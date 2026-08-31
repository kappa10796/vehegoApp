"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Route as RouteIcon, DollarSign, Calendar, Car, LogOut, Menu, X
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Driver Verification', href: '/admin/drivers', icon: Users },
  { name: 'Route Management', href: '/admin/routes', icon: RouteIcon },
  { name: 'Pricing Engine', href: '/admin/pricing', icon: DollarSign },
  { name: 'All Bookings', href: '/admin/bookings', icon: Calendar },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user || data.user.role !== 'ADMIN') {
          router.push('/login?redirect=/admin')
        } else {
          setUser(data.user)
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 flex-shrink-0 border-r border-slate-800">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-[#E34234] flex items-center justify-center text-white font-bold shadow-md">
            <Car className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">
            VEHE<span className="text-[#E34234]">GO</span> <span className="text-xs uppercase font-mono text-slate-400 font-semibold ml-0.5">Admin</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  active
                    ? 'bg-[#E34234] text-white shadow-md shadow-[#E34234]/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-[#E34234] font-mono font-semibold">System Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#E34234] flex items-center justify-center text-white">
              <Car className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg">VEHE<span className="text-[#E34234]">GO</span> Admin</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-slate-300 p-4 border-b border-slate-800 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
