"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mountain, Clock, MapPin, CheckCircle, ArrowRight, ShieldCheck, Sparkles, Loader2, Tag, Car } from 'lucide-react'

export default function SightseeingPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [driverPackages, setDriverPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch standard packages
    fetch('/api/sightseeing')
      .then(res => res.json())
      .then(data => {
        setPackages(data.packages || [])
      })
      .catch(() => {})

    // Fetch driver custom sightseeing listings
    fetch('/api/cabs/driver-listings?type=SIGHTSEEING')
      .then(res => res.json())
      .then(data => {
        setDriverPackages(data.listings || [])
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
            <Sparkles className="w-3.5 h-3.5 text-[#E34234]" /> Curated Hill Tours
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            VEHE<span className="text-[#E34234]">GO</span> Sightseeing Packages
          </h1>
          <p className="text-slate-600 font-medium mt-3 text-base md:text-lg">
            Explore 7-point, 10-point, and customized tours in Darjeeling, Gangtok, Kalimpong & Pelling with local expert mountain drivers.
          </p>
        </div>

        {/* DRIVER DIRECT SIGHTSEEING OFFERS */}
        {driverPackages.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="p-1.5 bg-red-100 text-[#E34234] rounded-xl"><Sparkles className="w-5 h-5" /></span>
              <h2 className="text-2xl font-black text-slate-900">Driver Direct Tour Offers</h2>
              <span className="text-xs font-black bg-red-50 text-[#E34234] px-3 py-1 rounded-full border border-red-200 uppercase tracking-wider">Driver Price Choice</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {driverPackages.map((dp) => (
                <div key={dp.id} className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border-t-4 border-[#E34234] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 bg-[#E34234]/20 border border-[#E34234]/40 text-[#E34234] text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Driver Custom Deal
                      </span>
                      <span className="text-xs text-slate-400 font-bold">{dp.driver?.user?.name || 'Local Guide Driver'}</span>
                    </div>

                    <h3 className="text-xl font-black text-white mb-2">{dp.title}</h3>

                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2 text-xs text-slate-300 mb-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#E34234]" /> Duration: <strong>{dp.duration}</strong>
                      </div>
                      {dp.itinerary && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-[#E34234] flex-shrink-0 mt-0.5" />
                          <span>Key Spots: <strong>{typeof dp.itinerary === 'string' ? JSON.parse(dp.itinerary).join(' • ') : dp.itinerary.join(' • ')}</strong></span>
                        </div>
                      )}
                      {dp.notes && <p className="text-slate-400 italic text-[11px] pt-1 border-t border-slate-700">&quot;{dp.notes}&quot;</p>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-black uppercase block">Offered Custom Price</span>
                      <span className="text-2xl font-black text-[#E34234]">₹{dp.customPrice.toLocaleString('en-IN')}</span>
                    </div>

                    <Link
                      href={`/booking/driver-listing-${dp.id}?vehicleId=${dp.vehicleId || ''}&totalFare=${dp.customPrice}&pickup=${encodeURIComponent(dp.origin || 'Darjeeling')}&drop=${encodeURIComponent(dp.destination || 'Sightseeing Tour')}`}
                      className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-5 py-2.5 rounded-xl transition-colors text-xs shadow-md shadow-[#E34234]/30 inline-flex items-center gap-1.5"
                    >
                      Book Tour Package <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standard Fleet Packages */}
        <h2 className="text-2xl font-black text-slate-900 mb-6">Standard Managed Sightseeing Packages</h2>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#E34234]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300 flex flex-col overflow-hidden group">
                <div className="p-6 bg-slate-900 text-white relative border-b-4 border-[#E34234]">
                  <div className="flex items-center justify-between text-xs text-red-300 font-bold mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#E34234]" /> {pkg.duration}</span>
                    <span className="bg-red-500/20 text-red-200 px-2.5 py-0.5 rounded-full border border-red-500/30">Guided Tour</span>
                  </div>
                  <h3 className="text-xl font-black group-hover:text-red-400 transition-colors">{pkg.title}</h3>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed font-medium">{pkg.description}</p>
                    
                    <div className="bg-red-50/60 p-4 rounded-2xl border border-red-100">
                      <p className="text-xs font-black uppercase tracking-wider text-red-800 mb-2">Key Attractions / Itinerary</p>
                      <div className="flex items-start gap-2 text-xs text-slate-800 font-bold">
                        <MapPin className="w-4 h-4 text-[#E34234] flex-shrink-0 mt-0.5" />
                        <span>{pkg.itinerary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-bold uppercase">Package Fare</span>
                      <span className="text-2xl font-black text-[#E34234]">₹{pkg.price.toLocaleString('en-IN')}</span>
                    </div>

                    <Link
                      href={`/cabs/search?origin=${encodeURIComponent(pkg.title.split(' ')[0])}&destination=Sightseeing`}
                      className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-4.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 text-sm shadow-md shadow-[#E34234]/20"
                    >
                      Book Tour <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
