import React from "react";
import { Zap } from "lucide-react";
import { OnboardingData } from "../../data/mockData";

interface DeepWorkHeroProps {
  readonly className?: string;
}

export const DeepWorkHero: React.FC<DeepWorkHeroProps> = ({
  className = "",
}) => {
  const { deepWork } = OnboardingData;

  return (
    <div className={`lg:col-span-5 space-y-6 ${className}`}>
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-cu-purple/10 text-cu-purple border border-cu-purple/20 rounded-full mb-2">
          <Zap className="w-5 h-5 fill-current" />
          <span className="font-bold text-xs uppercase tracking-widest">
            <span className="font-bold text-xs text-cu-purple tracking-widest uppercase">
              {deepWork.badge}
            </span>
          </span>
        </div>
        <h1 className="text-6xl font-bold text-slate-950 tracking-tight">
          {deepWork.title}
        </h1>
        <p className="text-lg text-slate-600 max-w-md">
          {deepWork.description}
        </p>
      </div>
      <div className="space-y-6 pt-4">
        {deepWork.features.map((feature, index) => (
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

export default DeepWorkHero;
