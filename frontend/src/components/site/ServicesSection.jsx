import { Wrench, ShieldCheck, RefreshCw, Truck, Award, Bell, Bike } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchServices } from "../../lib/api";

const ICON_MAP = { Wrench, ShieldCheck, RefreshCw, Truck, Award, Bell, Bike };

export default function ServicesSection() {
  const [services, setServices] = useState([]);
  useEffect(() => { fetchServices().then(setServices).catch(() => setServices([])); }, []);

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
          {services.map((s) => {
            const Icon = ICON_MAP[s.icon] || Wrench;
            const link = s.cta_link || "/contact";
            const isExternal = link.startsWith("tel:") || link.startsWith("http");
            return (
              <div key={s.id || s.title} className="bg-gray-950 p-7 group hover:bg-gray-900 transition-colors flex flex-col" data-testid={`service-${(s.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                <div className="w-12 h-12 border border-gray-700 flex items-center justify-center group-hover:border-honda group-hover:bg-honda transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg mt-5">{s.title}</h3>
                <p className="text-sm text-gray-400 mt-2 flex-1">{s.description}</p>
                {isExternal ? (
                  <a href={link} className="mt-5 text-xs font-bold uppercase tracking-wider text-honda hover:text-white">{s.cta_label || "Know More"} →</a>
                ) : (
                  <Link to={link} className="mt-5 text-xs font-bold uppercase tracking-wider text-honda hover:text-white">{s.cta_label || "Know More"} →</Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
