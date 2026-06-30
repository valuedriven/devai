export interface MockUser {
  id: string;
  publicMetadata: { roles: string[] };
  emailAddresses: { emailAddress: string }[];
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

const defaultUsers: Record<string, MockUser> = {
  'admin-id': {
    id: 'admin-id',
    publicMetadata: { roles: ['admin'] },
    emailAddresses: [{ emailAddress: 'admin@test.com' }],
    firstName: 'Admin',
    lastName: 'User',
    imageUrl: 'https://example.com/admin.png',
  },
  'customer-id': {
    id: 'customer-id',
    publicMetadata: { roles: ['customer'] },
    emailAddresses: [{ emailAddress: 'customer@test.com' }],
    firstName: 'Customer',
    lastName: 'User',
  },
  'other-id': {
    id: 'other-id',
    publicMetadata: { roles: ['customer'] },
    emailAddresses: [{ emailAddress: 'other@test.com' }],
  },
  'user-id': {
    id: 'user-id',
    publicMetadata: { roles: [] },
    emailAddresses: [{ emailAddress: 'user@test.com' }],
  },
};

const tokenToUserId: Record<string, string> = {
  'admin-token': 'admin-id',
  'customer-token': 'customer-id',
  'other-customer-token': 'other-id',
  'user-token': 'user-id',
};

export function createMockClerkService(
  users?: Record<string, MockUser>,
  tokenMap?: Record<string, string>,
) {
  const resolvedUsers = users || defaultUsers;
  const resolvedTokenMap = tokenMap || tokenToUserId;

  return {
    verifyToken: jest.fn().mockImplementation((token: string) => {
      const userId = resolvedTokenMap[token];
      if (!userId) throw new Error('Invalid token');
      return { sub: userId };
    }),
    getUser: jest.fn().mockImplementation((id: string) => {
      return resolvedUsers[id] || null;
    }),
    revokeSession: jest.fn().mockResolvedValue(true),
    signInternalToken: jest.fn().mockReturnValue('mock-internal-token'),
    verifyPassword: jest.fn().mockImplementation((email: string) => ({
      id: 'auth-test-user-id',
      emailAddresses: [{ emailAddress: email }],
      firstName: 'Test',
      lastName: 'User',
      imageUrl: null,
    })),
    createUser: jest
      .fn()
      .mockImplementation(
        (data: {
          email: string;
          password?: string;
          firstName?: string;
          lastName?: string;
          role?: string;
        }) => ({
          id: 'auth-test-user-id',
          emailAddresses: [{ emailAddress: data.email }],
          firstName: data.firstName || 'Test',
          lastName: data.lastName || 'User',
          publicMetadata: { roles: [data.role || 'customer'] },
          imageUrl: null,
        }),
      ),
    createSignInToken: jest.fn().mockResolvedValue('mock-signin-token'),
    syncUserWithData: jest.fn().mockResolvedValue(null),
  };
}

export const adminAuthHeader = { Authorization: 'Bearer admin-token' };
export const adminToken = 'admin-token';
export const customerToken = 'customer-token';

export function customerAuthHeader(
  token = 'customer-token',
): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
