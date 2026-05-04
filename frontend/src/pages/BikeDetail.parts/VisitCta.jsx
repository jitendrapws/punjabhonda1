import { Calendar } from "lucide-react";

export default function VisitCta({ bike, onOpenEnquiry }) {
  return (
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
  );
}
