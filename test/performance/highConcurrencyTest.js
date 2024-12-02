export const options = {
    stages: [
      { duration: "30s", target: 100 },
      { duration: "30s", target: 500 },
      { duration: "30s", target: 1000 },
      { duration: "30s", target: 0 },
    ],
  };
  
  export default function () {
    const endpoints = [
      "http://localhost:3030/products",
      "http://localhost:3030/products/categories",
      "http://localhost:3030/cart/testuser123",
    ];
    const url = endpoints[Math.floor(Math.random() * endpoints.length)];
    const res = http.get(url);
    check(res, { "status is 200": (r) => r.status === 200 });
  }