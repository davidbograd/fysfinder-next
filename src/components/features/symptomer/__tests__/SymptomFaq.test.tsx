// Added: 2026-09-07 - Verifies symptom FAQ answers are in the rendered HTML without any client-side interaction, and that inline links stay crawlable.

import { render, screen } from "@testing-library/react";
import { SymptomFaq } from "../SymptomFaq";

const section = {
  heading: "Ofte stillede spørgsmål om knæsmerter",
  items: [
    {
      question: "Hvorfor har jeg ondt i knæet?",
      answer: ["Der kan være mange forskellige årsager til knæsmerter."],
    },
    {
      question: "Hvilke øvelser er gode mod knæsmerter?",
      answer: [
        "Den relevante træning afhænger af problemstillingen.",
        "Se [øvelser for knæet](/styrkeoevelser/knae).",
      ],
    },
  ],
};

describe("SymptomFaq", () => {
  it("renders every question as a heading", () => {
    render(<SymptomFaq section={section} />);

    expect(
      screen.getByRole("heading", { name: "Hvorfor har jeg ondt i knæet?" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Hvilke øvelser er gode mod knæsmerter?",
      })
    ).toBeInTheDocument();
  });

  it("keeps every answer in the DOM while collapsed, so it stays indexable", () => {
    render(<SymptomFaq section={section} />);

    expect(
      screen.getByText(/mange forskellige årsager til knæsmerter/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/afhænger af problemstillingen/)
    ).toBeInTheDocument();
  });

  it("renders inline answer links as real anchors", () => {
    render(<SymptomFaq section={section} />);

    expect(
      screen.getByRole("link", { name: "øvelser for knæet" })
    ).toHaveAttribute("href", "/styrkeoevelser/knae");
  });
});
