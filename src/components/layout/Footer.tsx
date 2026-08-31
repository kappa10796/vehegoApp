import { Car } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t border-slate-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#E34234] flex items-center justify-center text-white shadow-sm">
              <Car className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              VEHE<span className="text-[#E34234]">GO</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Premium outstation cabs and sightseeing tours for Darjeeling, Gangtok, Sikkim & North Bengal. Travel the hills with total comfort.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><a href="/cabs/search" className="hover:text-[#E34234] transition-colors">Book a Cab</a></li>
            <li><a href="/sightseeing" className="hover:text-[#E34234] transition-colors">Sightseeing Packages</a></li>
            <li><a href="/routes" className="hover:text-[#E34234] transition-colors">Popular Sectors</a></li>
            <li><a href="/driver/register" className="hover:text-[#E34234] transition-colors">Attach Commercial Taxi</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Legal & Policy</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><a href="#" className="hover:text-[#E34234] transition-colors">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-[#E34234] transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-[#E34234] transition-colors">Cancellation & Refund Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Popular Routes</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><a href="/cabs/search?origin=Siliguri&destination=Darjeeling" className="hover:text-[#E34234] transition-colors">Siliguri to Darjeeling Cab</a></li>
            <li><a href="/cabs/search?origin=NJP&destination=Gangtok" className="hover:text-[#E34234] transition-colors">NJP to Gangtok Cab</a></li>
            <li><a href="/cabs/search?origin=Bagdogra&destination=Kalimpong" className="hover:text-[#E34234] transition-colors">Bagdogra to Kalimpong Cab</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-xs text-center text-slate-500">
        &copy; {new Date().getFullYear()} VEHEGO Mobility Pvt. Ltd. All rights reserved.
      </div>
    </footer>
  )
}
