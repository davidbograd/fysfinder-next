import { render, screen } from "@testing-library/react";
import { RelatedContentSection } from "@/components/features/blog-og-ordbog/RelatedContentSection";

describe("RelatedContentSection", () => {
  it("renders nothing when there are no links", () => {
    const { container } = render(<RelatedContentSection links={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders Se også links for curated related content", () => {
    render(
      <RelatedContentSection
        links={[
          { href: "/styrkeoevelser/skulder", title: "Skulderøvelser" },
          { href: "/ordbog/skuldersmerter", title: "Skuldersmerter" },
        ]}
      />
    );

    expect(
      screen.getByRole("navigation", { name: "Se også" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Se også" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Skulderøvelser" })
    ).toHaveAttribute("href", "/styrkeoevelser/skulder");
    expect(
      screen.getByRole("link", { name: "Skuldersmerter" })
    ).toHaveAttribute("href", "/ordbog/skuldersmerter");
  });
});
