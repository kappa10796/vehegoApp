"use client"
import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Search, Loader2, AlertCircle, MessageSquare } from 'lucide-react'

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Track active inline rejection state per driver ID
  const [rejectingDriverId, setRejectingDriverId] = useState<string | null>(null)
  const [rejectionComments, setRejectionComments] = useState<Record<string, string>>({})
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/drivers')
      .then(res => res.json())
      .then(data => {
        setDrivers(data.drivers || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleApprove = async (driverId: string) => {
    setUpdatingId(driverId)
    setRejectingDriverId(null)
    setValidationError(null)

    try {
      const res = await fetch('/api/admin/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, status: 'APPROVED' })
      })
      const data = await res.json()
      if (res.ok) {
        setDrivers(prev => prev.map(d => d.id === driverId ? data.driver : d))
      } else {
        alert(data.error || 'Failed to approve driver')
      }
    } catch {
      alert('Error approving driver')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleConfirmRejection = async (driverId: string) => {
    const comment = (rejectionComments[driverId] || '').trim()
    if (!comment) {
      setValidationError('Mandatory rejection comment required before submitting.')
      return
    }

    setValidationError(null)
    setUpdatingId(driverId)

    try {
      const res = await fetch('/api/admin/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, status: 'REJECTED', rejectionReason: comment })
      })
      const data = await res.json()
      if (res.ok) {
        setDrivers(prev => prev.map(d => d.id === driverId ? data.driver : d))
        setRejectingDriverId(null)
      } else {
        alert(data.error || 'Failed to reject driver')
      }
    } catch {
      alert('Error submitting rejection')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = drivers.filter(d => {
    if (filter !== 'ALL' && d.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        d.user?.name?.toLowerCase().includes(q) ||
        d.licenseNumber?.toLowerCase().includes(q) ||
        d.vehicles?.[0]?.registration?.toLowerCase().includes(q)
      )
    }
    return true
  })

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Driver Verification & Approval</h1>
        <p className="text-slate-500 text-sm mt-1">Review partner driver licenses, vehicle permits, and grant platform access.</p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === s
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search driver / vehicle reg..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#E34234] outline-none"
          />
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                <th className="py-3 px-4">Driver Name</th>
                <th className="py-3 px-4">Email ID</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">License No.</th>
                <th className="py-3 px-4">Registered Vehicle</th>
                <th className="py-3 px-4">Status & Rejection Reason</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((d) => {
                const vehicle = d.vehicles?.[0]
                const isInlineRejecting = rejectingDriverId === d.id

                return (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-slate-900">{d.name || d.user?.name || 'N/A'}</td>
                    <td className="py-4 px-4 font-bold text-slate-700 text-xs">{d.email || d.user?.email || 'N/A'}</td>
                    <td className="py-4 px-4 font-bold text-slate-900 text-xs">{d.phone || d.user?.phone || 'N/A'}</td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-800 font-extrabold">{d.licenseNumber}</td>
                    <td className="py-4 px-4 text-xs">
                      {vehicle ? (
                        <div>
                          <div className="font-bold text-slate-900">{vehicle.brand} {vehicle.model}</div>
                          <div className="font-mono text-slate-500 font-semibold">{vehicle.registration}</div>
                        </div>
                      ) : <span className="text-slate-400 italic">No vehicle</span>}
                    </td>

                    {/* Status & Rejection Comment */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full ${
                          d.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          d.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {d.status}
                        </span>

                        {d.rejectionReason && (
                          <div className="flex items-start gap-1.5 text-xs text-red-700 font-medium bg-red-50 p-2 rounded-lg border border-red-100 max-w-xs mt-1">
                            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" />
                            <span><strong className="font-bold">Comment:</strong> {d.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions Column with Inline Comment Input */}
                    <td className="py-4 px-4 text-right">
                      {updatingId === d.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#E34234] ml-auto" />
                      ) : isInlineRejecting ? (
                        /* INLINE REJECTION MANDATORY COMMENT BOX */
                        <div className="bg-red-50/90 border-2 border-red-300 p-3 rounded-2xl shadow-sm text-left max-w-md ml-auto space-y-2">
                          <label className="block text-xs font-extrabold text-red-800 uppercase tracking-wider">
                            Mandatory Rejection Comment *
                          </label>
                          <input
                            type="text"
                            autoFocus
                            placeholder="e.g. Invalid commercial license / RC mismatch"
                            value={rejectionComments[d.id] || ''}
                            onChange={e => {
                              setValidationError(null)
                              setRejectionComments({ ...rejectionComments, [d.id]: e.target.value })
                            }}
                            className="w-full bg-white border border-red-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-red-500 outline-none placeholder:text-slate-400"
                          />

                          {validationError && (
                            <p className="text-[11px] font-bold text-red-700 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {validationError}
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingDriverId(null)
                                setValidationError(null)
                              }}
                              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmRejection(d.id)}
                              disabled={!(rejectionComments[d.id] || '').trim()}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* DEFAULT ACTION BUTTONS */
                        <div className="flex items-center justify-end gap-2">
                          {d.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleApprove(d.id)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setRejectingDriverId(d.id)
                              setValidationError(null)
                            }}
                            className="px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all"
                          >
                            <XCircle className="w-4 h-4" /> {d.status === 'REJECTED' ? 'Edit Rejection' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
