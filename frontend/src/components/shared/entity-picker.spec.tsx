import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EntityPicker } from "./entity-picker";

const apiMocks = vi.hoisted(() => ({
  getProjects: vi.fn(),
  getUsers: vi.fn(),
}));

vi.mock("@/services/projects.api", () => ({
  projectsApi: { getAll: apiMocks.getProjects },
}));

vi.mock("@/services/users.api", () => ({
  usersApi: { getAll: apiMocks.getUsers },
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const meta = { page: 1, limit: 20, total: 1, totalPages: 1 };

describe("EntityPicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getProjects.mockResolvedValue({
      data: [
        {
          id: "project-1",
          name: "Client Portal",
          description: "Migration",
          isActive: true,
        },
      ],
      meta,
    });
    apiMocks.getUsers.mockResolvedValue({
      data: [
        { id: "member-1", name: "Asha Perera", isActive: true },
      ],
      meta,
    });
  });

  it("loads active projects, supports search, and reports the chosen value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <EntityPicker
        kind="project"
        value=""
        emptyLabel="No project selected"
        onChange={onChange}
      />,
    );

    await waitFor(() =>
      expect(apiMocks.getProjects).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
        isActive: true,
      }),
    );

    await user.click(screen.getByRole("button", { name: "Select project" }));
    await user.type(screen.getByLabelText("Search projects"), "client");
    await waitFor(() =>
      expect(apiMocks.getProjects).toHaveBeenLastCalledWith({
        page: 1,
        limit: 20,
        search: "client",
        isActive: true,
      }),
    );

    await user.click(screen.getByRole("button", { name: "Client Portal" }));
    expect(onChange).toHaveBeenCalledWith("project-1");
  });

  it("uses the member endpoint with the team-member role filter", async () => {
    const user = userEvent.setup();
    render(
      <EntityPicker
        kind="member"
        value=""
        emptyLabel="No member selected"
        onChange={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(apiMocks.getUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
        role: "TEAM_MEMBER",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Select member" }));
    expect(await screen.findByText("Asha Perera")).toBeInTheDocument();
  });

  it("renders the selected label after a controlled project selection", async () => {
    const user = userEvent.setup();

    function ControlledPicker() {
      const [value, setValue] = useState("");
      return (
        <EntityPicker
          kind="project"
          value={value}
          emptyLabel="No project selected"
          onChange={setValue}
        />
      );
    }

    render(<ControlledPicker />);
    await user.click(screen.getByRole("button", { name: "Select project" }));
    await user.click(await screen.findByRole("button", { name: "Client Portal" }));

    expect(screen.getByRole("button", { name: "Select project" })).toHaveTextContent(
      "Client Portal",
    );
  });
});
