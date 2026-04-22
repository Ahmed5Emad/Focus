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
      
      {/* Placeholder for workspace image */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl mt-4">
        <div className="w-full aspect-video bg-slate-200 flex items-center justify-center text-slate-400">
            Workspace Preview
        </div>
      </div>
    </div>
  );
};

export default FinalSetupHero;
