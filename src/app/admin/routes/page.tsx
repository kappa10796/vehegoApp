"use client"
import { useState, useEffect } from 'react'
import { Plus, Edit2, MapPin, Navigation, Clock, ToggleLeft, ToggleRight, Loader2, Check } from 'lucide-react'

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form State
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [distance, setDistance] = useState('70')
  const [duration, setDuration] = useState('180')
  const [basePrice, setBasePrice] = useState('2500')

  useEffect(() => {
    fetch('/api/admin/routes')
      .then(res => res.json())
      .then(data => {
        setRoutes(data.routes || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, distance, duration, basePrice })
      })
      const data = await res.json()
      if (res.ok) {
        setRoutes(prev => [data.route, ...prev])
        setShowModal(false)
        setOrigin('')
        setDestination('')
      } else {
        alert(data.error || 'Failed to add route')
      }
    } catch {
      alert('Error creating route')
    } finally {
      setSaving(false)
    }
  }

  const toggleRouteActive = async (route: any) => {
    try {
      const res = await fetch('/api/admin/routes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: route.id, active: !route.active })
      })
      const data = await res.json()
      if (res.ok) {
        setRoutes(prev => prev.map(r => r.id === route.id ? data.route : r))
      }
    } catch {
      alert('Error updating status')
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Route Sector Management</h1>
          <p className="text-slate-500 font-semibold text-sm mt-1">Configure distances, durations, and base fares for mountain taxi routes.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2 text-sm shadow-md shadow-[#E34234]/20"
        >
          <Plus className="w-4 h-4" /> Add Route Sector
        </button>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400">
                <th className="py-3 px-4">Origin Point</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Distance (km)</th>
                <th className="py-3 px-4">Est. Duration</th>
                <th className="py-3 px-4">Base Sector Fare</th>
                <th className="py-3 px-4">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {routes.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-black text-slate-900">{r.origin}</td>
                  <td className="py-3.5 px-4 font-black text-[#E34234]">{r.destination}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">{r.distance} km</td>
                  <td className="py-3.5 px-4 text-slate-500 font-semibold">{Math.floor(r.duration / 60)}h {r.duration % 60}m</td>
                  <td className="py-3.5 px-4 font-black text-slate-900">₹{r.basePrice.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${r.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {r.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleRouteActive(r)}
                      title="Toggle active"
                      className="p-1.5 text-slate-500 hover:text-[#E34234] rounded-lg"
                    >
                      {r.active ? <ToggleRight className="w-6 h-6 text-emerald-600" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Route Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-xl border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-4">Add New Route Sector</h3>
            <form onSubmit={handleAddRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Origin City / Station</label>
                <input type="text" required placeholder="e.g. Siliguri / NJP" value={origin} onChange={e => setOrigin(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl py-2 px-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#E34234] outline-none" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Destination Hill Town</label>
                <input type="text" required placeholder="e.g. Gangtok" value={destination} onChange={e => setDestination(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl py-2 px-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#E34234] outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1">Distance (km)</label>
                  <input type="number" required value={distance} onChange={e => setDistance(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl py-2 px-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#E34234] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1">Duration (minutes)</label>
                  <input type="number" required value={duration} onChange={e => setDuration(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl py-2 px-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#E34234] outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Base Price (₹)</label>
                <input type="number" required value={basePrice} onChange={e => setBasePrice(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl py-2 px-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#E34234] outline-none" />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-600 font-bold px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-5 py-2 rounded-xl text-sm transition-colors shadow-md shadow-[#E34234]/20">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Sector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
