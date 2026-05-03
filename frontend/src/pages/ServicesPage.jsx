import ServicesSection from "../components/site/ServicesSection";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function ServicesPage({ onOpenEnquiry }) {
  return (
    <>
      <section className="bg-gray-950 text-white py-14 relative overflow-hidden" data-testid="services-page-hero">
        <img src="https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=1600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">After-Sales Care</div>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tighter mt-2">Services by Punjab Honda</h1>
          <p className="mt-3 text-gray-300 max-w-2xl">From routine servicing to AMC, accident claims and breakdown — your two-wheeler is in expert hands.</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link to="/services" className="bg-honda px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark" data-testid="services-book-link">Book Service</Link>
            <button onClick={() => onOpenEnquiry({ type: "amc", title: "AMC Buy / Renew" })} className="border-2 border-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-gray-900" data-testid="services-amc-btn">Buy / Renew AMC</button>
          </div>
        </div>
      </section>

      <ServicesSection />

      {/* Why Punjab Honda */}
      <section className="py-14 bg-white" data-testid="why-section">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="font-display font-black text-3xl uppercase tracking-tight">Why Punjab Honda Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {["Honda-trained technicians", "100% genuine spares", "Transparent pricing", "Same-day delivery", "Free pickup/drop within 5 km", "Real-time service status SMS"].map((t) => (
              <div key={t} className="border border-gray-200 p-6 flex gap-3" data-testid={`why-${t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                <CheckCircle2 className="w-5 h-5 text-honda shrink-0" />
                <div className="font-bold">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service booking link page */}
      <section className="py-14 bg-[#F5F5F7]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display font-black text-3xl uppercase tracking-tight">Ready to book?</h2>
          <p className="text-gray-600 mt-2">Pick your branch, date and slot in under 60 seconds.</p>
          <Link to="/service-booking" className="inline-block mt-6 bg-honda px-8 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-honda-dark" data-testid="services-book-now-link">
            Book Service Now →
          </Link>
        </div>
      </section>
    </>
  );
}
