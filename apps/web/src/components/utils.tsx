import { Effect, Logger, pipe } from "effect";
import type { FC } from "react";

// 1. Fix component type definition
export type FormExample = FC & {
  title: string;
  route: string;
};


// 3. Enforce JSX.Element return type for Form component
export const makeFormExample = (
  Form: FC<Record<string, never>>, // More precise than 'object'
  { route, title }: { title: string; route: string }
): FormExample => {
//   const FormExample: FC = () => (
//     <Container mt="lg" maw={500}>
//       <Title order={2}>{title}</Title>
//       <Form />
//     </Container>
//   );
  const FormExample: FC = () => ( 
      <Form />
  );

  return Object.assign(FormExample, { title, route });
};

// 4. Keep existing Effect functions unchanged
export const simulateSubmit = (values: unknown) =>
  pipe(
    Effect.log("submitting", { values }),
    Effect.andThen(Effect.sleep(1000)),
    Effect.provide(Logger.pretty),
    Effect.runPromise
  );

export const reportError = (error: unknown) =>
  pipe(
    Effect.log("failed to submit", { error }),
    Effect.provide(Logger.pretty),
    Effect.runPromise
  );
