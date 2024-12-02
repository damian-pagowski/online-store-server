import http from "k6/http";
import { check } from "k6";

export const options = {
    stages: [
      { duration: "10s", target: 50 },
      { duration: "30s", target: 100 },
      { duration: "10s", target: 0 },
    ],
  };
  
  export default function () {
    const res = http.get("http://localhost:3030/products/categories");
    check(res, { "status is 200": (r) => r.status === 200 });
  }