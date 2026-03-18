import { useCurrency } from '@/contexts/CurrencyContext';
import { useLocation } from 'react-router-dom';

const options = ['USD', 'XCD'] as const;

export const CurrencyToggle = () => {
  const { currency, setCurrency } = useCurrency();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div
      style={{
        display: 'inline-flex',
        border: isAdmin
          ? '1px solid rgba(184,150,90,0.35)'
          : '1px solid rgba(255,255,255,0.30)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginLeft: '8px',
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
            background: currency === opt
              ? (isAdmin ? 'hsl(37 38% 54%)' : '#B8965A')
              : (isAdmin ? 'rgba(11,42,59,0.06)' : 'rgba(255,255,255,0.10)'),
            color: currency === opt
              ? (isAdmin ? '#fff' : '#0B2A3B')
              : (isAdmin ? 'rgba(11,42,59,0.6)' : 'rgba(255,255,255,0.85)'),
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
