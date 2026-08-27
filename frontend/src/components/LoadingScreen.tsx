import { useEffect, useState } from 'react';

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
        <img 
          src="/logo.png" 
          alt="TexFlow" 
          className="w-24 h-24 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'w-24 h-24 rounded-2xl flex items-center justify-center';
              fallback.style.background = 'linear-gradient(135deg, #F5AFAF, #e89595)';
              fallback.innerHTML = '<span class="text-texflow-900 font-bold text-4xl">T</span>';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
      
      <h1 className="text-3xl font-bold text-texflow-900 mb-2 tracking-tight">
        Tex<span className="gradient-text">Flow</span>
      </h1>
      <p className="text-texflow-600 text-sm mb-8">Collaborative LaTeX Writing Platform</p>
      
      <div className="loading-bar-container">
        <div className="loading-bar" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
      
      <p className="text-xs text-texflow-500 mt-4">Loading editor...</p>
    </div>
  );
}
