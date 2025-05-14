import { Content, PageSection } from "@patternfly/react-core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PageSection>
      <Content>
        <h1>Dashboard</h1>
      </Content>
    </PageSection>
  );
}
