import React from 'react';
import { OnboardingData } from '../../data/mockData';

export const FinalSetupForm: React.FC = () => {
  const { finalSetup } = OnboardingData;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
      <form className="space-y-6">
        <div className="space-y-2">
            <label className="font-bold text-xs text-slate-500 uppercase tracking-widest">{finalSetup.workspaceLabel}</label>
            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-cu-purple focus:border-cu-purple transition-all outline-none" placeholder="e.g. Creative Studio" type="text" />
        </div>
        <div className="space-y-2">
            <label className="font-bold text-xs text-slate-500 uppercase tracking-widest">{finalSetup.goalLabel}</label>
            <div className="grid grid-cols-3 gap-4">
                {finalSetup.goals.map((goal, index) => (
                    <label key={index} className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-transparent rounded-xl cursor-pointer hover:bg-slate-100 has-[:checked]:border-cu-purple has-[:checked]:bg-cu-purple/10">
                        <input className="hidden" name="goal" type="radio" value={goal.value} />
                        <span className="material-symbols-outlined text-2xl mb-2">{goal.icon}</span>
                        <span className="font-bold text-sm text-slate-900">{goal.label}</span>
                    </label>
                ))}
            </div>
        </div>
        <div className="flex items-center p-4 bg-cu-purple/10 border border-cu-purple/20 rounded-xl gap-4">
            <span className="material-symbols-outlined text-cu-purple">auto_awesome</span>
            <div className="flex-1">
                <p className="font-bold text-slate-900">{finalSetup.aiToggle.label}</p>
                <p className="text-xs text-slate-600">{finalSetup.aiToggle.subLabel}</p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
        </div>
        <button className="w-full bg-cu-purple hover:bg-cu-purple/90 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
            {finalSetup.primaryButton} <span className="material-symbols-outlined text-sm">rocket_launch</span>
        </button>
      </form>
    </div>
  );
};

export default FinalSetupForm;
