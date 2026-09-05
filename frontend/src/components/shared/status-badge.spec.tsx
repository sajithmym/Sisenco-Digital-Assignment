import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it.each([
    ["DRAFT", "Draft"],
    ["SUBMITTED", "Submitted"],
    ["NEEDS_CORRECTION", "Needs Correction"],
    ["APPROVED", "Approved"],
    ["NOT_STARTED", "NOT_STARTED"],
  ])("renders %s with the readable fallback label", (status, label) => {
    render(<StatusBadge status={status} className="custom-class" />);
    expect(screen.getByText(label)).toHaveClass("custom-class");
  });
});
