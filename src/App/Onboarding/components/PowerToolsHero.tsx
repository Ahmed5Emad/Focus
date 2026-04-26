import React from 'react';
import { OnboardingData } from '../../../data/mockData';

interface PowerToolsHeroProps {
  readonly className?: string;
}

export const PowerToolsHero: React.FC<PowerToolsHeroProps> = ({ className = '' }) => {
  const { powerTools } = OnboardingData;

  return (
    <div className={`lg:col-span-5 flex flex-col gap-6 ${className}`}>
      <div className="space-y-2">
        <span className="font-bold text-xs text-cu-purple tracking-widest uppercase">{powerTools.badge}</span>
        <h1 className="text-5xl font-bold text-slate-950 tracking-tight">{powerTools.title}</h1>
        <p className="text-lg text-slate-600 max-w-md leading-relaxed">{powerTools.description}</p>
      </div>
      <div className="space-y-6 pt-4">
        {powerTools.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-cu-purple/10 flex items-center justify-center shrink-0 text-cu-purple">
              <feature.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PowerToolsHero;
