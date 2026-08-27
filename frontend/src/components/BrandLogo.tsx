import { useTheme } from '../ThemeProvider';

interface BrandLogoProps {
  alt?: string;
  className?: string;
}

/** Parse a hex color string to RGB components */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
}

/** Compute relative luminance (WCAG 2.0) */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export default function BrandLogo({ alt = 'TexFlow', className }: BrandLogoProps) {
  const { theme } = useTheme();
  const bgColor = theme.colors.background;
  const rgb = hexToRgb(bgColor);
  const isLight = rgb ? relativeLuminance(rgb.r, rgb.g, rgb.b) > 0.5 : false;

  return (
    <img
      src="/logo.png"
      alt={alt}
      className={className}
      style={isLight ? { filter: 'invert(1)' } : undefined}
    />
  );
}
