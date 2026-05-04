import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BikeHero({ bike, onOpenEnquiry }) {
  return (
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
            <HeroCtas bike={bike} onOpenEnquiry={onOpenEnquiry} />
          </div>
          <div className="relative aspect-[4/3] bg-white">
            <img src={bike.image} alt={bike.name} className="w-full h-full object-contain p-6" />
            <div className="absolute top-3 right-3 bg-honda text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">Punjab Honda</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCtas({ bike, onOpenEnquiry }) {
  const open = (type, title) => () => onOpenEnquiry({ type, title, vehicle: bike });
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-3">
      <button onClick={open("test_ride", "Book a Test Ride")} className="bg-honda text-white px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark" data-testid="bike-detail-test-ride">Book Test Ride</button>
      <button onClick={open("quote", "Get On-Road Price")} className="bg-white text-gray-900 px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-gray-100" data-testid="bike-detail-quote">Get On-Road Price</button>
      <button onClick={open("product_enquiry", "Product Enquiry")} className="border-2 border-white text-white px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-gray-900" data-testid="bike-detail-enquiry">Product Enquiry</button>
    </div>
  );
}
