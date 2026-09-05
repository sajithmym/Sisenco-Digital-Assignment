import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/services/auth.api", () => ({
  authApi: { login: mocks.login, register: mocks.register },
}));

import LoginPage from "./(auth)/login/page";
import RegisterPage from "./(auth)/register/page";

describe("authentication pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates login fields before contacting the API", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("signs in and routes each role to its configured home page", async () => {
    const user = userEvent.setup();
    mocks.login.mockResolvedValue({
      accessToken: "token",
      user: { id: "manager-1", role: "MANAGER" },
    });
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "manager@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() =>
      expect(mocks.login).toHaveBeenCalledWith({
        email: "manager@example.com",
        password: "password123",
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/manager/dashboard");
  });

  it("shows a safe login failure message from the API", async () => {
    const user = userEvent.setup();
    mocks.login.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "member@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("prevents registration when passwords differ", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Name"), "Asha Perera");
    await user.type(screen.getByLabelText("Email"), "asha@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "different-password");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it("submits registration without confirmation data and shows the approval state", async () => {
    const user = userEvent.setup();
    mocks.register.mockResolvedValue({ user: { email: "asha@example.com" } });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Name"), "Asha Perera");
    await user.type(screen.getByLabelText("Email"), "asha@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() =>
      expect(mocks.register).toHaveBeenCalledWith({
        name: "Asha Perera",
        email: "asha@example.com",
        password: "password123",
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Account awaiting activation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("asha@example.com")).toBeInTheDocument();
  });

  it("shows a server message when registration is rejected", async () => {
    const user = userEvent.setup();
    mocks.register.mockRejectedValue({
      response: { data: { message: "Email already registered" } },
    });
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Name"), "Asha Perera");
    await user.type(screen.getByLabelText("Email"), "asha@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText("Email already registered")).toBeInTheDocument();
  });
});
