const { generateToken, verifyToken } = require('../../../utils/token');

describe('Token Utility Functions', () => {
  const user = { username: 'testuser', email: 'test@example.com', role: 'registered_user' };

  beforeAll(() => {
    process.env.JWT_SECRET = 'your_jwt_secret_key';
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it('should generate a token', () => {
    const token = generateToken(user);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should verify a valid token', () => {
    const token = generateToken(user);
    const decoded = verifyToken(token);
    expect(decoded).toHaveProperty('username', user.username);
    expect(decoded).toHaveProperty('role', user.role);
  });

  it('should throw an error for an invalid token', () => {
    expect(() => verifyToken('invalidtoken')).toThrow('Invalid or expired token');
  });
});
