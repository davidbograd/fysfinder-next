// Approved extra merges from the needs-review walkthrough.
// Updated: includes Hovedstadens Sportsklinik as keeper over Frederiksberg Sportsklinik.

export interface ApprovedExtraMerge {
  keeperId: string;
  droppedId: string;
  note: string;
}

export const APPROVED_EXTRA_MERGES: ApprovedExtraMerge[] = [
  {
    keeperId: "2fde5643-599e-4f2a-b502-f8a58fc93c79",
    droppedId: "d779897d-803a-4fec-8327-eccc41c020e9",
    note: "Klinik for Fysioterapi Fredericia at Danmarksgade 46",
  },
  {
    keeperId: "2fde5643-599e-4f2a-b502-f8a58fc93c79",
    droppedId: "3cc3af8a-fb6c-4c2b-a6d3-a4ca22e060c7",
    note: "Junk clinic row named b",
  },
  {
    keeperId: "b1f2dff5-94dd-442d-a5df-a47a62729d9a",
    droppedId: "f582bcb0-fa86-41d5-a573-bef0936a917a",
    note: "Børkop Fysioterapi at Lien 3",
  },
  {
    keeperId: "1006c68a-ecdd-47ef-8d5d-4f1147ca93c3",
    droppedId: "d657829d-0369-4a45-8678-51d0b8fa4d1f",
    note: "Hovedstadens Sportsklinik keeps that name",
  },
  {
    keeperId: "86e74d0d-b0d0-4918-b09a-182aeaf75e7e",
    droppedId: "7c96f030-7c0d-4ea7-b9ff-578106d75112",
    note: "Aalestrup Fysioterapi vs Thisted copy",
  },
  {
    keeperId: "8aa82786-d037-4d86-8240-aff0b0394d89",
    droppedId: "45431a88-0b11-4ccd-a899-0c6114cf9f12",
    note: "Aaløkken Fysioterapi at Thorslundsvej 2B",
  },
];
