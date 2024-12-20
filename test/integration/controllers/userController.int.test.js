const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../../app');
const Users = require('../../../models/user');
const { generateToken } = require('../../../utils/token');
const { hashPassword } = require('../../../utils/crypto');

let mongoServer;

beforeAll(async() => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async() => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async() => {
  await Users.deleteMany();
});

describe('🔹 User Controller Integration Tests', () => {

  describe('🔹 POST /users (registerUserHandler)', () => {
    it('should register a new user successfully', async() => {
      // Arrange
      const newUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .send(newUser);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('username', newUser.username);
      expect(response.body).toHaveProperty('email', newUser.email);
      expect(response.body).toHaveProperty('token');
    });

    it('should fail if username or email is already taken', async() => {
      // Arrange
      const existingUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      };
      await Users.create(existingUser);

      // Act
      const response = await request(app)
        .post('/users')
        .send(existingUser);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('🔹 GET /users (getUserHandler)', () => {
    it('should return the user details for authenticated user', async() => {
      // Arrange
      const user = { username: 'testuser', email: 'testuser@example.com', password: 'password123' };
      const newUser = await Users.create(user);
      const token = generateToken(newUser);

      // Act
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', user.username);
      expect(response.body).toHaveProperty('email', user.email);
    });

    it('should return 401 if no token is provided', async() => {
      // Act
      const response = await request(app).get('/users');

      // Assert
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Forbidden: Insufficient permissions');
    });

    it('should return 404 if user is not found', async() => {
      // Arrange
      const token = generateToken({ username: 'nonexistentuser' });

      // Act
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('🔹 DELETE /users (deleteUserHandler)', () => {
    it('should delete the authenticated user', async() => {
      // Arrange
      const user = { username: 'testuser', email: 'testuser@example.com', password: 'password123' };
      const newUser = await Users.create(user);
      const token = generateToken(newUser);

      // Act
      const response = await request(app)
        .delete('/users')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(204);
      const deletedUser = await Users.findOne({ username: user.username });
      expect(deletedUser).toBeNull();
    });

    it('should return 404 if user does not exist', async() => {
      // Arrange
      const token = generateToken({ username: 'nonexistentuser' });

      // Act
      const response = await request(app)
        .delete('/users')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('🔹 POST /users/login (loginHandler)', () => {
    it('should log in successfully and return a token', async() => {
      // Arrange
      const user = { username: 'testuser', email: 'testuser@example.com', password: 'password123' };
      const hashedPassword = hashPassword(user.password); // Properly hash the password
      await Users.create({ ...user, password: hashedPassword }); // Store hashed password

      // Act
      const response = await request(app)
        .post('/users/login')
        .set('Content-Type', 'application/json')
        .send({ username: 'testuser', password: 'password123' }); // Send plain text

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
    });

    it('should fail login if username does not exist', async() => {
      // Act
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'nonexistentuser', password: 'password123' });

      // Assert
      expect(response.status).toBe(404);
    });

    it('should fail login if password is incorrect', async() => {
      // Arrange
      const user = { username: 'testuser', email: 'testuser@example.com', password: 'password123' };
      await Users.create({ ...user, password: 'hashedpassword' });

      // Act
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      // Assert
      expect(response.status).toBe(401);
    });
  });

});
