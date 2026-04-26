import React from "react";
import { Sparkles, Rocket } from "lucide-react";
import { OnboardingData } from "../../../data/mockData";

export const FinalSetupForm: React.FC = () => {
  const { finalSetup } = OnboardingData;

  return (
    <div className="bg-white p-10 rounded-2xl shadow-lg border border-slate-100 h-[600px] flex flex-col">
      <form className="space-y-8 flex-grow flex flex-col">
        <div className="pb-4">
          <label className="font-bold text-xs text-slate-500 pb-2 uppercase tracking-widest">
            {finalSetup.workspaceLabel}
          </label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl mt-2 p-6 focus:ring-2 focus:ring-cu-purple focus:border-cu-purple transition-all outline-none"
            placeholder="e.g. Creative Studio"
            type="text"
          />
        </div>
        <div className="space-y-2 grow">
          <label className="font-bold text-xs text-slate-500 uppercase pb-2 tracking-widest">
            {finalSetup.goalLabel}
          </label>
          <div className="grid grid-cols-3 gap-4 h-32">
            {finalSetup.goals.map((goal, index) => (
              <label
                key={index}
                className="flex flex-col items-center mt-2 justify-center p-10 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-cu-purple/50 transition-all active:scale-95 has-[:checked]:border-cu-purple has-[:checked]:bg-cu-purple/5 has-[:checked]:shadow-inner"
              >
                <input
                  className="hidden"
                  name="goal"
                  type="radio"
                  value={goal.value}
                />
                <goal.icon className="w-10 h-10 mb-3 text-slate-700" />
                <span className="font-bold text-sm text-slate-900">
                  {goal.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center p-4 bg-cu-purple/10 border border-cu-purple/20 rounded-xl gap-4 mt-auto">
          <Sparkles className="text-cu-purple w-6 h-6" />
          <div className="flex-1">
            <p className="font-bold text-slate-900">
              {finalSetup.aiToggle.label}
            </p>
            <p className="text-xs text-slate-600">
              {finalSetup.aiToggle.subLabel}
            </p>
          </div>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
        <button className="w-full bg-cu-purple hover:bg-cu-purple/90 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
          {finalSetup.primaryButton}{" "}
          <Rocket className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default FinalSetupForm;
