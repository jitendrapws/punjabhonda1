import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Phone, Menu, X, ChevronDown } from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/bikes?category=motorcycle", label: "Motorcycles" },
  { to: "/bikes?category=scooter", label: "Scooters" },
  { to: "/bikes?category=ev", label: "EV" },
  { to: "/bikes?category=bigwing", label: "Big Wing" },
  { to: "/services", label: "Services" },
  { to: "/insurance", label: "Insurance" },
  { to: "/emi-calculator", label: "EMI" },
  { to: "/contact", label: "Contact" },
];

export default function Header({ onOpenEnquiry }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200" data-testid="site-header">
      {/* Utility bar */}
      <div className="bg-gray-900 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-4">
            <span className="opacity-70">Welcome to Punjab Honda — Ahmedabad's trusted Honda 2-wheeler dealer</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:9925115151" className="flex items-center gap-1 hover:text-honda transition-colors" data-testid="util-sales-phone">
              <Phone className="w-3 h-3" /> SALES 9925 11 51 51
            </a>
            <a href="tel:9879788877" className="hidden sm:flex items-center gap-1 hover:text-honda transition-colors" data-testid="util-service-phone">
              <Phone className="w-3 h-3" /> SERVICE 9879 78 88 77
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3" data-testid="brand-logo-link">
          <div className="bg-honda text-white font-display font-black text-2xl px-3 py-1 tracking-tight">H</div>
          <div className="leading-tight">
            <div className="font-display font-black text-lg tracking-tight">PUNJAB HONDA</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Authorized HMSI Dealer</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = loc.pathname + loc.search === item.to || (item.to === "/" && loc.pathname === "/");
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-link text-sm font-bold uppercase tracking-wider ${isActive ? "text-honda active" : "text-gray-900"}`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}-link`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => onOpenEnquiry({ type: "quote", title: "Get On-Road Price" })}
            className="bg-gray-900 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
            data-testid="header-onroad-price-btn"
          >
            On-Road Price
          </button>
          <button
            onClick={() => onOpenEnquiry({ type: "test_ride", title: "Book a Test Ride" })}
            className="bg-honda text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark transition-colors"
            data-testid="header-test-ride-btn"
          >
            Book Test Ride
          </button>
        </div>

        <button className="lg:hidden" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-sm font-bold uppercase tracking-wider text-gray-900 py-2 border-b border-gray-100"
                data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}-link`}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="flex gap-2 mt-2">
              <button onClick={() => { setOpen(false); onOpenEnquiry({ type: "quote", title: "Get On-Road Price" }); }} className="flex-1 bg-gray-900 text-white py-3 text-xs font-bold uppercase">On-Road Price</button>
              <button onClick={() => { setOpen(false); onOpenEnquiry({ type: "test_ride", title: "Book Test Ride" }); }} className="flex-1 bg-honda text-white py-3 text-xs font-bold uppercase">Test Ride</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
