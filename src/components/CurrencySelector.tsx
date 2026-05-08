import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";

interface CurrencySelectorProps {
  /** Show only the code (no symbol) — used in tight mobile header. */
  compact?: boolean;
  className?: string;
}

export const CurrencySelector = ({ compact = false, className = "" }: CurrencySelectorProps) => {
  const { currency, setCurrency } = useCurrency();
  const active = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Select currency"
        className={`gem-currency-trigger inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-body font-semibold tracking-[0.18em] uppercase transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gem-teal/50 ${className}`}
      >
        {!compact && (
          <span className="opacity-80" aria-hidden="true">
            {active.symbol}
          </span>
        )}
        <span>{active.code}</span>
        <ChevronDown size={12} strokeWidth={2} className="opacity-70 -mr-0.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="gem-currency-menu min-w-[260px] p-1.5 rounded-xl border shadow-2xl"
      >
        {CURRENCIES.map((c) => {
          const selected = c.code === currency;
          return (
            <DropdownMenuItem
              key={c.code}
              onSelect={() => setCurrency(c.code)}
              className="gem-currency-item flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 cursor-pointer text-[13px] font-body"
              aria-label={`${c.code} — ${c.name}`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="inline-flex items-center justify-center min-w-[2.4rem] text-[11px] font-semibold tracking-wider opacity-80"
                  aria-hidden="true"
                >
                  {c.symbol}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-semibold tracking-wide">{c.code}</span>
                  <span className="text-[11px] opacity-70">{c.name}</span>
                </span>
              </span>
              {selected && <Check size={14} className="text-gem-gold shrink-0" strokeWidth={2.2} />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
