"use client"
import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Users, Snowflake, ShieldCheck, MapPin, Star, AlertCircle, ArrowLeft } from 'lucide-react'

function CabDetailsContent() {
  const router = useRouter()
  const { id } = useParams()
  const searchParams = useSearchParams()
  const routeId = searchParams.get('routeId')
  const date = searchParams.get('date')
  const passengers = searchParams.get('passengers')

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/cabs/${id}?routeId=${routeId || ''}`)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, routeId])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Loading cab details...</div>
  if (!data || !data.vehicle) return <div className="min-h-screen flex items-center justify-center font-bold">Vehicle not found</div>

  const { vehicle, route, fare } = data

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back()
              } else {
                router.push(`/cabs/search?origin=${route?.origin || ''}&destination=${route?.destination || ''}`)
              }
            }}
            className="inline-flex items-center gap-1.5 text-[#E34234] hover:underline text-sm font-extrabold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Search Results
          </button>
          <h1 className="text-3xl font-black text-slate-900 mt-4">{vehicle.brand} {vehicle.model}</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Or similar {vehicle.category} vehicle</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Gallery */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
              <div className="h-[400px] w-full bg-cover bg-center" style={{ backgroundImage: `url("${vehicle.imageUrl || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200'}")` }}></div>
            </div>

            {/* Vehicle Specs */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-4">Vehicle Specifications</h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-red-50 text-red-800 border border-red-100 px-4 py-2 rounded-xl font-bold text-sm">
                  <Users className="w-5 h-5 text-[#E34234]" />
                  <span>{vehicle.seatingCapacity}+1 Seats</span>
                </div>
                {vehicle.acStatus && (
                  <div className="flex items-center gap-2 bg-slate-100 text-slate-800 px-4 py-2 rounded-xl font-bold text-sm">
                    <Snowflake className="w-5 h-5 text-sky-600" />
                    <span>Air Conditioned</span>
                  </div>
                )}
              </div>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="font-extrabold text-slate-900 mb-3 text-sm uppercase tracking-wider">Included in this trip:</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-semibold text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> State Taxes & Tolls</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Driver Hill Allowance</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Fuel & Permit Charges</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> 24/7 Helpline Support</li>
                </ul>
              </div>
            </div>

            {/* Driver Profile */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-4">Driver Profile</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#E34234] rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-md shadow-[#E34234]/20">
                  {vehicle.driver.user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">{vehicle.driver.user.name}</h3>
                    <ShieldCheck className="w-5 h-5 text-[#E34234]" />
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 mt-1 mb-2">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current text-slate-300" />
                    <span className="text-slate-700 text-xs font-bold ml-1">4.8 (120 trips)</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Experience: {vehicle.driver.experience} years commercial driving in Darjeeling & Sikkim hills.</p>
                </div>
              </div>
            </div>
            
            {/* Cancellation Policy */}
            <div className="bg-red-50 border border-red-200 p-6 rounded-3xl">
              <h2 className="text-lg font-black text-red-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#E34234]" />
                Cancellation Policy
              </h2>
              <p className="text-sm text-red-800 font-medium leading-relaxed">
                Free cancellation up to 2 hours before scheduled departure. For cancellations within 2 hours, a nominal 20% cancellation fee applies. No-shows will be charged 100% of the booking amount.
              </p>
            </div>

          </div>

          {/* Sidebar / Fare Breakdown */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-xl sticky top-24 border border-slate-200">
              
              {route && (
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <h3 className="font-black text-slate-900 mb-4 text-lg">Trip Details</h3>
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                    <div className="absolute left-1 top-1 w-2.5 h-2.5 rounded-full bg-[#E34234] border-[3px] border-white"></div>
                    <div className="mb-6">
                      <p className="text-xs text-slate-500 font-bold uppercase">Pickup</p>
                      <p className="font-extrabold text-slate-900">{route.origin}</p>
                    </div>
                    <div className="absolute left-1 bottom-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-[3px] border-white"></div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Drop</p>
                      <p className="font-extrabold text-slate-900">{route.destination}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Date</span>
                    <span className="font-extrabold text-slate-900">{date}</span>
                  </div>
                </div>
              )}

              {fare && (
                <div className="mb-6">
                  <h3 className="font-black text-slate-900 mb-4 text-lg">Fare Breakdown</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Base Fare</span>
                      <span>₹{fare.baseFare.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Driver Hill Allowance</span>
                      <span>₹{fare.driverAllowance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Tolls & Permits Est.</span>
                      <span>₹{fare.tollEstimate.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Platform Fee</span>
                      <span>₹{fare.platformFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t flex justify-between font-black text-xl text-slate-900">
                      <span>Total Fare</span>
                      <span className="text-[#E34234]">₹{fare.totalFare.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}

              <Link href={`/booking/${id}?routeId=${routeId}&date=${date}&passengers=${passengers}`} className="block w-full bg-[#E34234] hover:bg-[#c93225] text-white text-center font-extrabold text-lg py-4 rounded-2xl transition-all shadow-md shadow-[#E34234]/20">
                Proceed to Book
              </Link>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function CabDetails() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Loading cab details...</div>}>
      <CabDetailsContent />
    </Suspense>
  )
}
