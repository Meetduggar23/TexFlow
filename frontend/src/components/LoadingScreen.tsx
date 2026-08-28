import { useEffect, useState } from 'react';
import BrandLogo from './BrandLogo';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`loading-screen transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="loading-logo mb-6">
        <BrandLogo className="w-24 h-24 object-contain" />
      </div>
      
      <h1 className="text-3xl font-bold text-texflow-900 mb-2 tracking-tight">
        <span className="tf-brand"><span className="tf-brand-tex">Tex</span><span className="tf-brand-flow">Flow</span></span>
      </h1>
      <p className="text-texflow-600 text-sm mb-8">Collaborative LaTeX Writing Platform</p>
      
      <div className="loading-bar-container">
        <div className="loading-bar" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
      
      <p className="text-xs text-texflow-500 mt-4">Loading editor...</p>
    </div>
  );
}
