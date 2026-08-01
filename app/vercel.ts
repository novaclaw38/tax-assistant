import { routes, type VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "vite",
  rewrites: [routes.rewrite("/(.*)", "/index.html")],
};
