import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchHeroSlides } from "../../lib/api";

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => { fetchHeroSlides().then(setSlides).catch(() => setSlides([])); }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) {
    return <section className="h-[520px] sm:h-[600px] bg-gray-950" data-testid="hero-slider-empty" />;
  }

  return (
    <section className="relative h-[520px] sm:h-[600px] bg-gray-950 overflow-hidden" data-testid="hero-slider">
      {slides.map((s, i) => (
        <div key={s.id || s.tag} className={`slider-slide ${i === idx ? "active" : ""}`} aria-hidden={i !== idx}>
          {s.image && <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 h-full flex items-center">
            <div className="max-w-2xl text-white">
              {s.tag && (
                <div className="inline-flex items-center gap-2 bg-honda px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
                  <span className="w-1.5 h-1.5 bg-white"></span>
                  {s.tag}
                </div>
              )}
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tighter leading-[0.95]">
                {s.title}
              </h1>
              {s.subtitle && <p className="mt-5 text-base sm:text-lg text-gray-200 max-w-xl">{s.subtitle}</p>}
              {s.accent && <div className="mt-3 font-mono text-honda text-sm tracking-wider">{s.accent}</div>}
              {s.cta && (
                <Link to={s.cta_link || "/bikes"} className="mt-8 inline-flex items-center gap-2 bg-honda px-7 py-4 text-sm font-bold uppercase tracking-wider hover:bg-honda-dark transition-colors" data-testid={`hero-cta-${(s.tag || s.id || "slide").toLowerCase().replace(/\s+/g, '-')}`}>
                  {s.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id || s.tag}
              onClick={() => setIdx(i)}
              className={`h-1 transition-all ${i === idx ? "w-10 bg-honda" : "w-5 bg-white/50"}`}
              aria-label={`Slide ${i + 1}`}
              data-testid={`hero-dot-${i}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
