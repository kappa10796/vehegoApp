"use client"
import { useState, useEffect } from 'react'
import { DollarSign, Save, Loader2, CheckCircle2 } from 'lucide-react'

export default function AdminPricingPage() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingCategory, setSavingCategory] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then(res => res.json())
      .then(data => {
        setRules(data.pricingRules || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleChange = (category: string, field: string, value: any) => {
    setRules(prev => prev.map(r => r.category === category ? { ...r, [field]: value } : r))
  }

  const handleSave = async (rule: any) => {
    setSavingCategory(rule.category)
    setSuccessMsg('')
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule)
      })
      const data = await res.json()
      if (res.ok) {
        setSuccessMsg(`Pricing for ${rule.category} updated successfully!`)
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        alert(data.error || 'Failed to update pricing')
      }
    } catch {
      alert('Error updating pricing')
    } finally {
      setSavingCategory(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Fare Matrix & Dynamic Engine</h1>
        <p className="text-slate-500 font-semibold text-sm mt-1">Adjust base fares, per-kilometer rates, driver mountain allowances & platform service fees.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((r) => (
          <div key={r.category} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-red-200 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">{r.category}</h3>
              <span className="text-xs font-mono bg-red-50 text-[#E34234] border border-red-100 px-3 py-1 rounded-full font-bold">Category Code</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-extrabold text-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Base Fare (₹)</label>
                <input
                  type="number" value={r.baseFare} onChange={e => handleChange(r.category, 'baseFare', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-[#E34234] outline-none font-black text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Per KM Rate (₹)</label>
                <input
                  type="number" value={r.perKmRate} onChange={e => handleChange(r.category, 'perKmRate', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-[#E34234] outline-none font-black text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Driver Hill Allowance (₹)</label>
                <input
                  type="number" value={r.driverAllowance} onChange={e => handleChange(r.category, 'driverAllowance', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-[#E34234] outline-none font-black text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Platform Commission (%)</label>
                <input
                  type="number" value={r.platformFeePct} onChange={e => handleChange(r.category, 'platformFeePct', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-[#E34234] outline-none font-black text-[#E34234] bg-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => handleSave(r)}
                disabled={savingCategory === r.category}
                className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-colors inline-flex items-center gap-1.5 shadow-md shadow-[#E34234]/20"
              >
                {savingCategory === r.category ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Pricing
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
