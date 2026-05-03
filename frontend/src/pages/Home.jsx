import HeroSlider from "../components/site/HeroSlider";
import QuickActions from "../components/site/QuickActions";
import BikeGrid from "../components/site/BikeGrid";
import ServicesSection from "../components/site/ServicesSection";
import Testimonials from "../components/site/Testimonials";
import ShowroomSection from "../components/site/ShowroomSection";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Home({ onOpenEnquiry }) {
  return (
    <>
      <HeroSlider />
      <QuickActions onOpenEnquiry={onOpenEnquiry} />

      {/* Categories strip */}
      <section className="bg-white py-14" data-testid="category-strip">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Buy New Two Wheeler</div>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight mt-2">Honda — World's Largest 2W Maker</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Motorcycle", cat: "motorcycle", img: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80" },
              { label: "Scooter", cat: "scooter", img: "https://images.unsplash.com/photo-1568708890-b4a9de8c7a40?w=600&q=80" },
              { label: "EV", cat: "ev", img: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600&q=80" },
              { label: "Big Wing", cat: "bigwing", img: "https://images.unsplash.com/photo-1623083089636-42c6d9a1be30?w=600&q=80" },
            ].map(c => (
              <Link key={c.cat} to={`/bikes?category=${c.cat}`} className="group relative aspect-[4/3] overflow-hidden border border-gray-200" data-testid={`category-${c.cat}`}>
                <img src={c.img} alt={c.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <div className="font-display font-black text-2xl text-white uppercase">{c.label}</div>
                  <div className="text-honda flex items-center gap-1 text-xs font-bold uppercase tracking-wider mt-1">Explore <ArrowRight className="w-3.5 h-3.5" /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BikeGrid limit={8} />
      <ServicesSection />
      <Testimonials />
      <ShowroomSection />
    </>
  );
}
