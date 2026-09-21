import {
  findMissingFields,
  hasFieldErrors,
} from "@/lib/calculators/required-fields";

describe("findMissingFields", () => {
  it("builds the message from the field's own label", () => {
    const errors = findMissingFields([
      { key: "age", label: "Alder", value: "" },
      { key: "motherHeightCm", label: "Mors højde", value: "" },
    ]);

    expect(errors).toEqual({
      age: "Udfyld alder",
      motherHeightCm: "Udfyld mors højde",
    });
  });

  it("asks visitors to choose rather than fill on choice fields", () => {
    const errors = findMissingFields([
      { key: "gender", label: "Køn", value: "", choice: true },
    ]);

    expect(errors.gender).toBe("Vælg køn");
  });

  it("treats whitespace as an empty field", () => {
    const errors = findMissingFields([
      { key: "weightKg", label: "Vægt", value: "   " },
    ]);

    expect(errors.weightKg).toBe("Udfyld vægt");
  });

  it("reports nothing when every field is answered", () => {
    const errors = findMissingFields([
      { key: "gender", label: "Køn", value: "male", choice: true },
      { key: "weightKg", label: "Vægt", value: "82,5" },
    ]);

    expect(errors).toEqual({});
    expect(hasFieldErrors(errors)).toBe(false);
  });
});
