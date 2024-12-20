const { registerUser, getUserByUsername, deleteUserByUsername, loginUser, getUser } = require('../../../services/userService');
const Users = require('../../../models/user');
const { ValidationError, NotFoundError, UnauthorizedError, DatabaseError } = require('../../../utils/errors');
const { hashPassword, verifyPassword } = require('../../../utils/crypto');
const { generateToken } = require('../../../utils/token');

jest.mock('../../../models/user');
jest.mock('../../../utils/crypto');
jest.mock('../../../utils/token');

describe('User Service', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async() => {
      // Arrange
      const username = 'testuser';
      const email = 'testuser@example.com';
      const password = 'password123';

      Users.findOne.mockResolvedValueOnce(null);
      hashPassword.mockReturnValueOnce('hashedpassword');
      const newUserMock = {
        username,
        email,
        role: 'registered_user',
        save: jest.fn().mockResolvedValueOnce(true),
      };
      Users.mockImplementation(() => newUserMock);
      generateToken.mockReturnValueOnce('testtoken');

      // Act
      const result = await registerUser(username, email, password);

      // Assert
      expect(result).toEqual({
        username,
        email,
        token: 'testtoken',
        role: 'registered_user',
      });

      expect(Users.findOne).toHaveBeenCalledWith({ $or: [{ username }, { email }] });
      expect(newUserMock.save).toHaveBeenCalled();
    });

    it('should throw a ValidationError if username or email already exists', async() => {
      Users.findOne.mockResolvedValueOnce({ username: 'testuser' });

      await expect(registerUser('testuser', 'testuser@example.com', 'password123'))
        .rejects.toThrow(ValidationError);
    });

    it('should throw a DatabaseError if an unexpected error occurs', async() => {
      Users.findOne.mockRejectedValueOnce(new Error('Database is down'));

      await expect(registerUser('testuser', 'testuser@example.com', 'password123'))
        .rejects.toThrow(DatabaseError);
    });
  });

  describe('getUserByUsername', () => {
    it('should return user details successfully', async() => {
      const mockUser = { username: 'testuser', email: 'testuser@example.com' };
      Users.findOne.mockResolvedValueOnce(mockUser);

      const result = await getUserByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(Users.findOne).toHaveBeenCalledWith({ username: 'testuser' }, { _id: 0, __v: 0, password: 0 });
    });

    it('should throw a NotFoundError if user does not exist', async() => {
      Users.findOne.mockResolvedValueOnce(null);

      await expect(getUserByUsername('unknownuser')).rejects.toThrow(NotFoundError);
    });

    it('should throw a DatabaseError if an unexpected error occurs', async() => {
      Users.findOne.mockRejectedValueOnce(new Error('Database is down'));

      await expect(getUserByUsername('testuser')).rejects.toThrow(DatabaseError);
    });
  });

  describe('deleteUserByUsername', () => {
    it('should delete user successfully', async() => {
      Users.findOneAndDelete.mockResolvedValueOnce(true);

      const result = await deleteUserByUsername('testuser');

      expect(result).toBeTruthy();
      expect(Users.findOneAndDelete).toHaveBeenCalledWith({ username: 'testuser' });
    });

    it('should throw a NotFoundError if user does not exist', async() => {
      Users.findOneAndDelete.mockResolvedValueOnce(null);

      await expect(deleteUserByUsername('unknownuser')).rejects.toThrow(NotFoundError);
    });

    it('should throw a DatabaseError if an unexpected error occurs', async() => {
      Users.findOneAndDelete.mockRejectedValueOnce(new Error('Database is down'));

      await expect(deleteUserByUsername('testuser')).rejects.toThrow(DatabaseError);
    });
  });

  describe('loginUser', () => {
    it('should log in a user successfully', async() => {
      const mockUser = { username: 'testuser', password: 'hashedpassword', email: 'testuser@example.com', role: 'registered_user' };
      Users.findOne.mockResolvedValueOnce(mockUser);
      verifyPassword.mockReturnValueOnce(true);
      generateToken.mockReturnValueOnce('testtoken');

      const result = await loginUser('testuser', 'password123');

      expect(result).toEqual({
        username: 'testuser',
        email: 'testuser@example.com',
        token: 'testtoken',
        role: 'registered_user',
      });
    });

    it('should throw an NotFoundError if user is not found', async() => {
      Users.findOne.mockResolvedValueOnce(null);

      await expect(loginUser('unknownuser', 'password123')).rejects.toThrow(NotFoundError);
    });

    it('should throw an UnauthorizedError if password is incorrect', async() => {
      const mockUser = { username: 'testuser', password: 'hashedpassword' };
      Users.findOne.mockResolvedValueOnce(mockUser);
      verifyPassword.mockReturnValueOnce(false);

      await expect(loginUser('testuser', 'wrongpassword')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw a DatabaseError if an unexpected error occurs', async() => {
      Users.findOne.mockRejectedValueOnce(new Error('Database is down'));

      await expect(loginUser('testuser', 'password123')).rejects.toThrow(DatabaseError);
    });
  });

  describe('getUser', () => {
    it('should return user details successfully', async() => {
      const mockUser = { username: 'testuser', email: 'testuser@example.com' };
      Users.findOne.mockResolvedValueOnce(mockUser);

      const result = await getUser('testuser');

      expect(result).toEqual(mockUser);
      expect(Users.findOne).toHaveBeenCalledWith({ username: 'testuser' }, { _id: 0, __v: 0, password: 0 });
    });

    it('should throw a NotFoundError if user does not exist', async() => {
      Users.findOne.mockResolvedValueOnce(null);

      await expect(getUser('unknownuser')).rejects.toThrow(NotFoundError);
    });

    it('should throw a DatabaseError if an unexpected error occurs', async() => {
      Users.findOne.mockRejectedValueOnce(new Error('Database is down'));

      await expect(getUser('testuser')).rejects.toThrow(DatabaseError);
    });
  });

});
