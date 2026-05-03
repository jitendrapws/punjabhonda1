import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchBike } from "../lib/api";
import { ArrowLeft, Gauge, Fuel, Zap, Calendar } from "lucide-react";

export default function BikeDetail({ onOpenEnquiry }) {
  const { slug } = useParams();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchBike(slug).then(setBike).catch(() => setErr(true)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500" data-testid="bike-detail-loading">Loading...</div>;
  if (err || !bike) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center" data-testid="bike-not-found">
      <h2 className="font-display font-black text-3xl">Bike not found</h2>
      <Link to="/bikes" className="mt-4 inline-block text-honda font-bold">← Back to all bikes</Link>
    </div>
  );

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
              <h1 className="font-display font-black text-5xl sm:text-7xl uppercase tracking-tighter mt-2">{bike.name}</h1>
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
            <div className="relative aspect-[4/3] bg-gray-100">
              <img src={bike.image} alt={bike.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-honda text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">Punjab Honda</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white" data-testid="bike-detail-specs">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="font-display font-black text-2xl uppercase tracking-tight mb-8">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpecCard icon={Gauge} label="Engine" value={bike.engine} />
            <SpecCard icon={Zap} label="Max Power" value={bike.power} />
            <SpecCard icon={Fuel} label="Mileage" value={bike.mileage} />
          </div>
          <div className="mt-12 bg-[#F5F5F7] p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
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
  <div className="border border-gray-200 p-6">
    <div className="w-10 h-10 bg-honda/10 text-honda flex items-center justify-center"><Icon className="w-5 h-5" /></div>
    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mt-4">{label}</div>
    <div className="font-mono font-bold text-xl mt-1">{value}</div>
  </div>
);
