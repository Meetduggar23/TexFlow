import { useEffect, useState } from 'react';

interface BrandLogoProps {
  alt?: string;
  className?: string;
}

function getDarkMode() {
  const theme = document.documentElement.dataset.theme;
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function BrandLogo({ alt = 'TexFlow', className }: BrandLogoProps) {
  const [isDark, setIsDark] = useState(getDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setIsDark(getDarkMode());
    const observer = new MutationObserver(update);

    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    media.addEventListener('change', update);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', update);
    };
  }, []);

  return <img src={isDark ? '/logo.png' : '/logo2.png'} alt={alt} className={className} />;
}
