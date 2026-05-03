import { Wrench, ShieldCheck, RefreshCw, Truck, Award, Bell, Bike } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { icon: Wrench, title: "Vehicle Service", desc: "Book your vehicle for free or paid service, 8 AM - 6 PM daily.", cta: "Book Service", link: "/services" },
  { icon: ShieldCheck, title: "Accident Claim Insurance", desc: "End-to-end claim processing and repair of accidentally damaged vehicles.", cta: "Contact Branch", link: "/contact" },
  { icon: RefreshCw, title: "Insurance Renewal", desc: "Renew two-wheeler insurance at any Punjab Honda branch.", cta: "Renew Now", link: "/insurance" },
  { icon: Truck, title: "Accidents & Breakdown*", desc: "Stuck anywhere in Ahmedabad? Call 9825007605 / 7600062148. T&C apply.", cta: "Call Now", link: "tel:9825007605" },
  { icon: Award, title: "Annual Maintenance (AMC)", desc: "Sign an AMC and never worry about regular servicing again.", cta: "Know More", link: "/services" },
  { icon: Bell, title: "SMS Service Reminder", desc: "Get SMS alerts for your next free service — never miss a slot.", cta: "Subscribe", link: "/contact" },
  { icon: Bike, title: "Drop Facility", desc: "Free drop facility up to 5 km from our service stations.", cta: "Ask at Booking", link: "/services" },
];

export default function ServicesSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-950 text-white relative overflow-hidden" data-testid="services-section">
      <div className="absolute inset-0 opacity-5">
        <img src="https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=1600&q=80" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative">
        <div className="max-w-2xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Services by Punjab Honda</div>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight mt-2 leading-[1]">
            All solutions of your needs <span className="text-honda">under one roof.</span>
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-gray-800">
          {services.map((s) => (
            <div key={s.title} className="bg-gray-950 p-7 group hover:bg-gray-900 transition-colors flex flex-col" data-testid={`service-${s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
              <div className="w-12 h-12 border border-gray-700 flex items-center justify-center group-hover:border-honda group-hover:bg-honda transition-colors">
                <s.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg mt-5">{s.title}</h3>
              <p className="text-sm text-gray-400 mt-2 flex-1">{s.desc}</p>
              {s.link.startsWith("tel:") ? (
                <a href={s.link} className="mt-5 text-xs font-bold uppercase tracking-wider text-honda hover:text-white">{s.cta} →</a>
              ) : (
                <Link to={s.link} className="mt-5 text-xs font-bold uppercase tracking-wider text-honda hover:text-white">{s.cta} →</Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
