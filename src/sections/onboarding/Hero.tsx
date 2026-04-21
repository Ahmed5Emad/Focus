import React from "react";
import { OnboardingData } from "../../data/mockData";

interface HeroProps {
  readonly className?: string;
}
export const Hero: React.FC<HeroProps> = ({ className = "" }) => {
  const { hero } = OnboardingData.welcome;

  return (
    <section
      className={`lg:col-span-6 flex flex-col items-start gap-6 text-left ${className}`}
    >
      <div className="inline-flex items-center gap-2 px-4 py-1 bg-cu-purple/10 text-cu-purple border border-cu-purple/20 rounded-full mb-2">
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          bolt
        </span>
        <span className="font-bold text-xs uppercase tracking-widest">
          {hero.badge}
        </span>
      </div>
      <h1 className="text-6xl font-bold text-slate-950 tracking-tight leading-[1.1]">
        Zero distractions.
        <br />
        <span className="text-cu-purple">Pure flow.</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
        {hero.description}
      </p>
      <div className="flex items-center gap-4 mt-8 opacity-90">
        <div className="flex -space-x-3">
          <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200"></div>
          <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300"></div>
          <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-400"></div>
        </div>
        <div className="text-sm font-medium">
          <p className="text-slate-900">Trusted by 12,000+ engineers</p>
          <div className="flex items-center gap-1 text-cu-green">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="text-slate-600">4.9 rating on App Store</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
