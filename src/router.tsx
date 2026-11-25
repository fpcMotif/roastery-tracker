import { createRouter } from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  if (typeof convexUrl !== "string" || convexUrl === "") throw new Error("VITE_CONVEX_URL is not set");
  const convex = new ConvexReactClient(convexUrl);

  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    Wrap: ({ children }) => <ConvexProvider client={convex}>{children}</ConvexProvider>,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
