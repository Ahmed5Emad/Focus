import { vi } from "vitest";

export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: { full_name: "Test User" },
};

export const mockSession = {
  user: mockUser,
  access_token: "test-token",
  refresh_token: "test-refresh",
};

export function createMockAuthContext(overrides = {}) {
  return {
    session: mockSession,
    user: mockUser,
    isLoading: false,
    workspaces: [{ id: "test-ws", name: "Test Workspace", created_at: new Date().toISOString(), created_by: "test-user-id" }],
    currentWorkspaceId: "test-ws",
    setCurrentWorkspaceId: vi.fn(),
    refreshWorkspaces: vi.fn(),
    ...overrides,
  };
}
