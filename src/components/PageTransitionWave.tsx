// Simplified navigation context — the visual transition is now handled by WaveTransition + AnimatePresence
import { createContext, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface WaveNavContextValue {
  navigateTo: (path: string) => void;
}

const WaveNavContext = createContext<WaveNavContextValue>({
  navigateTo: () => {},
});

export const useWaveNav = () => useContext(WaveNavContext);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = useCallback(
    (path: string) => {
      if (path === location.pathname) return;
      navigate(path);
    },
    [location.pathname, navigate]
  );

  return (
    <WaveNavContext.Provider value={{ navigateTo }}>
      {children}
    </WaveNavContext.Provider>
  );
}
