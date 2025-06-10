import Card from "@/components/Card";
import { Badge } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
<div>

        <h1>Dashboard</h1>
         <Badge color="blue">Badge</Badge>;
        <Card/>
</div>
  );
}
