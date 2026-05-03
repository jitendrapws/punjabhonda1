import { useSearchParams } from "react-router-dom";
import BikeGrid from "../components/site/BikeGrid";

export default function BikesListing({ onOpenEnquiry }) {
  const [params] = useSearchParams();
  const category = params.get("category") || "";

  const titles = {
    motorcycle: "Motorcycles", scooter: "Scooters", ev: "Electric Vehicles", bigwing: "Big Wing Super Bikes", "": "All Two-Wheelers"
  };

  return (
    <>
      <section className="bg-gray-950 text-white py-14 lg:py-20 relative overflow-hidden" data-testid="bikes-listing-hero">
        <img src="https://images.unsplash.com/photo-1714238886076-bb9841c1c974?w=1600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Lineup</div>
          <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tighter mt-2">{titles[category] || "All Two-Wheelers"}</h1>
          <p className="mt-3 text-gray-300 max-w-2xl">Find your next ride. All Honda models available at Punjab Honda — with on-road price, finance, insurance, and free home delivery in Ahmedabad.</p>
        </div>
      </section>
      <BikeGrid defaultCategory={category} key={category} onOpenEnquiry={onOpenEnquiry} />
    </>
  );
}
