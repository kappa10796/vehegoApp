"use client"
import Link from 'next/link'
import { Car, Menu, X, User, LogOut, LayoutDashboard, Compass, ShieldAlert, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<{name: string, role: string} | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
    router.refresh()
  }

  const getHomeLink = () => {
    if (user?.role === 'DRIVER') return '/driver/dashboard'
    if (user?.role === 'ADMIN') return '/admin'
    return '/'
  }

  const getDashboardLink = () => {
    if (!user) return '/dashboard'
    if (user.role === 'ADMIN') return '/admin'
    if (user.role === 'DRIVER') return '/driver/dashboard'
    return '/dashboard'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-xs">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href={getHomeLink()} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[#E34234] flex items-center justify-center text-white shadow-md shadow-[#E34234]/20 group-hover:scale-105 transition-transform">
              <Car className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              VEHE<span className="text-[#E34234]">GO</span>
            </span>
          </Link>
          {user?.role === 'DRIVER' && (
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-[#E34234] border border-red-200 hidden sm:inline-block">
              Driver Workspace
            </span>
          )}
        </div>

        {/* Desktop Nav - Custom per Role */}
        <nav className="hidden md:flex items-center gap-6">
          {user?.role === 'DRIVER' ? (
            /* DRIVER NAVIGATION OPTIONS */
            <>
              <Link href="/driver/listings" className={`text-sm font-extrabold transition-colors flex items-center gap-1.5 ${pathname === '/driver/listings' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>
                <Compass className="w-4 h-4 text-[#E34234]" /> Custom Rides & Sightseeing
              </Link>
              <Link href="/driver/dashboard" className={`text-sm font-extrabold transition-colors flex items-center gap-1.5 ${pathname === '/driver/dashboard' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>
                <LayoutDashboard className="w-4 h-4" /> Duty Schedule & Stats
              </Link>
            </>
          ) : user?.role === 'ADMIN' ? (
            /* ADMIN NAVIGATION OPTIONS */
            <>
              <Link href="/admin" className={`text-sm font-extrabold transition-colors ${pathname === '/admin' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>Overview</Link>
              <Link href="/admin/drivers" className={`text-sm font-extrabold transition-colors ${pathname === '/admin/drivers' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>Drivers</Link>
              <Link href="/admin/routes" className={`text-sm font-extrabold transition-colors ${pathname === '/admin/routes' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>Routes</Link>
              <Link href="/admin/pricing" className={`text-sm font-extrabold transition-colors ${pathname === '/admin/pricing' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>Pricing</Link>
              <Link href="/admin/bookings" className={`text-sm font-extrabold transition-colors ${pathname === '/admin/bookings' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>Bookings</Link>
            </>
          ) : (
            /* PASSENGER / PUBLIC NAVIGATION OPTIONS */
            <>
              <Link href="/cabs/search" className={`text-sm font-extrabold transition-colors ${pathname === '/cabs/search' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>Cabs</Link>
              <Link href="/custom-tours" className={`text-sm font-extrabold transition-colors flex items-center gap-1.5 ${pathname === '/custom-tours' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>
                <Compass className="w-4 h-4 text-[#E34234]" /> Custom Tours & Bids
              </Link>
              <Link href="/custom-tour/new" className={`text-sm font-extrabold transition-colors flex items-center gap-1.5 ${pathname === '/custom-tour/new' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>
                <Sparkles className="w-4 h-4 text-amber-500" /> Post Tour Request
              </Link>
              <Link href="/sightseeing" className={`text-sm font-extrabold transition-colors ${pathname === '/sightseeing' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>Sightseeing</Link>
              <Link href="/dashboard" className={`text-sm font-extrabold transition-colors ${pathname === '/dashboard' ? 'text-[#E34234]' : 'text-slate-700 hover:text-[#E34234]'}`}>My Bookings</Link>
            </>
          )}

          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-2 text-sm font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all"
                >
                  <User className="w-4 h-4 text-[#E34234]" />
                  <span>{user.name}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#E34234] uppercase border border-slate-200">
                    {user.role}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-[#E34234] px-3 py-2">
                  Login
                </Link>
                <Link href="/register" className="text-sm font-bold bg-[#E34234] text-white px-5 py-2 rounded-xl hover:bg-[#c93225] transition-all shadow-sm shadow-[#E34234]/30">
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-slate-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white shadow-lg">
          <div className="flex flex-col p-4 space-y-3">
            {user?.role === 'DRIVER' ? (
              <>
                <Link href="/driver/custom-tours" onClick={() => setIsMenuOpen(false)} className="text-sm font-extrabold text-[#E34234] py-1 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Custom Tour Bids</Link>
                <Link href="/driver/listings" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-700 py-1">Standard Listings & Sightseeing</Link>
                <Link href="/driver/dashboard" onClick={() => setIsMenuOpen(false)} className="text-sm font-extrabold text-slate-900 py-1">Duty Schedule & Stats</Link>
              </>
            ) : user?.role === 'ADMIN' ? (
              <>
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="text-sm font-extrabold text-slate-900 py-1">Admin Overview</Link>
                <Link href="/admin/drivers" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-700 py-1">Drivers</Link>
                <Link href="/admin/routes" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-700 py-1">Routes</Link>
                <Link href="/admin/pricing" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-700 py-1">Pricing</Link>
                <Link href="/admin/bookings" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-700 py-1">Bookings</Link>
              </>
            ) : (
              <>
                <Link href="/cabs/search" onClick={() => setIsMenuOpen(false)} className="text-sm font-extrabold text-slate-800 py-1">Cabs</Link>
                <Link href="/custom-tour/new" onClick={() => setIsMenuOpen(false)} className="text-sm font-extrabold text-[#E34234] py-1 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Custom Tour Request</Link>
                <Link href="/sightseeing" onClick={() => setIsMenuOpen(false)} className="text-sm font-extrabold text-slate-800 py-1">Sightseeing</Link>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-sm font-extrabold text-slate-800 py-1">My Bookings</Link>
              </>
            )}

            <hr className="border-slate-100" />
            {user ? (
              <div className="space-y-3 pt-1">
                <Link
                  href={getDashboardLink()}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-bold text-slate-900 bg-slate-100 p-3 rounded-xl"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#E34234]" />
                  <span>{user.name} ({user.role})</span>
                </Link>
                <button
                  onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-center text-sm font-bold border border-slate-200 text-slate-700 py-2.5 rounded-xl">
                  Login
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="text-center text-sm font-bold bg-[#E34234] text-white py-2.5 rounded-xl shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
