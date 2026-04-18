export const DUPLICATE_CLINIC_NAME_MESSAGE =
  "En klinik med dette navn findes allerede. Tilføj evt din by til navnet for at gøre det unikt.";

export type SubmitClinicCreationRequestResult =
  | { success: true }
  | { error: string }
  | { fieldErrors: { clinic_name: string } };
