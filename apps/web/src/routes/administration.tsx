import { Content, PageSection } from "@patternfly/react-core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/administration")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageSection>
      <Content>
        <h1>Administration</h1>
      </Content>
    </PageSection>
  );
}
