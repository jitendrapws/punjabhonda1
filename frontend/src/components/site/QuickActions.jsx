import { Link } from "react-router-dom";
import { ShoppingBag, Shield, Wrench, Award, Calculator } from "lucide-react";

export default function QuickActions({ onOpenEnquiry }) {
  const items = [
    { icon: ShoppingBag, label: "Buy Two Wheeler Online", sub: "Book your ride in 4 steps", to: "/bikes", testid: "quick-buy" },
    { icon: Shield, label: "Buy Insurance Online", sub: "Renew / New policy", to: "/insurance", testid: "quick-insurance" },
    { icon: Wrench, label: "Online Service Booking", sub: "Book slot 8AM - 6PM", to: "/services", testid: "quick-service" },
    { icon: Award, label: "AMC Buy / Renew", sub: "Peace of mind guaranteed", action: () => onOpenEnquiry({ type: "amc", title: "AMC Enquiry" }), testid: "quick-amc" },
    { icon: Calculator, label: "EMI Calculator", sub: "Plan your finance", to: "/emi-calculator", testid: "quick-emi" },
  ];
  return (
    <section className="bg-white py-14 lg:py-20 border-b border-gray-100" data-testid="quick-actions">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Quick Actions</div>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight mt-2">Everything Under One Roof</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {items.map((it) => {
            const Inner = (
              <div className="group border border-gray-200 bg-white p-6 h-full flex flex-col gap-3 hover:border-honda transition-colors" data-testid={`${it.testid}-card`}>
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center group-hover:bg-honda group-hover:text-white transition-colors">
                  <it.icon className="w-6 h-6" />
                </div>
                <div className="font-display font-bold text-[15px] leading-tight">{it.label}</div>
                <div className="text-xs text-gray-500">{it.sub}</div>
              </div>
            );
            if (it.action) return <button key={it.testid} onClick={it.action} className="text-left">{Inner}</button>;
            return <Link key={it.testid} to={it.to}>{Inner}</Link>;
          })}
        </div>
      </div>
    </section>
  );
}
