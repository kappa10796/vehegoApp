"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Navigation, Clock, ArrowRight, Car, Compass, Loader2 } from 'lucide-react'

export default function PopularRoutesPage() {
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/routes')
      .then(res => res.json())
      .then(data => {
        setRoutes(data.routes || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-black uppercase tracking-wider mb-3 border border-red-200">
            <Compass className="w-3.5 h-3.5 text-[#E34234]" /> Popular Mountain Sectors
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Popular VEHE<span className="text-[#E34234]">GO</span> Taxi Routes
          </h1>
          <p className="text-slate-600 font-medium mt-3 text-base md:text-lg">
            Direct, comfortable transfers connecting NJP Railway Station, Bagdogra Airport (IXB), Gangtok, Darjeeling, Kalimpong, Pelling, and Lachung.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#E34234]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => {
              const hours = Math.floor(route.duration / 60)
              const mins = route.duration % 60
              return (
                <div key={route.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-red-200 transition-all p-6 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                        <MapPin className="w-5 h-5 text-[#E34234] flex-shrink-0" />
                        <span>{route.origin}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#E34234] transition-colors flex-shrink-0" />
                      <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                        <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>{route.destination}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-700 bg-red-50/50 p-3 rounded-2xl mb-4 border border-red-100">
                      <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5 text-[#E34234]" /> {route.distance} km</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" /> ~{hours}h {mins > 0 ? `${mins}m` : ''}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-bold uppercase">Starts at</span>
                      <span className="text-2xl font-black text-[#E34234]">₹{route.basePrice.toLocaleString('en-IN')}</span>
                    </div>

                    <Link
                      href={`/cabs/search?origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}`}
                      className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-4.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 text-sm shadow-md shadow-[#E34234]/20"
                    >
                      <Car className="w-4 h-4" /> Book Cab
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
