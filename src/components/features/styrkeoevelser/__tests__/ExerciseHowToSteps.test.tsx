import { render, screen } from "@testing-library/react";
import { ExerciseHowToSteps } from "@/components/features/styrkeoevelser/ExerciseHowToSteps";
import type { ExerciseHowTo } from "@/lib/styrkeoevelser";

const howTo: ExerciseHowTo = {
  heading: "Squat - Sådan gør du",
  steps: ["Stil dig op med fødderne i skulderbreddes afstand.", "Sænk dig ned."],
  note: { label: "Antal gentagelser", text: "3-4 sæt af 8-12 gentagelser." },
};

describe("ExerciseHowToSteps", () => {
  it("renders the steps and the repetitions note", () => {
    render(<ExerciseHowToSteps howTo={howTo} />);

    expect(
      screen.getByRole("heading", { name: "Squat - Sådan gør du", level: 2 })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText(/3-4 sæt af 8-12 gentagelser/)).toBeInTheDocument();
  });

  it("puts media beside the steps under the shared how-to heading", () => {
    render(
      <ExerciseHowToSteps
        howTo={howTo}
        media={<div data-testid="demo-video">video</div>}
      />
    );

    const section = screen.getByRole("region", {
      name: "Squat - Sådan gør du",
    });
    const video = screen.getByTestId("demo-video");

    expect(section).toContainElement(video);
    // The video must not introduce a competing heading of its own.
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("puts the media before the steps so it leads on collapsed layouts", () => {
    render(
      <ExerciseHowToSteps
        howTo={howTo}
        media={<div data-testid="demo-video">video</div>}
      />
    );

    const video = screen.getByTestId("demo-video");
    const firstStep = screen.getAllByRole("listitem")[0];

    expect(
      video.compareDocumentPosition(firstStep) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("keeps the steps full width when there is no media", () => {
    const { container } = render(<ExerciseHowToSteps howTo={howTo} />);

    expect(container.querySelector(".lg\\:grid-cols-2")).toBeNull();
  });
});
