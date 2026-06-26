export function createMockClerkService() {
  return {
    verifyToken: jest.fn(),
    getUser: jest.fn(),
    syncUserWithData: jest.fn(),
    signInternalToken: jest.fn(),
    verifyPassword: jest.fn(),
    createUser: jest.fn(),
    revokeSession: jest.fn(),
    createSignInToken: jest.fn(),
  };
}
