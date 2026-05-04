import { Gauge, Fuel, Zap, Palette, ListChecks } from "lucide-react";
import { guessColorHex } from "./helpers";

const SpecCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white p-6">
    <div className="w-10 h-10 bg-honda/10 text-honda flex items-center justify-center"><Icon className="w-5 h-5" /></div>
    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mt-4">{label}</div>
    <div className="font-mono font-bold text-xl mt-1">{value}</div>
  </div>
);

export function BikeHighlights({ bike }) {
  return (
    <section className="py-10 bg-white" data-testid="bike-detail-highlights">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
          <SpecCard icon={Gauge} label="Engine" value={bike.engine} />
          <SpecCard icon={Zap} label="Max Power" value={bike.power} />
          <SpecCard icon={Fuel} label="Mileage" value={bike.mileage} />
        </div>
      </div>
    </section>
  );
}

export function ColorOptions({ colors, activeColor, onSelect }) {
  if (!colors?.length) return null;
  return (
    <section className="py-12 bg-[#F5F5F7] border-y border-gray-200" data-testid="bike-detail-colors">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> Color Options</div>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight mt-2">Pick Your Shade</h2>
          </div>
          {activeColor && (
            <div className="text-sm">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Selected:</span>{" "}
              <span className="font-bold ml-1" data-testid="bike-detail-active-color">{activeColor}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => onSelect(c)}
              className={`group flex items-center gap-2 px-4 py-2 border bg-white transition-colors ${activeColor === c ? "border-honda" : "border-gray-300 hover:border-gray-500"}`}
              data-testid={`bike-detail-color-${c.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            >
              <span className="w-5 h-5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: guessColorHex(c) }} />
              <span className="text-xs font-bold uppercase tracking-wider">{c}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SpecsTable({ specifications }) {
  const entries = Object.entries(specifications || {});
  if (!entries.length) return null;
  return (
    <section className="py-14 bg-white" data-testid="bike-detail-specs">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-honda flex items-center gap-2"><ListChecks className="w-3.5 h-3.5" /> Technical Details</div>
        <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight mt-2 mb-6">Full Specifications</h2>
        <div className="border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {entries.map(([k, v], i) => (
                <tr key={k} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"} data-testid={`spec-${k.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                  <td className="p-4 text-[11px] uppercase tracking-[0.1em] font-bold text-gray-500 w-1/3 sm:w-1/4 border-r border-gray-200">{k}</td>
                  <td className="p-4 font-mono text-sm text-gray-900">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
