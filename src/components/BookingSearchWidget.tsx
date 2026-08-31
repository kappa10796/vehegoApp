"use client"
import { useState } from 'react'
import { MapPin, Calendar, Users, Search, Sparkles, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

const SOURCE_OPTIONS = [
  'Siliguri',
  'Bagdogra Airport (IXB)',
  'NJP Railway Station (New Jalpaiguri)',
  'Darjeeling',
  'Gangtok',
  'Kalimpong',
  'Kurseong',
  'Mirik',
  'Pakyong Airport (PYG)',
  'Cooch Behar',
  'Hasimara / Jaigaon (Bhutan Border)'
]

const DESTINATION_OPTIONS = [
  'Darjeeling',
  'Gangtok',
  'Kalimpong',
  'Pelling',
  'Ravangla',
  'Namchi (Char Dham)',
  'Lachung (Yumthang Valley)',
  'Lachen (Gurudongmar Lake)',
  'Mirik',
  'Kurseong',
  'Siliguri',
  'Bagdogra Airport (IXB)',
  'NJP Railway Station',
  'Lava / Lolegaon / Rishop',
  'Lataguri (Gorumara / Dooars)',
  'Jhalong / Bindu'
]

export function BookingSearchWidget() {
  const [tab, setTab] = useState<'outstation' | 'local' | 'airport' | 'sightseeing'>('outstation')
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way')
  const [origin, setOrigin] = useState('Siliguri')
  const [destination, setDestination] = useState('Darjeeling')
  const [date, setDate] = useState('')
  const [pickupTime, setPickupTime] = useState('09:00')
  const [passengers, setPassengers] = useState(2)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams({
      origin,
      destination,
      date,
      time: pickupTime,
      passengers: passengers.toString(),
      type: tripType
    })
    router.push(`/cabs/search?${query.toString()}`)
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 max-w-6xl mx-auto -mt-16 relative z-10 border-2 border-red-100">
      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-6 border-b border-slate-200 mb-6 pb-2">
        {(['outstation', 'local', 'airport', 'sightseeing'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap pb-2 text-sm md:text-base font-extrabold capitalize transition-colors border-b-3 ${
              tab === t ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {tab === 'outstation' && (
        <div className="flex gap-6 mb-6">
          <label className="flex items-center gap-2 text-sm font-extrabold text-slate-900 cursor-pointer">
            <input type="radio" checked={tripType === 'one-way'} onChange={() => setTripType('one-way')} className="text-red-600 focus:ring-red-600 w-4 h-4 accent-red-600" />
            One Way
          </label>
          <label className="flex items-center gap-2 text-sm font-extrabold text-slate-900 cursor-pointer">
            <input type="radio" checked={tripType === 'round-trip'} onChange={() => setTripType('round-trip')} className="text-red-600 focus:ring-red-600 w-4 h-4 accent-red-600" />
            Round Trip
          </label>
        </div>
      )}

      {/* Datalist Auto-Complete Options */}
      <datalist id="source-list">
        {SOURCE_OPTIONS.map((loc, idx) => (
          <option key={idx} value={loc} />
        ))}
      </datalist>

      <datalist id="destination-list">
        {DESTINATION_OPTIONS.map((loc, idx) => (
          <option key={idx} value={loc} />
        ))}
      </datalist>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Source Dropdown / Auto-complete */}
        <div className="relative col-span-1 lg:col-span-1 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-red-600 transition-all">
          <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">From Pickup</label>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
            <input
              list="source-list"
              type="text"
              placeholder="Source..."
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              required
              className="w-full bg-transparent border-none p-0 text-slate-900 font-extrabold text-sm placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Destination Dropdown / Auto-complete */}
        <div className="relative col-span-1 lg:col-span-1 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-red-600 transition-all">
          <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">To Destination</label>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
            <input
              list="destination-list"
              type="text"
              placeholder="Destination..."
              value={destination}
              onChange={e => setDestination(e.target.value)}
              required
              className="w-full bg-transparent border-none p-0 text-slate-900 font-extrabold text-sm placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Date */}
        <div className="relative col-span-1 lg:col-span-1 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-red-600 transition-all">
          <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">Travel Date</label>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-red-600 flex-shrink-0" />
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)} required
              className="w-full bg-transparent border-none p-0 text-slate-900 font-extrabold text-sm outline-none"
            />
          </div>
        </div>

        {/* Pickup Time Option */}
        <div className="relative col-span-1 lg:col-span-1 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-red-600 transition-all">
          <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">Pickup Time</label>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4 text-red-600 flex-shrink-0" />
            <input
              type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} required
              className="w-full bg-transparent border-none p-0 text-slate-900 font-extrabold text-sm outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Passengers */}
        <div className="relative col-span-1 lg:col-span-1 border-2 border-slate-200 rounded-2xl px-3.5 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-red-600 transition-all">
          <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">Passengers</label>
          <div className="flex items-center gap-2 mt-1">
            <Users className="w-4 h-4 text-red-600 flex-shrink-0" />
            <input
              type="number" min="1" max="20" value={passengers} onChange={e => setPassengers(Number(e.target.value))} required
              className="w-full bg-transparent border-none p-0 text-slate-900 font-extrabold text-sm outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-end">
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-base rounded-2xl py-3 px-4 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/30 hover:shadow-lg hover:shadow-red-600/40 cursor-pointer">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </form>

      {/* Quick Select Option Chips */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-black uppercase text-slate-600 flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-red-600" /> Popular Routes:
        </span>
        {[
          { from: 'Siliguri', to: 'Darjeeling' },
          { from: 'Bagdogra Airport (IXB)', to: 'Gangtok' },
          { from: 'NJP Railway Station', to: 'Kalimpong' },
          { from: 'Siliguri', to: 'Pelling' },
          { from: 'Darjeeling', to: 'Mirik' },
        ].map((chip, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setOrigin(chip.from)
              setDestination(chip.to)
            }}
            className="text-xs font-bold bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            {chip.from} → {chip.to}
          </button>
        ))}
      </div>
    </div>
  )
}
