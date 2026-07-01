import { Layout } from "lucide-react";
import { CreateProjectModal } from "./CreateProjectModal";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

interface EmptyProjectsStateProps {
  onCreateProject: (newProject: { title: string; description: string; category: string }) => Promise<void>;
}

export function EmptyProjectsState({ onCreateProject }: EmptyProjectsStateProps) {
  return (
    <EmptyState
      icon={Layout}
      title="Build something amazing"
      description="You haven't created any projects yet. Start a new initiative to organize your tasks and achieve your goals."
      blurColor="#7b68ee"
      iconGradientFrom="#f5f3ff"
      iconGradientTo="#ede9fe"
    >
      <CreateProjectModal onCreate={onCreateProject}>
        <Button className="btn-primary w-fit">
          Create Your First Project
        </Button>
      </CreateProjectModal>
    </EmptyState>
  );
}
