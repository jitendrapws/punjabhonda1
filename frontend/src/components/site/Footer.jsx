import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300" data-testid="site-footer">
      <div className="h-1 honda-stripe" />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-honda text-white font-display font-black text-2xl px-3 py-1">H</div>
            <div className="font-display font-black text-xl text-white">PUNJAB HONDA</div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Honda Motorcycle & Scooter India (HMSI) authorized dealership for Sales, Service & Spare Parts in Ahmedabad since 2012.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="#" className="w-9 h-9 border border-gray-700 flex items-center justify-center hover:bg-honda hover:border-honda transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 border border-gray-700 flex items-center justify-center hover:bg-honda hover:border-honda transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 border border-gray-700 flex items-center justify-center hover:bg-honda hover:border-honda transition-colors"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold text-white uppercase text-sm tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/bikes?category=motorcycle" className="hover:text-honda">Motorcycles</Link></li>
            <li><Link to="/bikes?category=scooter" className="hover:text-honda">Scooters</Link></li>
            <li><Link to="/bikes?category=ev" className="hover:text-honda">Electric Vehicles</Link></li>
            <li><Link to="/bikes?category=bigwing" className="hover:text-honda">Big Wing Super Bikes</Link></li>
            <li><Link to="/emi-calculator" className="hover:text-honda">EMI Calculator</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-white uppercase text-sm tracking-wider mb-4">Services</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services" className="hover:text-honda">Vehicle Service Booking</Link></li>
            <li><Link to="/insurance" className="hover:text-honda">Insurance Renewal</Link></li>
            <li><Link to="/services" className="hover:text-honda">Annual Maintenance (AMC)</Link></li>
            <li><Link to="/services" className="hover:text-honda">Accident Claim</Link></li>
            <li><Link to="/contact" className="hover:text-honda">Contact Branch</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-white uppercase text-sm tracking-wider mb-4">Reach Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 text-honda shrink-0" /> Ashram Road, Near Gujarat Vidyapith, Ahmedabad - 380014</li>
            <li className="flex gap-2"><Phone className="w-4 h-4 mt-0.5 text-honda shrink-0" /> <a href="tel:9925115151">+91 9925 11 51 51</a></li>
            <li className="flex gap-2"><Mail className="w-4 h-4 mt-0.5 text-honda shrink-0" /> <a href="mailto:customercare@punjabhonda.com">customercare@punjabhonda.com</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5 text-xs text-gray-500 flex flex-col md:flex-row justify-between gap-2">
          <div>© 2012–2026 Punjab Honda. All Rights Reserved.</div>
          <div>Authorized dealer of Honda Motorcycle & Scooter India Pvt. Ltd.</div>
        </div>
      </div>
    </footer>
  );
}
