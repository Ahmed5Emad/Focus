import React from 'react';
import { OnboardingData } from '../../data/mockData';

interface StatsProps {
  readonly className?: string;
}

export const Stats: React.FC<StatsProps> = ({ className = '' }) => {
  const { stats } = OnboardingData.welcome;

  return (
    <section className={`bg-slate-50 border-t border-slate-100 py-16 ${className}`}>
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <h3 className="text-3xl font-bold text-cu-purple">{stat.value}</h3>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
