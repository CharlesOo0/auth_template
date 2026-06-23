import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    // Auth
    route("auth", "routes/auth/index.tsx", [
        route("login", "routes/auth/login.tsx"),
        route("register", "routes/auth/register.tsx")
    ]),
] satisfies RouteConfig;
