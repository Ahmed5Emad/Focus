import React, { useState } from "react";
import { Sparkles, Rocket, Loader2 } from "lucide-react";
import { OnboardingData } from "../../../data/mockData";
import { useNavigate } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const FinalSetupForm: React.FC = () => {
  const { finalSetup } = OnboardingData;
  const navigate = useNavigate();
  const { refreshWorkspaces } = useAuth();
  const supabase = createClient();

  const [workspaceName, setWorkspaceName] = useState("");
  const [goal, setGoal] = useState(finalSetup.goals[0].value);
  const [enableAi, setEnableAi] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Insert workspace
      const { error: workspaceError } = await supabase
        .from("workspaces")
        .insert({ name: workspaceName });

      if (workspaceError) throw workspaceError;

      // 2. Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { primary_goal: goal, enable_ai: enableAi },
      });

      if (userError) throw userError;

      // 3. Refresh workspaces
      await refreshWorkspaces();

      // 4. Navigate
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during setup:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-lg border border-slate-100 h-[600px] flex flex-col">
      <form className="space-y-8 flex-grow flex flex-col" onSubmit={handleSubmit}>
        <div className="pb-4">
          <label className="font-bold text-xs text-slate-500 pb-2 uppercase tracking-widest">
            {finalSetup.workspaceLabel}
          </label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl mt-2 p-6 focus:ring-2 focus:ring-cu-purple focus:border-cu-purple transition-all outline-none"
            placeholder="e.g. Creative Studio"
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 grow">
          <label className="font-bold text-xs text-slate-500 uppercase pb-2 tracking-widest">
            {finalSetup.goalLabel}
          </label>
          <div className="grid grid-cols-3 gap-4 h-32">
            {finalSetup.goals.map((g, index) => (
              <label
                key={index}
                className="flex flex-col items-center mt-2 justify-center p-10 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-cu-purple/50 transition-all active:scale-95 has-[:checked]:border-cu-purple has-[:checked]:bg-cu-purple/5 has-[:checked]:shadow-inner"
              >
                <input
                  className="hidden"
                  name="goal"
                  type="radio"
                  value={g.value}
                  checked={goal === g.value}
                  onChange={() => setGoal(g.value)}
                />
                <g.icon className="w-10 h-10 mb-3 text-slate-700" />
                <span className="font-bold text-sm text-slate-900">
                  {g.label}
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
          <input
            type="checkbox"
            className="toggle"
            checked={enableAi}
            onChange={(e) => setEnableAi(e.target.checked)}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-cu-purple hover:bg-cu-purple/90 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {finalSetup.primaryButton} <Rocket className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FinalSetupForm;
