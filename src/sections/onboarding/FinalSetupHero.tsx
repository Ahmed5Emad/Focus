import React from 'react';
import { OnboardingData } from '../../data/mockData';

interface FinalSetupHeroProps {
  readonly className?: string;
}

export const FinalSetupHero: React.FC<FinalSetupHeroProps> = ({ className = '' }) => {
  const { finalSetup } = OnboardingData;

  return (
    <div className={`lg:col-span-5 flex flex-col gap-6 ${className}`}>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-cu-purple/10 text-cu-purple border border-cu-purple/20 rounded-full self-start">
        <span className="font-bold text-xs uppercase tracking-widest">{finalSetup.badge}</span>
      </div>
      <h1 className="text-5xl font-bold text-slate-950 tracking-tight">{finalSetup.title}</h1>
      <p className="text-lg text-slate-600 max-w-md leading-relaxed">{finalSetup.description}</p>
      
      {/* Placeholder for workspace image - Increased height */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl mt-4 border border-slate-200 h-[350px]">
        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
            <span className="material-symbols-outlined text-8xl opacity-30">desktop_windows</span>
        </div>
        {/* Decorative elements to fill the panel */}
        <div className="absolute top-4 left-4 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-cu-red opacity-80"></div>
            <div className="w-3 h-3 rounded-full bg-cu-yellow opacity-80"></div>
            <div className="w-3 h-3 rounded-full bg-cu-green opacity-80"></div>
        </div>
      </div>
    </div>
  );
};

export default FinalSetupHero;
