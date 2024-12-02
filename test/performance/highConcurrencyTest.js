import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 100 }, 
    { duration: "30s", target: 0 },  
  ],
};

// Setup phase: Log in and get the token
export function setup() {
  const username = __ENV.USERNAME || "defaultUser";
  const password = __ENV.PASSWORD || "defaultPassword";

  const loginRes = http.post("http://localhost:3030/users/login", JSON.stringify({
    username,
    password,
  }), {
    headers: { "Content-Type": "application/json" },
  });

  check(loginRes, { "login successful": (r) => r.status === 200 });

  const token = loginRes.json("token");

  return { token };
}

// Main test
export default function (data) {
  const token = data.token;

  const endpoints = [
    { url: "http://localhost:3030/products", requiresAuth: false },
    { url: "http://localhost:3030/products/categories", requiresAuth: false },
    { url: "http://localhost:3030/cart", requiresAuth: true },
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const headers = endpoint.requiresAuth
    ? { Authorization: `Bearer ${token}` }
    : {};

  const res = http.get(endpoint.url, { headers });

  check(res, { "status is 200": (r) => r.status === 200 });
}
