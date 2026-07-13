import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders with default classes", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
    expect(container.firstChild).toHaveClass("rounded-md");
    expect(container.firstChild).toHaveClass("bg-slate-200");
  });

  it("accepts additional className", () => {
    const { container } = render(<Skeleton className="h-10 w-48" />);
    expect(container.firstChild).toHaveClass("h-10");
    expect(container.firstChild).toHaveClass("w-48");
  });
});
