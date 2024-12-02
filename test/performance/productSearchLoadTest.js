import http from "k6/http";
import { check } from "k6";

export const options = {
    stages: [
        { duration: "20s", target: 50 },
        { duration: "1m", target: 200 },
        { duration: "20s", target: 0 },
    ],
};

export default function () {
    const res = http.get("http://localhost:3030/products?category=games");
    check(res, { "status is 200": (r) => r.status === 200 });
}