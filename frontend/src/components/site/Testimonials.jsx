import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { fetchTestimonials } from "../../lib/api";

export default function Testimonials() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetchTestimonials().then(setItems).catch(() => setItems([])); }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Customer Love</div>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight mt-2">What Our Riders Say</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.id || t.name} className="border border-gray-200 p-8 bg-white relative" data-testid={`testimonial-${(t.name || "").toLowerCase().replace(/\s+/g, '-')}`}>
              <Quote className="w-10 h-10 text-honda/20 absolute top-6 right-6" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating || 5 }, (_, j) => <Star key={`star-${t.id || t.name}-${j}`} className="w-4 h-4 fill-honda text-honda" />)}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">"{t.text}"</p>
              <div className="mt-6 pt-5 border-t border-gray-100 font-display font-bold">{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
