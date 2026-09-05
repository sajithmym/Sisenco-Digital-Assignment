import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WeeklyReportForm } from "./weekly-report-form";

vi.mock("@/components/shared/entity-picker", () => ({
  EntityPicker: ({
    value,
    emptyLabel,
    onChange,
  }: {
    value: string;
    emptyLabel: string;
    onChange: (value: string) => void;
  }) => (
    <button type="button" onClick={() => onChange("project-1")}>
      {value || emptyLabel}
    </button>
  ),
}));

vi.mock("@/components/ui/date-picker", () => ({
  DatePicker: ({ onChange }: { onChange: (date?: Date) => void }) => (
    <button
      type="button"
      onClick={() => onChange(new Date("2026-09-06T12:00:00"))}
    >
      Choose reporting week
    </button>
  ),
}));

describe("WeeklyReportForm", () => {
  function renderForm(overrides?: Partial<React.ComponentProps<typeof WeeklyReportForm>>) {
    const props = {
      submitLabel: "Save draft",
      saving: false,
      onSave: vi.fn().mockResolvedValue(undefined),
      onCancel: vi.fn(),
      ...overrides,
    };

    render(<WeeklyReportForm {...props} />);
    return props;
  }

  it("updates the reporting week and runs the cancel handler", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderForm();

    expect(screen.getByText("No project selected")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Choose reporting week" }));

    expect(screen.getByLabelText("Week end (Sunday)")).toHaveValue("2026-09-06");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("submits a valid report with normalized project data", async () => {
    const user = userEvent.setup();
    const { onSave } = renderForm();

    await user.click(screen.getByRole("button", { name: "No project selected" }));
    await user.click(screen.getAllByRole("button", { name: "Add" })[0]);
    await user.type(screen.getByPlaceholderText("Task name"), "Publish dashboard");
    await user.type(
      screen.getByPlaceholderText("Add context, decisions, risks, or relevant links."),
      "Release notes are ready.",
    );
    await user.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: "project-1",
          notes: "Release notes are ready.",
          tasks: [
            expect.objectContaining({
              taskName: "Publish dashboard",
              priority: "MEDIUM",
              status: "TODO",
              plannedMinutes: 0,
              actualMinutes: 0,
            }),
          ],
        }),
      ),
    );
  });

  it("keeps only the most recently selected blocker as the key issue", async () => {
    const user = userEvent.setup();
    renderForm();

    const addButtons = screen.getAllByRole("button", { name: "Add" });
    await user.click(addButtons[2]);
    await user.click(addButtons[2]);

    const keyIssueBoxes = screen.getAllByRole("checkbox", {
      name: "Key issue",
    });
    await user.click(keyIssueBoxes[0]);
    await user.click(keyIssueBoxes[1]);

    expect(keyIssueBoxes[0]).not.toBeChecked();
    expect(keyIssueBoxes[1]).toBeChecked();
  });

  it("disables actions and makes the in-progress state clear while saving", () => {
    renderForm({ saving: true });

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
