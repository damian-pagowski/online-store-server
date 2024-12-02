import http from "k6/http";
import { check } from "k6";

export const options = {
    stages: [
        { duration: "10s", target: 50 },
        { duration: "1m", target: 200 },
        { duration: "10s", target: 0 },
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
        Authorization: `Bearer ${token}`,
    };

    const res = http.get("http://localhost:3030/cart/defaultUser", { headers });

    check(res, {
        "status is 200": (r) => r.status === 200,
        "cart items present": (r) => Object.keys(r.json()).length > 0,
    });
}