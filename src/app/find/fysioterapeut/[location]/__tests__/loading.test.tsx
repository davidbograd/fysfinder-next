// Regression: location-page skeleton must follow the live header + list/map layout.
import { render } from "@testing-library/react";
import Loading from "../loading";

function findByClass(container: HTMLElement, className: string) {
  return Array.from(container.querySelectorAll<HTMLElement>("*")).find((el) =>
    el.className.split(" ").includes(className)
  );
}

describe("Location loading skeleton", () => {
  it("uses the full-width list/map grid instead of a narrow padded column", () => {
    const { container } = render(<Loading />);
    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper).toHaveClass("w-full");
    expect(wrapper.className.split(" ")).not.toContain("container");
    expect(wrapper.className).not.toMatch(/\bpx-4\b/);

    expect(findByClass(container, "max-w-[800px]")).toBeTruthy();
    expect(
      findByClass(container, "xl:grid-cols-[minmax(0,1fr)_420px]")
    ).toBeTruthy();
    expect(findByClass(container, "md:h-[520px]")).toBeTruthy();
  });
});
