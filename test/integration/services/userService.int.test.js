const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Users = require('../../../models/user');
const { registerUser, getUserByUsername, deleteUserByUsername, loginUser, getUser } = require('../../../services/userService');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../../../utils/errors');

let mongoServer;

beforeAll(async() => {
  process.env.JWT_SECRET = 'your_jwt_secret_key';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async() => {
  await Users.deleteMany();
});

describe('User Service Integration Tests', () => {

  describe('🔹 registerUser()', () => {
    it('should successfully register a user', async() => {
      // Arrange
      const userData = { username: 'testuser', email: 'testuser@example.com', password: 'password123', role: 'registered_user' };

      // Act
      const result = await registerUser(userData.username, userData.email, userData.password);

      // Assert
      expect(result).toMatchObject({
        username: userData.username,
        email: userData.email,
        role: 'registered_user',
      });
      const userInDb = await Users.findOne({ username: userData.username });
      expect(userInDb).not.toBeNull();
    });

    it('should throw ValidationError if username or email is already taken', async() => {
      // Arrange
      const userData = { username: 'testuser', email: 'testuser@example.com', password: 'password123' };
      await registerUser(userData.username, userData.email, userData.password);

      // Act & Assert
      await expect(registerUser(userData.username, 'another@example.com', 'password123'))
        .rejects.toThrow(ValidationError);
      await expect(registerUser('anotheruser', userData.email, 'password123'))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('🔹 getUserByUsername()', () => {
    it('should return a user by username', async() => {
      // Arrange
      const userData = { username: 'testuser', email: 'testuser@example.com', password: 'password123' };
      await registerUser(userData.username, userData.email, userData.password);

      // Act
      const result = await getUserByUsername(userData.username);

      // Assert
      expect(result).toMatchObject({
        username: userData.username,
        email: userData.email,
      });
    });

    it('should throw NotFoundError if user does not exist', async() => {
      // Act & Assert
      await expect(getUserByUsername('nonexistentuser')).rejects.toThrow(NotFoundError);
    });
  });

  describe('🔹 deleteUserByUsername()', () => {
    it('should delete a user by username', async() => {
      // Arrange
      const userData = { username: 'testuser', email: 'testuser@example.com', password: 'password123' };
      await registerUser(userData.username, userData.email, userData.password);

      // Act
      await deleteUserByUsername(userData.username);

      // Assert
      const userInDb = await Users.findOne({ username: userData.username });
      expect(userInDb).toBeNull();
    });

    it('should throw NotFoundError if user does not exist', async() => {
      // Act & Assert
      await expect(deleteUserByUsername('nonexistentuser')).rejects.toThrow(NotFoundError);
    });
  });

  describe('🔹 loginUser()', () => {
    it('should log in a user with valid credentials', async() => {
      // Arrange
      const userData = { username: 'testuser', email: 'testuser@example.com', password: 'password123' };
      await registerUser(userData.username, userData.email, userData.password);

      // Act
      const result = await loginUser(userData.username, userData.password);

      // Assert
      expect(result).toHaveProperty('token');
      expect(result).toMatchObject({
        username: userData.username,
        email: userData.email,
        role: 'registered_user',
      });
    });

    it('should throw NotFoundError if username does not exist', async() => {
      // Act & Assert
      await expect(loginUser('nonexistentuser', 'password123')).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError if password is incorrect', async() => {
      // Arrange
      const userData = { username: 'testuser', email: 'testuser@example.com', password: 'password123' };
      await registerUser(userData.username, userData.email, userData.password);

      // Act & Assert
      await expect(loginUser(userData.username, 'wrongpassword')).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('🔹 getUser()', () => {
    it('should return user details by username', async() => {
      // Arrange
      const userData = { username: 'testuser', email: 'testuser@example.com', password: 'password123' };
      await registerUser(userData.username, userData.email, userData.password);

      // Act
      const result = await getUser(userData.username);

      // Assert
      expect(result).toMatchObject({
        username: userData.username,
        email: userData.email,
      });
    });

    it('should throw NotFoundError if user is not found', async() => {
      // Act & Assert
      await expect(getUser('nonexistentuser')).rejects.toThrow(NotFoundError);
    });
  });

});
