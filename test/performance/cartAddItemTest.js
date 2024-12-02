import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 50 },
    // { duration: "1m", target: 200 },
    // { duration: "10s", target: 0 },
  ],
};

let token;

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
  token = loginRes.json("token");
  return { token };
}

export default function (data) {
  const { token } = data;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Add item to cart
  const url = "http://localhost:3030/cart/defaultUser";
  const payload = JSON.stringify({
    productId: Math.floor(Math.random() * 10) + 1,
    quantity: Math.floor(Math.random() * 5) + 1,
  });

  const res = http.post(url, payload, { headers });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "error not present": (r) => !r.json("error"),
  });
}