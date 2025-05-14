import Page from "@/components/Page";
import type { fetchProjects } from "@/utils/fetchProjects";
import {
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
  fetchProjects: typeof fetchProjects;
}>()({
  component: () => (
    <>
      <Page>
        <Outlet />
      </Page>
      <TanStackRouterDevtools />
    </>
  ),
});
