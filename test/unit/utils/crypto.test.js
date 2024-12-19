const { hashPassword, verifyPassword } = require('../../../utils/crypto');

describe('Crypto Utility Functions', () => {
  
  it('should hash the password correctly', () => {
    const password = 'password123';
    const hash = hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash).toBeDefined();
  });

  it('should verify the password correctly', () => {
    const password = 'password123';
    const hash = hashPassword(password);
    const isValid = verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should return false for incorrect password', () => {
    const password = 'password123';
    const hash = hashPassword(password);
    const isValid = verifyPassword('wrongpassword', hash);
    expect(isValid).toBe(false);
  });

});