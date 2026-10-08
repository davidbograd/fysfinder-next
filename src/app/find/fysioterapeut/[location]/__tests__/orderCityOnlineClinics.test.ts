import { orderCityOnlineClinics } from "../fetch-location-data";

describe("orderCityOnlineClinics", () => {
  it("lists the city's online clinics first, then the rest of Denmark without duplicates", () => {
    const national = [
      { clinics_id: "copenhagen-1" },
      { clinics_id: "aarhus-1" },
      { clinics_id: "odense-1" },
      { clinics_id: "aarhus-2" },
    ];
    const local = national.filter((c) => c.clinics_id.startsWith("aarhus"));

    expect(
      orderCityOnlineClinics(local, national).map((c) => c.clinics_id)
    ).toEqual(["aarhus-1", "aarhus-2", "copenhagen-1", "odense-1"]);
  });

  it("falls back to all online clinics when the city has none", () => {
    const national = [{ clinics_id: "a" }, { clinics_id: "b" }];
    expect(orderCityOnlineClinics([], national)).toEqual(national);
  });
});
