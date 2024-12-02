import http from "k6/http";
import { check } from "k6";

export const options = {
    stages: [
        { duration: "30s", target: 100 },
        { duration: "1m", target: 100 },
        { duration: "30s", target: 0 },
    ],
};

export default function () {
    const payload = JSON.stringify({
        username: `user${__ITER}`,
        email: `user${__ITER}@test.com`,
        password: "password123",
    });

    const res = http.post("http://localhost:3030/users", payload, {
        headers: { "Content-Type": "application/json" },
    });

    check(res, { "status is 201": (r) => r.status === 201 });
}