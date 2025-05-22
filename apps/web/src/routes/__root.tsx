import Page from "@/components/Page";
import {
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
  queryClient: unknown;
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
