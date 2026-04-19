import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpForm } from "../SignUpForm";

const mockSignUp = jest.fn();
const mockCreateUserProfile = jest.fn();
const mockToast = jest.fn();

jest.mock("@/app/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
    },
  }),
}));

jest.mock("@/app/actions/auth", () => ({
  createUserProfile: (...args: unknown[]) => mockCreateUserProfile(...args),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: (...args: unknown[]) => mockToast(...args) }),
}));

describe("SignUpForm", () => {
  beforeEach(() => {
    mockSignUp.mockReset();
    mockCreateUserProfile.mockReset();
    mockToast.mockReset();
  });

  it("creates profile even when signup requires email verification", async () => {
    const user = userEvent.setup();

    mockSignUp.mockResolvedValue({
      data: {
        user: { id: "user-123" },
        session: null,
      },
      error: null,
    });
    mockCreateUserProfile.mockResolvedValue({ success: true });

    render(<SignUpForm />);

    await user.type(screen.getByLabelText("Fulde navn"), "Test Person");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Adgangskode"), "password123");
    await user.click(screen.getByRole("button", { name: "Opret konto" }));

    await waitFor(() => {
      expect(mockCreateUserProfile).toHaveBeenCalledWith({
        id: "user-123",
        email: "test@example.com",
        full_name: "Test Person",
      });
    });

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        options: expect.objectContaining({
          emailRedirectTo: expect.stringMatching(/\/auth\/callback$/),
        }),
      })
    );

    expect(global.__TEST_ROUTER_MOCKS__.push).toHaveBeenCalledWith(
      "/auth/verify?email=test%40example.com"
    );
  });
});
