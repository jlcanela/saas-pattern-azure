import Card from "@/components/Card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div>

      <h1>Dashboard</h1>
      <Card />
    </div>
  );
}
