import { Star, Quote } from "lucide-react";

const items = [
  { name: "Vansh Bhatt", text: "Had a great experience at the service centre. The staff made the process very easy for me. Highly recommended for genuine Honda care in Ahmedabad.", rating: 5 },
  { name: "Priya Shah", text: "Bought my Activa 125 from Punjab Honda. Transparent pricing, quick delivery, and excellent after-sales. The team walked me through everything.", rating: 5 },
  { name: "Rajesh Patel", text: "Been servicing my Shine at Punjab Honda for 6 years. Never a single complaint. Genuine spares and honest mechanics.", rating: 5 },
];

export default function Testimonials() {
  return (
    <section className="py-16 lg:py-24 bg-white" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Customer Love</div>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight mt-2">What Our Riders Say</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <div key={i} className="border border-gray-200 p-8 bg-white relative" data-testid={`testimonial-${i}`}>
              <Quote className="w-10 h-10 text-honda/20 absolute top-6 right-6" />
              <div className="flex gap-1 mb-4">
                {Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 fill-honda text-honda" />)}
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
