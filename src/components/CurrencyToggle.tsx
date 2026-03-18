import { useCurrency } from '@/contexts/CurrencyContext';

const options = ['USD', 'XCD'] as const;

export const CurrencyToggle = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      style={{
        display: 'inline-flex',
        border: '1px solid rgba(255,255,255,0.30)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setCurrency(opt)}
          style={{
            padding: '5px 11px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.25s ease, color 0.25s ease',
            background: currency === opt ? '#B8965A' : 'rgba(255,255,255,0.10)',
            color: currency === opt ? '#0B2A3B' : 'rgba(255,255,255,0.85)',
          }}
          aria-pressed={currency === opt}
          aria-label={`Switch to ${opt === 'USD' ? 'US Dollars' : 'Eastern Caribbean Dollars'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

export default CurrencyToggle;
