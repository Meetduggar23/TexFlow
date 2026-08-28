export type ThemeType = 'light' | 'dark' | 'high-contrast';
export interface ThemeTokens { background:string; backgroundSecondary:string; surface:string; surfaceElevated:string; surfaceHover:string; surfaceActive:string; textPrimary:string; textSecondary:string; textMuted:string; textDisabled:string; border:string; borderStrong:string; accent:string; accentHover:string; accentActive:string; success:string; warning:string; error:string; info:string; buttonPrimary:string; buttonSecondary:string; editorBackground:string; editorForeground:string; editorSelection:string; editorCursor:string; editorLineNumber:string; terminalBackground:string; terminalForeground:string; pdfWorkspaceBackground:string; }
export interface ThemeDefinition { id:string; name:string; type:ThemeType; colors:ThemeTokens; preview:string[]; }

const dark = (accent:string, bg:string, surface:string, text:string, muted:string, selection:string): ThemeTokens => ({ background:bg, backgroundSecondary:bg, surface, surfaceElevated:'#334756', surfaceHover:'#3D5063', surfaceActive:selection, textPrimary:text, textSecondary:'#D8E0E5', textMuted:muted, textDisabled:muted, border:'rgba(255,255,255,.12)', borderStrong:'rgba(255,255,255,.24)', accent, accentHover:accent, accentActive:accent, success:'#4ADE80', warning:'#FFB84D', error:'#FF5C5C', info:'#93C5FD', buttonPrimary:accent, buttonSecondary:surface, editorBackground:surface, editorForeground:text, editorSelection:selection, editorCursor:accent, editorLineNumber:muted, terminalBackground:bg, terminalForeground:text, pdfWorkspaceBackground:bg });
const light = (accent:string, bg:string, surface:string, elevated:string, text:string, muted:string): ThemeTokens => ({ background:bg, backgroundSecondary:'#F1F5F9', surface, surfaceElevated:elevated, surfaceHover:'#E2E8F0', surfaceActive:'#DBEAFE', textPrimary:text, textSecondary:'#334155', textMuted:muted, textDisabled:'#94A3B8', border:'#CBD5E1', borderStrong:'#94A3B8', accent, accentHover:accent, accentActive:accent, success:'#15803D', warning:'#A16207', error:'#B91C1C', info:'#0369A1', buttonPrimary:accent, buttonSecondary:surface, editorBackground:surface, editorForeground:text, editorSelection:'#BFDBFE', editorCursor:accent, editorLineNumber:muted, terminalBackground:surface, terminalForeground:text, pdfWorkspaceBackground:bg });
// Solarized Light uses a warm cream canvas and blue-grey Solarized base
// colors. Keep secondary/muted text dark enough for readable contrast.
const solarizedLight: ThemeTokens = {
  background: '#FDF6E3', backgroundSecondary: '#EEE8D5', surface: '#EEE8D5',
  surfaceElevated: '#E6DFC9', surfaceHover: '#D9D1B8', surfaceActive: '#D3E8F5',
  textPrimary: '#073642', textSecondary: '#586E75', textMuted: '#657B83', textDisabled: '#93A1A1',
  border: '#D3C7A5', borderStrong: '#B8A98A', accent: '#268BD2', accentHover: '#2078B8', accentActive: '#1B6CA8',
  success: '#2AA198', warning: '#B58900', error: '#DC322F', info: '#268BD2',
  buttonPrimary: '#268BD2', buttonSecondary: '#EEE8D5', editorBackground: '#FDF6E3',
  editorForeground: '#073642', editorSelection: '#D3E8F5', editorCursor: '#268BD2', editorLineNumber: '#657B83',
  terminalBackground: '#EEE8D5', terminalForeground: '#073642', pdfWorkspaceBackground: '#E6DFC9',
};
const highContrastLight: ThemeTokens = {
  background: '#FFFFFF', backgroundSecondary: '#F2F2F2', surface: '#FFFFFF', surfaceElevated: '#E6E6E6',
  surfaceHover: '#D9EAF7', surfaceActive: '#FFFF00', textPrimary: '#000000', textSecondary: '#111111',
  textMuted: '#333333', textDisabled: '#555555', border: '#000000', borderStrong: '#000000',
  accent: '#0000EE', accentHover: '#0000AA', accentActive: '#000088', success: '#006400', warning: '#7A4F00',
  error: '#A00000', info: '#0000EE', buttonPrimary: '#0000EE', buttonSecondary: '#FFFFFF',
  editorBackground: '#FFFFFF', editorForeground: '#000000', editorSelection: '#FFFF00', editorCursor: '#000000',
  editorLineNumber: '#333333', terminalBackground: '#FFFFFF', terminalForeground: '#000000', pdfWorkspaceBackground: '#F2F2F2',
};

