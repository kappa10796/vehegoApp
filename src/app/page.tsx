import { BookingSearchWidget } from '@/components/BookingSearchWidget'
import { Map, ShieldCheck, Clock, MapPin, Star } from 'lucide-react'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] w-full flex flex-col items-center justify-center pt-16">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=2000")' }}
        >
          <div className="absolute inset-0 bg-slate-950/50"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto -mt-20">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-md tracking-tight">
            Explore the Hills with <span className="text-[#E34234]">VEHEGO</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-100 font-extrabold drop-shadow-sm mb-12">
            Premium Cabs & Sightseeing for Darjeeling, Gangtok, Sikkim & North Bengal
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <div className="px-4">
        <BookingSearchWidget />
      </div>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-12">Why Choose VEHE<span className="text-[#E34234]">GO</span>?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-red-50/50 p-8 rounded-3xl text-center border border-red-100 hover:shadow-lg hover:border-red-300 transition-all">
              <div className="w-16 h-16 mx-auto bg-red-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-red-600/30">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Verified Drivers</h3>
              <p className="text-slate-600 font-medium leading-relaxed">All our drivers undergo strict background checks, mountain driving verification, and vehicle quality inspections.</p>
            </div>
            
            <div className="bg-red-50/50 p-8 rounded-3xl text-center border border-red-100 hover:shadow-lg hover:border-red-300 transition-all">
              <div className="w-16 h-16 mx-auto bg-red-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-red-600/30">
                <Map className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Transparent Fixed Rates</h3>
              <p className="text-slate-600 font-medium leading-relaxed">No hidden charges. Clear breakdown including hill allowances, permits, and driver fees upfront.</p>
            </div>

            <div className="bg-red-50/50 p-8 rounded-3xl text-center border border-red-100 hover:shadow-lg hover:border-red-300 transition-all">
              <div className="w-16 h-16 mx-auto bg-red-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-red-600/30">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">On-time Guarantee</h3>
              <p className="text-slate-600 font-medium leading-relaxed">Punctual pickups for Bagdogra Airport and NJP Railway Station with 24/7 dedicated helpline support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-12">Popular Mountain Sectors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { origin: 'Bagdogra Airport', dest: 'Darjeeling', price: '₹2,700', image: 'https://images.unsplash.com/photo-1626248384218-f0275817d23d?auto=format&fit=crop&q=80&w=400' },
              { origin: 'Siliguri', dest: 'Gangtok', price: '₹3,500', image: 'https://images.unsplash.com/photo-1610996841108-72b9a71095f9?auto=format&fit=crop&q=80&w=400' },
              { origin: 'NJP Station', dest: 'Kalimpong', price: '₹2,400', image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=400' },
              { origin: 'Darjeeling', dest: 'Mirik', price: '₹1,800', image: 'https://images.unsplash.com/photo-1542159154-1b47be27c089?auto=format&fit=crop&q=80&w=400' },
            ].map((route, i) => (
              <a href={`/cabs/search?origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.dest)}&type=one-way`} key={i} className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all aspect-[4/5] block border border-slate-200">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url("${route.image}")` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-red-400 mb-2 tracking-wider">
                    <MapPin className="w-4 h-4" />
                    Popular Sector
                  </div>
                  <h3 className="text-2xl font-black mb-1">{route.origin}</h3>
                  <p className="text-slate-300 font-semibold text-sm mb-3">to {route.dest}</p>
                  <p className="font-extrabold text-xl text-white bg-red-600/90 inline-block px-3 py-1 rounded-xl">From {route.price}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-slate-950 text-white border-t border-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-12">Loved by Mountain Travelers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-300 italic mb-6 leading-relaxed">
                  &quot;Absolutely brilliant experience with VEHEGO. The driver was polite, knew hill roads perfectly, and the Innova was spotless. Highly recommended!&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E34234] flex items-center justify-center font-black text-white shadow-md">
                    A
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white">Anjali Sharma</h4>
                    <p className="text-xs text-slate-400 font-semibold">Delhi, India</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
