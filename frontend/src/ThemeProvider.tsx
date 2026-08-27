import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getTheme, type ThemeDefinition } from './theme';
const ThemeContext = createContext<{theme:ThemeDefinition; setTheme:(id:string)=>void}>({theme:getTheme('texflow-dark'),setTheme:()=>{}});
export function ThemeProvider({children}:{children:ReactNode}) {
  const [themeId,setThemeId] = useState(() => getTheme(localStorage.getItem('theme') || 'texflow-dark').id);
  const theme = useMemo(() => getTheme(themeId), [themeId]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme.id;
    Object.entries(theme.colors).forEach(([key,value]) => { root.style.setProperty(`--tf-${key.replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`)}`, value); });
    const aliases:Record<string,string> = {background:'background',surface:'surface',surfaceElevated:'surface-elevated',surfaceSecondary:'surface-elevated',accent:'accent',accentHover:'accent-hover',accentSoft:'accent-soft',textPrimary:'text-primary',textSecondary:'text-secondary',textMuted:'text-muted',textDisabled:'text-disabled',border:'border',borderStrong:'border-strong',success:'success',warning:'warning',error:'error',info:'info'};
    Object.entries(aliases).forEach(([old,key]) => root.style.setProperty(`--color-${key}`, old === 'accentSoft' ? `${theme.colors.accent}26` : (theme.colors as any)[old]));
    localStorage.setItem('theme', theme.id);
  }, [theme]);
  return <ThemeContext.Provider value={{theme,setTheme:setThemeId}}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