const definitions: Array<[string,string,ThemeType,ThemeTokens]> = [
  ['texflow-dark','TexFlow Dark','dark',dark('#FF4C29','#082032','#2C394B','#FFFFFF','#9AA8B2','rgba(255,76,41,.22)')],
  ['light-2026','Light 2026','light',light('#2563EB','#F8FAFC','#FFFFFF','#F1F5F9','#0F172A','#64748B')],
  ['light-visual-studio','Light (Visual Studio)','light',light('#0067C5','#F3F3F3','#FFFFFF','#E5E5E5','#1F1F1F','#616161')],
  ['light-modern','Light Modern','light',light('#7C3AED','#FAFAFC','#FFFFFF','#F4F4F5','#18181B','#71717A')],
  ['light-plus','Light+','light',light('#007ACC','#FFFFFF','#FFFFFF','#F3F4F6','#111827','#6B7280')],
  ['quiet-light','Quiet Light','light',light('#B45309','#F7F7F4','#FFFFFF','#ECECE7','#383A42','#858585')],
  ['solarized-light','Solarized Light','light',solarizedLight],
  ['dark-2026','Dark 2026','dark',dark('#60A5FA','#111827','#1F2937','#F9FAFB','#9CA3AF','rgba(96,165,250,.25)')],
  ['abyss','Abyss','dark',dark('#38BDF8','#000C18','#071A2B','#E0F2FE','#6B8799','rgba(56,189,248,.2)')],
  ['dark-visual-studio','Dark (Visual Studio)','dark',dark('#4FC1FF','#1E1E1E','#252526','#D4D4D4','#858585','rgba(0,122,204,.3)')],
  ['dark-modern','Dark Modern','dark',dark('#A78BFA','#18181B','#27272A','#FAFAFA','#A1A1AA','rgba(167,139,250,.22)')],
  ['dark-plus','Dark+','dark',dark('#569CD6','#1E1E1E','#252526','#D4D4D4','#858585','rgba(86,156,214,.25)')],
  ['kimbie-dark','Kimbie Dark','dark',dark('#F28B50','#221A12','#362B22','#F8E7D0','#B7A58A','rgba(242,139,80,.2)')],
  ['monokai','Monokai','dark',dark('#F92672','#272822','#35362F','#F8F8F2','#A6A69C','rgba(249,38,114,.22)')],
  ['monokai-dimmed','Monokai Dimmed','dark',dark('#F92672','#1E1F1C','#2B2D29','#C5C8C6','#858780','rgba(249,38,114,.16)')],
  ['red','Red','dark',dark('#F87171','#211416','#352023','#FDECEC','#BCA3A5','rgba(248,113,113,.2)')],
  ['solarized-dark','Solarized Dark','dark',dark('#268BD2','#002B36','#073642','#839496','#657B83','rgba(38,139,210,.22)')],
  ['tomorrow-night-blue','Tomorrow Night Blue','dark',dark('#82AAFF','#002451','#00346E','#FFFFFF','#7285A0','rgba(130,170,255,.22)')],
  ['dark-high-contrast','Dark High Contrast','high-contrast',dark('#FFFFFF','#000000','#111111','#FFFFFF','#FFFFFF','#333333')],
  ['light-high-contrast','Light High Contrast','high-contrast',highContrastLight],
];
export const themes: ThemeDefinition[] = definitions.map(([id,name,type,colors]) => ({id,name,type,colors,preview:[colors.background,colors.surface,colors.accent]}));
export const themeGroups = [{label:'Light Themes', type:'light' as const},{label:'Dark Themes', type:'dark' as const},{label:'High Contrast Themes', type:'high-contrast' as const}];
export const getTheme = (id:string) => themes.find(t => t.id === id) || themes[0];
