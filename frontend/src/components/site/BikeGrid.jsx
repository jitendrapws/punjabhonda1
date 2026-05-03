import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Fuel, Gauge } from "lucide-react";
import { fetchBikes } from "../../lib/api";

const tabs = [
  { key: "", label: "All" },
  { key: "motorcycle", label: "Motorcycle" },
  { key: "scooter", label: "Scooter" },
  { key: "ev", label: "EV" },
  { key: "bigwing", label: "Big Wing" },
];

export default function BikeGrid({ defaultCategory = "", onOpenEnquiry, limit }) {
  const [cat, setCat] = useState(defaultCategory);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBikes(cat || undefined).then(data => {
      setBikes(limit ? data.slice(0, limit) : data);
    }).finally(() => setLoading(false));
  }, [cat, limit]);

  return (
    <section className="py-14 lg:py-20 bg-[#F5F5F7]" data-testid="bike-grid-section">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Our Lineup</div>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight mt-2">Explore Honda Two-Wheelers</h2>
            <p className="text-gray-600 mt-2 max-w-xl text-sm">From the city-friendly Activa to the adrenaline-packed CBR range — there's a Honda for every rider.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setCat(t.key)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${cat === t.key ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"}`}
                data-testid={`bike-tab-${t.key || "all"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500" data-testid="bikes-loading">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {bikes.map(b => (
              <Link to={`/bikes/${b.slug}`} key={b.slug} className="bike-card bg-white border border-gray-200 flex flex-col group" data-testid={`bike-card-${b.slug}`}>
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img src={b.image} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-honda font-bold">{b.category}</div>
                  <h3 className="font-display font-bold text-xl mt-1">{b.name}</h3>
                  <div className="mt-3 flex gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> {b.engine}</span>
                    <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" /> {b.mileage}</span>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase text-gray-500 font-bold">Ex-showroom from</div>
                      <div className="font-mono text-lg font-bold">₹{b.price_from.toLocaleString("en-IN")}</div>
                    </div>
                    <span className="text-honda group-hover:translate-x-1 transition-transform"><ArrowRight className="w-5 h-5" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
