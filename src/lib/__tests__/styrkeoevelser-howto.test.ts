import { parseExerciseHowTo, getExercise } from "@/lib/styrkeoevelser";

const SAMPLE = `Intro paragraph about the exercise.

## Lunges - Sådan gør du

1. First step.
2. Second step.
3. Third step.

**Antal gentagelser:** 3 sæt af 10-12 gentagelser.

## Teknik

Some technique text.`;

describe("parseExerciseHowTo", () => {
  it("extracts the lead, the how-to steps, the note, and leaves the rest", () => {
    const { lead, howTo, rest } = parseExerciseHowTo(SAMPLE);

    expect(lead).toBe("Intro paragraph about the exercise.");
    expect(howTo).not.toBeNull();
    expect(howTo?.heading).toBe("Lunges - Sådan gør du");
    expect(howTo?.steps).toEqual(["First step.", "Second step.", "Third step."]);
    expect(howTo?.note).toEqual({
      label: "Antal gentagelser",
      text: "3 sæt af 10-12 gentagelser.",
    });

    // The how-to section and lead are removed; only the remaining article stays.
    expect(rest).toContain("## Teknik");
    expect(rest).toContain("Some technique text.");
    expect(rest).not.toContain("Sådan gør du");
    expect(rest).not.toContain("First step.");
    expect(rest).not.toContain("Intro paragraph");
  });

  it("returns no howTo and keeps content when there is no Sådan gør du section", () => {
    const { howTo, rest } = parseExerciseHowTo("Just a paragraph.\n\n## Andet\n\nText.");
    expect(howTo).toBeNull();
    expect(rest).toContain("## Andet");
  });

  it("parses how-to steps for a real ingested exercise", () => {
    const ex = getExercise("lunges");
    const { howTo } = parseExerciseHowTo(ex.content);
    expect(howTo).not.toBeNull();
    expect(howTo!.steps.length).toBeGreaterThanOrEqual(5);
  });
});
