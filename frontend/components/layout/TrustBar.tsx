import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Truck, label: "Free shipping over $50" },
  { icon: RotateCcw, label: "Easy 30-day returns" },
];

export default function TrustBar() {
  return (
    <div className="bg-darksoft text-white/90 border-b border-white/10">
      <div className="container-page">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-2.5 sm:gap-x-10">
          {ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-[11px] sm:text-[12px] font-medium tracking-wide">
              <Icon size={14} className="text-accent shrink-0" strokeWidth={2} aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
