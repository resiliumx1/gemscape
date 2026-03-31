// PageTransitionWave.tsx — navigation context only, no visuals
export { useWaveNav } from '@/components/WaveTransition';

import { createContext, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavCtx { navigateTo: (path: string) => void; }
const Ctx = createContext<NavCtx>({ navigateTo: () => {} });
export const usePageNav = () => useContext(Ctx);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const navigateTo = useCallback(
    (path: string) => { if (path !== location.pathname) navigate(path); },
    [navigate, location.pathname]
  );
  return <Ctx.Provider value={{ navigateTo }}>{children}</Ctx.Provider>;
}
