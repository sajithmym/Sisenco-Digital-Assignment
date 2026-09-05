import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReportContent, ReportHistory } from "./report-content";

describe("ReportContent", () => {
  it("renders report details, totals, and safely handles optional content", () => {
    render(
      <ReportContent
        content={{
          weekStart: "2026-08-31",
          weekEnd: "2026-09-06",
          projectName: "Client Portal",
          tasks: [
            {
              taskName: "Ship dashboard",
              priority: "HIGH",
              plannedPercentage: 80,
              actualPercentage: 100,
              status: "DONE",
              plannedMinutes: 90,
              actualMinutes: 75,
              deliverable: "Production link",
            },
          ],
          nextWeekTasks: [{ description: "Review metrics", sortOrder: 0 }],
          blockers: [{ description: "Awaiting sign-off", isKeyIssue: true, isResolved: false }],
          achievements: [{ description: "Dashboard released", isKeyAchievement: true }],
          workHours: [
            { type: "DEVELOPMENT", minutes: 75 },
            { type: "TESTING", minutes: 45 },
          ],
          notes: "Ship notes",
        } as any}
      />,
    );

    expect(screen.getByText("Client Portal")).toBeInTheDocument();
    expect(screen.getByText("Ship dashboard")).toBeInTheDocument();
    expect(screen.getAllByText("1h 15m")).toHaveLength(2);
    expect(screen.getByText("Total: 2h")).toBeInTheDocument();
    expect(screen.getByText(/^Key issue/)).toBeInTheDocument();
    expect(screen.getByText("Key achievement")).toBeInTheDocument();
    expect(screen.getByText("Ship notes")).toBeInTheDocument();
  });

  it("renders intentional empty states and version-specific reviews", () => {
    const { rerender } = render(
      <ReportContent content={{ weekStart: "", weekEnd: "" }} />,
    );
    expect(screen.getAllByText("None reported.")).toHaveLength(6);
    expect(
      screen.getByText(
        (_content, element) =>
          element?.tagName === "P" &&
          element.textContent?.startsWith("Date unavailable") &&
          element.textContent.endsWith("Date unavailable"),
      ),
    ).toBeInTheDocument();

    rerender(
      <ReportHistory
        report={{
          id: "report-1",
          latestVersionNumber: 2,
          versions: [
            {
              id: "version-2",
              versionNumber: 2,
              submittedAt: "2026-09-06T12:00:00Z",
              snapshotJson: { weekStart: "", weekEnd: "" },
            },
          ],
          reviews: [
            {
              id: "review-1",
              action: "APPROVED",
              comment: "Looks good",
              createdAt: "2026-09-07T12:00:00Z",
              reviewer: { id: "manager-1", name: "Mina" },
              reportVersionId: "version-2",
            },
          ],
        } as any}
      />,
    );
    expect(screen.getByText(/Version 2 \(latest submission\)/)).toBeInTheDocument();
    expect(screen.getAllByText(/Mina .+ Approved/)).toHaveLength(2);
    expect(screen.getAllByText("Looks good")).toHaveLength(2);
    expect(screen.getByText(/legacy snapshot/i)).toBeInTheDocument();
  });
});


