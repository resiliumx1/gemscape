import { useCurrency } from '@/contexts/CurrencyContext';
import { useLocation } from 'react-router-dom';

const options = ['USD', 'XCD'] as const;

export const CurrencyToggle = () => {
  const { currency, setCurrency } = useCurrency();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="currency-toggle" data-admin={isAdmin ? "true" : undefined}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setCurrency(opt)}
          className={`currency-toggle__btn${currency === opt ? ' currency-toggle__btn--active' : ''}`}
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
