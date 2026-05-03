import { useEffect, useState } from "react";
import { MapPin, Phone } from "lucide-react";
import { fetchBranches } from "../../lib/api";

export default function ShowroomSection() {
  const [branches, setBranches] = useState([]);
  useEffect(() => { fetchBranches().then(setBranches).catch(() => {}); }, []);

  return (
    <section className="py-16 lg:py-24 bg-[#F5F5F7]" data-testid="showroom-section">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Reach Us</div>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight mt-2">Showrooms & Workshops</h2>
          </div>
          <div className="text-sm text-gray-600">Serving Ahmedabad and Gujarat since 2012</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {branches.map((b, i) => (
            <div key={i} className="bg-white border border-gray-200 p-6 flex flex-col hover:border-honda transition-colors" data-testid={`branch-${i}`}>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-honda">{b.type.replace("_", " + ")}</div>
              <h3 className="font-display font-bold text-lg mt-2">{b.name}</h3>
              <div className="flex gap-2 mt-4 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-honda shrink-0 mt-0.5" />
                <span>{b.address}</span>
              </div>
              <a href={`tel:${b.phone}`} className="mt-3 flex gap-2 text-sm font-bold hover:text-honda">
                <Phone className="w-4 h-4 text-honda" /> +91 {b.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
