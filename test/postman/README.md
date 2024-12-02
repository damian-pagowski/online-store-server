
# Postman Collection for API Testing

This project includes a Postman collection to test the API endpoints efficiently. Below are the instructions to install the required tools and run the collection.

## Installation

### Prerequisites
1. Install [Node.js](https://nodejs.org/).
2. Install Newman globally using npm:
   ```bash
   npm install -g newman
   ```

3. Ensure you have the required files:
   - `postman_collection.json` (Postman collection)
   - `env.json` (Postman environment file)

   These files are located in the `test/postman` directory.

## Running the Collection

To execute the Postman collection with Newman, use the following command:

```bash
newman run test/postman/postman_collection.json --environment test/postman/env.json
```

### Notes:
- The `env.json` file contains environment variables required for running the tests, such as `BASE_URL`, `USERNAME`, and `PASSWORD`.
- Ensure the API server is running before executing the collection.

## Output

Newman will output the test results directly to the console. If required, you can export the results to a file using additional Newman options.
