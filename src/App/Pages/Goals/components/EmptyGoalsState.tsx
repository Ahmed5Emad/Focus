import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateGoalModal } from "./CreateGoalModal";
import { EmptyState } from "@/components/shared/EmptyState";

interface EmptyGoalsStateProps {
  onCreateGoal: (newGoal: { title: string; category: string; due_date: string | null; task_id: string | null }) => Promise<void>;
  tasks: { id: string; title: string }[];
}

export function EmptyGoalsState({ onCreateGoal, tasks }: EmptyGoalsStateProps) {
  return (
    <EmptyState
      icon={Target}
      title="Your journey starts here"
      description="You haven't set any goals yet. Define your first objective and start tracking your progress towards success."
      blurColor="#6b38d4"
      iconColor="#6b38d4"
      iconGradientFrom="#f5f3ff"
      iconGradientTo="#eff6ff"
    >
      <CreateGoalModal onCreate={onCreateGoal} tasks={tasks}>
        <Button className="btn-primary">
          Create Your First Goal
        </Button>
      </CreateGoalModal>
    </EmptyState>
  );
}
