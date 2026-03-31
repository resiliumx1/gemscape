// PageTransitionWave.tsx
// Navigation context provider — sourced from the central WaveTransition system.
// PageTransitionProvider is used in App.tsx to provide navigateTo() to the tree.

import { createContext, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export { useWaveNav } from '@/components/WaveTransition';

interface WaveNavContextValue {
  navigateTo: (path: string) => void;
}

const WaveNavContext = createContext<WaveNavContextValue>({
  navigateTo: () => {},
});

export function PageTransitionProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = useCallback(
    (path: string) => {
      if (path === location.pathname) return;
      navigate(path);
    },
    [navigate, location.pathname]
  );

  return (
    <WaveNavContext.Provider value={{ navigateTo }}>
      {children}
    </WaveNavContext.Provider>
  );
}
