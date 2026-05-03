import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";

export default function EmiCalculator({ onOpenEnquiry }) {
  const [amount, setAmount] = useState(80000);
  const [tenure, setTenure] = useState(36);
  const [rate, setRate] = useState(10.5);

  const { emi, totalInterest, totalPayment } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = tenure;
    const e = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = e * n;
    return { emi: Math.round(e), totalPayment: Math.round(total), totalInterest: Math.round(total - amount) };
  }, [amount, tenure, rate]);

  return (
    <>
      <section className="bg-gray-950 text-white py-14" data-testid="emi-hero">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Online EMI Calculator</div>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tighter mt-2 flex items-center gap-3"><Calculator className="w-10 h-10 text-honda" /> Plan Your Honda</h1>
          <p className="mt-3 text-gray-300 max-w-2xl">Estimate your monthly EMI in seconds. Customize loan amount, tenure and interest rate.</p>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="border border-gray-200 p-8 space-y-7" data-testid="emi-form">
            <Slider label="Loan Amount" value={amount} setValue={setAmount} min={20000} max={2000000} step={5000} format={v => `₹${v.toLocaleString("en-IN")}`} testid="emi-amount" />
            <Slider label="Tenure (months)" value={tenure} setValue={setTenure} min={6} max={60} step={6} format={v => `${v} months`} testid="emi-tenure" />
            <Slider label="Interest Rate" value={rate} setValue={setRate} min={7} max={18} step={0.25} format={v => `${v.toFixed(2)} %`} testid="emi-rate" />
          </div>
          <div className="bg-gray-950 text-white p-8 flex flex-col" data-testid="emi-result">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda">Monthly EMI</div>
            <div className="font-mono font-black text-5xl mt-2 text-white">₹{emi.toLocaleString("en-IN")}</div>
            <div className="mt-8 grid grid-cols-2 gap-px bg-gray-800">
              <Stat label="Principal" value={`₹${amount.toLocaleString("en-IN")}`} />
              <Stat label="Interest" value={`₹${totalInterest.toLocaleString("en-IN")}`} />
              <Stat label="Tenure" value={`${tenure} mo`} />
              <Stat label="Total Payable" value={`₹${totalPayment.toLocaleString("en-IN")}`} />
            </div>
            <button
              onClick={() => onOpenEnquiry({ type: "quote", title: "Get Finance Quote" })}
              className="mt-auto bg-honda text-white py-4 text-xs font-bold uppercase tracking-wider hover:bg-honda-dark mt-8"
              data-testid="emi-quote-btn"
            >
              Get Personalized Quote
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

const Slider = ({ label, value, setValue, min, max, step, format, testid }) => (
  <div>
    <div className="flex justify-between items-baseline">
      <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">{label}</div>
      <div className="font-mono font-bold text-lg">{format(value)}</div>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => setValue(Number(e.target.value))} className="w-full mt-3 accent-honda" data-testid={testid} />
    <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono"><span>{format(min)}</span><span>{format(max)}</span></div>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="bg-gray-950 p-5">
    <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{label}</div>
    <div className="font-mono font-bold text-base mt-1">{value}</div>
  </div>
);
