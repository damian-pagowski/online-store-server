
# Performance Testing with K6

This project includes a set of performance tests implemented using **K6**. These tests simulate various user scenarios and measure the system's performance under different loads. The tests are located in the `./test/performance` directory.

## Test Files

| Test File                    | Description                                           |
|------------------------------|-------------------------------------------------------|
| `cartAddItemTest.js`         | Simulates adding items to the cart.                   |
| `cartFetchTest.js`           | Simulates fetching the cart contents.                |
| `highConcurrencyTest.js`     | Tests high-concurrency scenarios with multiple users. |
| `productSearchLoadTest.js`   | Simulates searching for products under load.          |
| `productCategoriesLoadTest.js` | Simulates fetching product categories under load.     |
| `userRegistrationLoadTest.js` | Tests the user registration endpoint under load.      |

## Running the Tests

You can run the tests using K6 by passing `USERNAME` and `PASSWORD` as environment variables for authentication. Below are the steps to execute the tests:

### 1. Install K6
If you don't have K6 installed, you can download it from [K6's official website](https://k6.io/docs/getting-started/installation/).

### 2. Run a Specific Test
Use the following command to run a test, replacing `testfile.js` with the desired test file:

```bash
k6 run --env USERNAME=<your_username> --env PASSWORD=<your_password> ./test/performance/testfile.js
```

### 3. Example Command
To run the `cartAddItemTest.js` test:

```bash
k6 run --env USERNAME=myuser --env PASSWORD=mypassword ./test/performance/cartAddItemTest.js
```

### 4. Parameters Explanation
- `USERNAME` and `PASSWORD` are required to log in during the test setup phase. Ensure these credentials are valid for the application under test.
- The token retrieved during login will be used to authenticate subsequent requests.

### 5. Analyze Results
After running the tests, K6 provides detailed output metrics, including:
- **Request Latency**: Average, median, and percentiles for request response times.
- **Throughput**: Number of requests processed per second.
- **Errors**: Failed requests and their reasons.
- **Resource Usage**: Data sent and received during the test.

Use these metrics to identify bottlenecks, optimize endpoints, and ensure the application performs well under load.
