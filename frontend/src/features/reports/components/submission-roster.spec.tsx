import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubmissionRoster } from "./submission-roster";

const apiMocks = vi.hoisted(() => ({ getRoster: vi.fn() }));

vi.mock("@/services/manager.api", () => ({
  managerApi: { getRoster: apiMocks.getRoster },
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode;
    onValueChange: (value: string) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onValueChange("SUBMITTED")}>
        Show submitted
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button type="button" {...props}>{children}</button>
  ),
  SelectValue: () => <span>All</span>,
}));

const meta = { page: 1, limit: 20, total: 2, totalPages: 1 };

describe("SubmissionRoster", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getRoster.mockResolvedValue({
      data: [
        {
          userId: "member-1",
          name: "Asha Perera",
          weekStart: "2026-08-31",
          deadline: "2026-09-06T23:59:59Z",
          status: "DRAFT",
          reportId: null,
          submittedAt: null,
          submitted: false,
          late: false,
        },
        {
          userId: "member-2",
          name: "Nimal Silva",
          weekStart: "2026-08-31",
          deadline: "2026-09-06T23:59:59Z",
          status: "SUBMITTED",
          reportId: "report-2",
          submittedAt: "2026-09-06T12:00:00Z",
          submitted: true,
          late: false,
        },
      ],
      meta,
    });
  });

  it("loads the roster and distinguishes private drafts, submitted reports, and timing", async () => {
    render(<SubmissionRoster weekStart="2026-08-31" weekEnd="2026-09-06" />);

    await waitFor(() =>
      expect(apiMocks.getRoster).toHaveBeenCalledWith({
        weekStart: "2026-08-31",
        weekEnd: "2026-09-06",
        page: 1,
        limit: 20,
        status: undefined,
      }),
    );

    expect(await screen.findByText("Asha Perera")).toBeInTheDocument();
    expect(screen.getByText("Private draft")).toBeInTheDocument();
    expect(screen.getByText("On time")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review report" })).toHaveAttribute(
      "href",
      "/manager/reports/report-2",
    );
  });

  it("reloads from the first page when the status filter changes", async () => {
    const user = userEvent.setup();
    render(<SubmissionRoster weekStart="2026-08-31" weekEnd="2026-09-06" />);

    await screen.findByText("Asha Perera");
    await user.click(screen.getByRole("button", { name: "Show submitted" }));

    await waitFor(() =>
      expect(apiMocks.getRoster).toHaveBeenLastCalledWith({
        weekStart: "2026-08-31",
        weekEnd: "2026-09-06",
        page: 1,
        limit: 20,
        status: "SUBMITTED",
      }),
    );
  });

  it("shows the retryable error state when the roster request fails", async () => {
    apiMocks.getRoster.mockRejectedValueOnce(new Error("Roster unavailable"));
    const user = userEvent.setup();
    render(<SubmissionRoster weekStart="2026-08-31" weekEnd="2026-09-06" />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Roster unavailable");
    await user.click(screen.getByRole("button", { name: "Try Again" }));
    await waitFor(() => expect(apiMocks.getRoster).toHaveBeenCalledTimes(2));
  });
});
