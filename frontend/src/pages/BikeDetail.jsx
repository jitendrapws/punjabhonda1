import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchBike } from "../lib/api";
import { ArrowLeft, Gauge, Fuel, Zap, Calendar, Palette, ListChecks } from "lucide-react";

const COLOR_HEX_GUESS = (name) => {
  const n = name.toLowerCase();
  if (n.includes("white") || n.includes("ross") || n.includes("misty") || n.includes("glare") || n.includes("pearl precious")) return "#F5F5F5";
  if (n.includes("black") || n.includes("igneous") || n.includes("ballistic")) return "#111111";
  if (n.includes("red") || n.includes("sangria") || n.includes("rebel") || n.includes("imperial") || n.includes("spartan") || n.includes("grand prix") || n.includes("precious red") || n.includes("sports red")) return "#C8102E";
  if (n.includes("blue") || n.includes("siren") || n.includes("decent") || n.includes("marvel") || n.includes("athletic") || n.includes("serenity") || n.includes("shallow")) return "#1E4FA8";
  if (n.includes("green") || n.includes("marshal")) return "#2A6B3F";
  if (n.includes("grey") || n.includes("gray") || n.includes("axis") || n.includes("iridium") || n.includes("foggy") || n.includes("steel")) return "#666666";
  if (n.includes("silver")) return "#B0B0B0";
  return "#999999";
};

export default function BikeDetail({ onOpenEnquiry }) {
  const { slug } = useParams();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [activeColor, setActiveColor] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchBike(slug).then((b) => { setBike(b); setActiveColor((b?.color_options || [])[0] || ""); })
      .catch(() => setErr(true)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500" data-testid="bike-detail-loading">Loading...</div>;
  if (err || !bike) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center" data-testid="bike-not-found">
      <h2 className="font-display font-black text-3xl">Bike not found</h2>
      <Link to="/bikes" className="mt-4 inline-block text-honda font-bold">← Back to all bikes</Link>
    </div>
  );

  const colors = bike.color_options || [];
  const specs = bike.specifications || {};
  const specEntries = Object.entries(specs);

  return (
    <>
      <section className="bg-gradient-to-br from-gray-950 to-gray-800 text-white" data-testid="bike-detail-hero">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <Link to="/bikes" className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-gray-400 hover:text-white mb-6" data-testid="back-to-bikes">
            <ArrowLeft className="w-4 h-4" /> All Bikes
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">{bike.category}</div>
              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tighter mt-2 leading-[0.95]">{bike.name}</h1>
              <p className="mt-4 text-gray-300 text-lg max-w-lg">{bike.description}</p>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Ex-showroom from</span>
                <span className="font-mono font-bold text-3xl text-honda">₹{bike.price_from.toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => onOpenEnquiry({ type: "test_ride", title: "Book a Test Ride", vehicle: bike })} className="bg-honda text-white px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark" data-testid="bike-detail-test-ride">
                  Book Test Ride
                </button>
                <button onClick={() => onOpenEnquiry({ type: "quote", title: "Get On-Road Price", vehicle: bike })} className="bg-white text-gray-900 px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-gray-100" data-testid="bike-detail-quote">
                  Get On-Road Price
                </button>
                <button onClick={() => onOpenEnquiry({ type: "product_enquiry", title: "Product Enquiry", vehicle: bike })} className="border-2 border-white text-white px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-gray-900" data-testid="bike-detail-enquiry">
                  Product Enquiry
                </button>
              </div>
            </div>
            <div className="relative aspect-[4/3] bg-white">
              <img src={bike.image} alt={bike.name} className="w-full h-full object-contain p-6" />
              <div className="absolute top-3 right-3 bg-honda text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">Punjab Honda</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick highlights */}
      <section className="py-10 bg-white" data-testid="bike-detail-highlights">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
            <SpecCard icon={Gauge} label="Engine" value={bike.engine} />
            <SpecCard icon={Zap} label="Max Power" value={bike.power} />
            <SpecCard icon={Fuel} label="Mileage" value={bike.mileage} />
          </div>
        </div>
      </section>

      {/* Color options */}
      {colors.length > 0 && (
        <section className="py-12 bg-[#F5F5F7] border-y border-gray-200" data-testid="bike-detail-colors">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> Color Options</div>
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight mt-2">Pick Your Shade</h2>
              </div>
              {activeColor && (
                <div className="text-sm">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Selected:</span>{" "}
                  <span className="font-bold ml-1" data-testid="bike-detail-active-color">{activeColor}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveColor(c)}
                  className={`group flex items-center gap-2 px-4 py-2 border bg-white transition-colors ${activeColor === c ? "border-honda" : "border-gray-300 hover:border-gray-500"}`}
                  data-testid={`bike-detail-color-${c.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                >
                  <span className="w-5 h-5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: COLOR_HEX_GUESS(c) }} />
                  <span className="text-xs font-bold uppercase tracking-wider">{c}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full specifications table */}
      {specEntries.length > 0 && (
        <section className="py-14 bg-white" data-testid="bike-detail-specs">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda flex items-center gap-2"><ListChecks className="w-3.5 h-3.5" /> Technical Details</div>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight mt-2 mb-6">Full Specifications</h2>
            <div className="border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {specEntries.map(([k, v], i) => (
                    <tr key={k} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"} data-testid={`spec-${k.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                      <td className="p-4 text-[11px] uppercase tracking-[0.1em] font-bold text-gray-500 w-1/3 sm:w-1/4 border-r border-gray-200">{k}</td>
                      <td className="p-4 font-mono text-sm text-gray-900">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section className="py-10 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-white border border-gray-200 p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-honda font-bold flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Available Now</div>
              <div className="font-display font-black text-2xl mt-1">Visit our showroom for a live demo</div>
              <div className="text-sm text-gray-600 mt-1">Or call our sales team at +91 9925 11 51 51</div>
            </div>
            <button onClick={() => onOpenEnquiry({ type: "test_ride", title: "Book a Test Ride", vehicle: bike })} className="bg-gray-900 text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-black" data-testid="bike-detail-cta-book">
              Schedule Visit
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

const SpecCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white p-6">
    <div className="w-10 h-10 bg-honda/10 text-honda flex items-center justify-center"><Icon className="w-5 h-5" /></div>
    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mt-4">{label}</div>
    <div className="font-mono font-bold text-xl mt-1">{value}</div>
  </div>
);
