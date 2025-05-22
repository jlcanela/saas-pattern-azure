import { Form } from "@/components/Form";
import { Content, PageSection } from "@patternfly/react-core";

import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";

interface User {
  firstName: string;
  lastName: string;
  age: number;
}
const defaultUser: User = { firstName: "", lastName: "", age: 0 };

const User = Schema.Struct({
  firstName: Schema.String.pipe(
    Schema.minLength(3),
    Schema.annotations({
      message: () => "[Effect/Schema] You must have a length of at least 3",
    })
  ),
  lastName: Schema.String.pipe(
    Schema.minLength(5),
    Schema.annotations({
      message: () => "[Effect/Schema] You must have a length of at least 5",
    })
  ),
  age: Schema.Int.pipe(
    Schema.greaterThan(0),
    Schema.annotations({
      message: () => "[Effect/Schema] must be greater than 0",
    })
  ),
});

export const Route = createFileRoute("/form")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageSection>
      <Content>
        <h1>Dashboard</h1>
      </Content>
      <Content>
        <Form schema={User} defaultValues={defaultUser} />
      </Content>
    </PageSection>
  );
}
