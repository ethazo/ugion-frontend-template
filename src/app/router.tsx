import { createRouter } from "@tanstack/react-router";

import { queryClient } from "@/lib/query-client";

// Generated Routes
import { routeTree } from "../routeTree.gen";

// Create a new router instance
export const router = createRouter({
  routeTree,
  context: {
    queryClient
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}