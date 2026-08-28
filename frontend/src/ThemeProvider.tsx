import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getTheme, type ThemeDefinition } from './theme';
function toRgb(value: string) {
  const match = value.match(/^#([\da-f]{6})$/i);
  return match ? `${parseInt(match[1].slice(0, 2), 16)}, ${parseInt(match[1].slice(2, 4), 16)}, ${parseInt(match[1].slice(4, 6), 16)}` : '';
}
const ThemeContext = createContext<{theme:ThemeDefinition; setTheme:(id:string)=>void}>({theme:getTheme('texflow-dark'),setTheme:()=>{}});
export function ThemeProvider({children}:{children:ReactNode}) {
  const [themeId,setThemeId] = useState(() => getTheme(localStorage.getItem('theme') || 'texflow-dark').id);
  const theme = useMemo(() => getTheme(themeId), [themeId]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme.id;
    root.style.colorScheme = theme.type === 'light' ? 'light' : 'dark';
    Object.entries(theme.colors).forEach(([key,value]) => { root.style.setProperty(`--tf-${key.replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`)}`, value); });
    const aliases:Record<string,string> = {background:'background',surface:'surface',surfaceElevated:'surface-elevated',surfaceSecondary:'surface-elevated',accent:'accent',accentHover:'accent-hover',accentSoft:'accent-soft',textPrimary:'text-primary',textSecondary:'text-secondary',textMuted:'text-muted',textDisabled:'text-disabled',border:'border',borderStrong:'border-strong',success:'success',warning:'warning',error:'error',info:'info'};
    Object.entries(aliases).forEach(([old,key]) => root.style.setProperty(`--color-${key}`, old === 'accentSoft' ? `${theme.colors.accent}26` : (theme.colors as any)[old]));
    root.style.setProperty('--color-background-rgb', toRgb(theme.colors.background));
    root.style.setProperty('--color-accent-rgb', toRgb(theme.colors.accent));
    root.style.setProperty('--color-error-soft', `${theme.colors.error}18`);
    root.style.setProperty('--color-success-soft', `${theme.colors.success}18`);
    localStorage.setItem('theme', theme.id);
  }, [theme]);
  return <ThemeContext.Provider value={{theme,setTheme:setThemeId}}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
