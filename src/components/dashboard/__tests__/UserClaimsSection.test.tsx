import { render, screen } from "@testing-library/react";
import { UserClaimsSection } from "@/components/dashboard/UserClaimsSection";

describe("UserClaimsSection", () => {
  it("does not render rejected clinic creation requests", () => {
    render(
      <UserClaimsSection
        claims={[]}
        creationRequests={[
          {
            id: "request-pending",
            clinic_name: "Pending Klinik",
            address: "Testvej 1",
            postal_code: "6200",
            city_name: "Aabenraa",
            status: "pending",
            created_at: "2026-04-10T10:00:00.000Z",
            reviewed_at: null,
            admin_notes: null,
          },
          {
            id: "request-rejected",
            clinic_name: "Rejected Klinik",
            address: "Testvej 2",
            postal_code: "6230",
            city_name: "Rødekro",
            status: "rejected",
            created_at: "2026-04-11T10:00:00.000Z",
            reviewed_at: "2026-04-12T10:00:00.000Z",
            admin_notes: "Mangler dokumentation",
          },
        ]}
      />
    );

    expect(screen.getByText("Pending Klinik")).toBeInTheDocument();
    expect(screen.queryByText("Rejected Klinik")).not.toBeInTheDocument();
    expect(screen.queryByText("Mangler dokumentation")).not.toBeInTheDocument();
  });
});
