import { render, screen } from "@testing-library/react";
import Header from "../Header";

jest.mock("@/components/auth/UserMenu", () => ({
  UserMenu: () => <div>UserMenu mock</div>,
}));

jest.mock("@/app/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  }),
}));

describe("Header", () => {
  it("renders logo and navigation links", () => {
    render(<Header />);

    // Check logo link
    const logoLink = screen.getByRole("link", { name: "" });
    expect(logoLink).toHaveAttribute("href", "/");

    // Check navigation links
    expect(screen.getByText("Ordbog")).toBeInTheDocument();
    expect(screen.getByText("Værktøjer")).toBeInTheDocument();

    // Check navigation links have correct hrefs
    const ordbogLink = screen.getByText("Ordbog").closest("a");
    expect(ordbogLink).toHaveAttribute("href", "/ordbog");

    const toolsLink = screen.getByText("Værktøjer").closest("a");
    expect(toolsLink).toHaveAttribute("href", "/vaerktoejer");
  });
});
