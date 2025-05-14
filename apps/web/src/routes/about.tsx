import {
  PageSection,
} from "@patternfly/react-core";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <PageSection>
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>{" "}
    </PageSection>
  );
}
