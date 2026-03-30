// Added: 2026-03-30 - Minimal Supabase mock factories for deterministic tests.
export interface MockUser {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
}

export function createMockAuthClient(user: MockUser | null) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user } }),
      exchangeCodeForSession: jest.fn(),
    },
    from: jest.fn(),
  };
}

export function createMockStaticClient<T>(data: T, error: Error | null = null) {
  return {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ data, error }),
    }),
  };
}
