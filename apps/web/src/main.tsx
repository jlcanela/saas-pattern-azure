import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// base styles/variables for PatternFly-react
import "@patternfly/react-core/dist/styles/base.css";
// quick starts styles
import "@patternfly/quickstarts/dist/quickstarts.min.css";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { fetchProjects } from "./utils/fetchProjects";

// Create a new router instance
//const router = createRouter({ routeTree });
const router = createRouter({
  routeTree,
  context: {
    // Supply the fetchPosts function to the router context
    fetchProjects,
  },
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
