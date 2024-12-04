# Online Store Server

Online store API developed with Node.js + Express.  
Integrated with MongoDB for product and user data storage.

## Features

- **Swagger Integration**: Interactive API documentation.
- **Testing**: Comprehensive integration tests using Jest, Supertest, and Postman collections.
- **Security**: Rate limiting, CORS configuration, and Helmet for secure headers.
- **Modular Architecture**: Clean separation of concerns with models, controllers, and routes.

---

## Installation

Ensure the following environment variables are set in your `.env` file:

```bash
MONGOLAB_URI=
SERVER_PORT=
CLIENT_URL=
SESSION_SECRET=
```

### Install Dependencies

```bash
npm install
```

---

## Usage

### Production
```bash
npm start
```

### Development
```bash
npm run dev
```

### API Documentation
The API is documented with **Swagger**.  

**Swagger UI URL:**  
`http://localhost:<SERVER_PORT>/api-docs`

---

## Testing

### Integration Tests

Integration tests are implemented using:
- **Jest**: For robust testing.
- **Supertest**: For HTTP assertions.
- **Postman**: A collection is available for testing API functionality.

#### Running Tests

**Jest and Supertest**:
```bash
npm test
```

**Postman Tests**:
1. Install Newman:
   ```bash
   npm install -g newman
   ```
2. Run Postman collection:
   ```bash
   newman run test/postman/postman_collection.json --env-var BASE_URL=http://localhost:3030
   ```

#### Seed Data for Tests
Use the provided seed script to populate test data:
```bash
node test/postman/seed.js
```

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss your ideas.  
Ensure new features or changes are tested adequately.

---

## License

[MIT](https://choosealicense.com/licenses/mit/)
