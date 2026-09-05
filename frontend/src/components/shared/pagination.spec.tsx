import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("does not render for a single page", () => {
    const { container } = render(
      <Pagination
        meta={{ page: 1, limit: 20, total: 1, totalPages: 1 }}
        onPage={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("disables boundary controls and requests the adjacent page", async () => {
    const user = userEvent.setup();
    const onPage = vi.fn();
    const { rerender } = render(
      <Pagination
        meta={{ page: 1, limit: 20, total: 41, totalPages: 3 }}
        onPage={onPage}
      />,
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPage).toHaveBeenCalledWith(2);

    rerender(
      <Pagination
        meta={{ page: 3, limit: 20, total: 41, totalPages: 3 }}
        onPage={onPage}
      />,
    );
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPage).toHaveBeenLastCalledWith(2);
  });
});
