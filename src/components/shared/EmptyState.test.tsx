import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";
import { ListChecks } from "lucide-react";
import { MemoryRouter } from "react-router-dom";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <MemoryRouter>
        <EmptyState
          icon={ListChecks}
          title="No items found"
          description="Nothing to see here yet."
        />
      </MemoryRouter>
    );

    expect(screen.getByText("No items found")).toBeInTheDocument();
    expect(screen.getByText("Nothing to see here yet.")).toBeInTheDocument();
  });

  it("renders action button with link", () => {
    render(
      <MemoryRouter>
        <EmptyState
          icon={ListChecks}
          title="Start your task list"
          description="Create your first task."
          action={{ label: "Create Task", href: "/tasks/new" }}
        />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: /create task/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/tasks/new");
  });
});
