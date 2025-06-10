import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/administration")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h1>Administration</h1>
    </div>
  );
}
