import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const slides = [
  {
    tag: "Festive Offer",
    title: "Ride into the Festive Season",
    subtitle: "Exclusive offers on the all-new Activa 125 & Shine 125",
    cta: "Explore Offers",
    ctaLink: "/bikes?category=scooter",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1600&q=80",
    accent: "SAVE UPTO ₹8,000",
  },
  {
    tag: "Electric Future",
    title: "Activa e: — Silent. Smart. Honda.",
    subtitle: "Honda's first electric scooter with swappable batteries. Book now.",
    cta: "Discover Activa e:",
    ctaLink: "/bikes/activa-e",
    image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=1600&q=80",
    accent: "NEW LAUNCH",
  },
  {
    tag: "Big Wing",
    title: "Unleash the Super Bike in You",
    subtitle: "CBR 650R, CB1000R, Gold Wing — Experience Honda's flagship machines",
    cta: "Explore Big Wing",
    ctaLink: "/bikes?category=bigwing",
    image: "https://images.unsplash.com/photo-1623083089636-42c6d9a1be30?w=1600&q=80",
    accent: "PREMIUM LINE",
  },
];

export default function HeroSlider() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative h-[520px] sm:h-[600px] bg-gray-950 overflow-hidden" data-testid="hero-slider">
      {slides.map((s, i) => (
        <div key={i} className={`slider-slide ${i === idx ? "active" : ""}`} aria-hidden={i !== idx}>
          <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 bg-honda px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
                <span className="w-1.5 h-1.5 bg-white"></span>
                {s.tag}
              </div>
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tighter leading-[0.95]">
                {s.title}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-gray-200 max-w-xl">{s.subtitle}</p>
              <div className="mt-3 font-mono text-honda text-sm tracking-wider">{s.accent}</div>
              <Link to={s.ctaLink} className="mt-8 inline-flex items-center gap-2 bg-honda px-7 py-4 text-sm font-bold uppercase tracking-wider hover:bg-honda-dark transition-colors" data-testid={`hero-cta-${i}`}>
                {s.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1 transition-all ${i === idx ? "w-10 bg-honda" : "w-5 bg-white/50"}`}
            aria-label={`Slide ${i + 1}`}
            data-testid={`hero-dot-${i}`}
          />
        ))}
      </div>
    </section>
  );
}
