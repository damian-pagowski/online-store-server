const { registerUserHandler, getUserHandler, deleteUserHandler, loginHandler } = require('../../../controllers/userController');
const { registerUser, getUserByUsername, deleteUserByUsername, loginUser } = require('../../../services/userService');
const { mockRequest, mockResponse } = require('../../testUtil');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../../../utils/errors');

jest.mock('../../../services/userService');

describe('User Controller Tests', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUserHandler', () => {
    it('should register a new user successfully', async() => {
      // Arrange
      const req = mockRequest({ body: { username: 'testuser', email: 'test@example.com', password: 'password123' } });
      const res = mockResponse();
      const mockResponseData = { username: 'testuser', email: 'test@example.com', token: 'testtoken', role: 'registered_user', 'message': 'User created successfully' };
      registerUser.mockResolvedValueOnce(mockResponseData);

      // Act
      await registerUserHandler(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponseData);
    });

    it('should handle validation errors', async() => {
      const req = mockRequest({ body: { username: 'testuser', email: 'invalidemail', password: 'pass' } });
      const res = mockResponse();
      const next = jest.fn();
      const error = new ValidationError('Validation failed');
      registerUser.mockRejectedValueOnce(error);

      await registerUserHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserHandler', () => {
    it('should get user successfully', async() => {
      const req = mockRequest({ currentUser: { username: 'testuser' } });
      const res = mockResponse();
      const next = jest.fn();

      const mockUser = { username: 'testuser', email: 'test@example.com', role: 'registered_user' };
      getUserByUsername.mockResolvedValueOnce(mockUser);

      await getUserHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle user not found error', async() => {
      const req = mockRequest({ currentUser: { username: 'nonexistentuser' } });
      const res = mockResponse();
      const next = jest.fn();

      const error = new NotFoundError('User not found');
      getUserByUsername.mockRejectedValueOnce(error);

      await getUserHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUserHandler', () => {
    it('should delete user successfully', async() => {
      const req = mockRequest({ currentUser: { username: 'testuser' } });
      const res = mockResponse();
      deleteUserByUsername.mockResolvedValueOnce(true);

      await deleteUserHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle user not found error', async() => {
      const req = mockRequest({ currentUser: { username: 'nonexistentuser' } });
      const res = mockResponse();
      const next = jest.fn();

      const error = new NotFoundError('User not found');
      deleteUserByUsername.mockRejectedValueOnce(error);

      await deleteUserHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(error);

    });
  });

  describe('loginHandler', () => {
    it('should login user successfully', async() => {
      const req = mockRequest({ body: { username: 'testuser', password: 'password123' } });
      const res = mockResponse();
      const mockResponseData = { username: 'testuser', email: 'test@example.com', token: 'testtoken', role: 'registered_user', 'message': 'Login successful' };
      loginUser.mockResolvedValueOnce(mockResponseData);

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponseData);
    });

    it('should handle invalid credentials', async() => {
      const req = mockRequest({ body: { username: 'testuser', password: 'wrongpassword' } });
      const res = mockResponse();
      const next = jest.fn();

      const error = new UnauthorizedError('Invalid credentials');
      loginUser.mockRejectedValueOnce(error);

      await loginHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(error);

    });
  });

});
