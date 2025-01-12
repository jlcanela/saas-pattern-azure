import { Component } from "solid-js";
import { useActor } from "@xstate/solid";
import { Match, Switch } from "solid-js";
import { wizardMachine } from "./WizardMachine";
import BpmnForm, { getForm, hasErrors } from "../../components/Form";
import { Box, Button } from "@suid/material";
import Review from "./Review";
import Confirmation from "./Confirmation";
import { A } from "@solidjs/router";
import { ProjectRequest } from "@/common/model.ts";

type WizardEventType = "NEXT" | "PREV" | "SUBMIT";

interface WizardEvent {
  type: WizardEventType;
  data?: Partial<ProjectRequest>;
}

const STORAGE_KEY = "workflow-state";

interface FormData {
  data: Record<string, any>;
  errors?: Record<string, any>;
}

interface FormButtonProps {
  label: string;
  action: () => void;
  disabled?: boolean;
}

const FormButton: Component<FormButtonProps> = (props) => {
  return (
    <div class="fjs-container">
      <button
        type="submit"
        class="fjs-button"
        onClick={() => props.action()}
        disabled={props.disabled}
      >
        {props.label}
      </button>
    </div>
  );
};

const WizardComponent: Component = () => {
  const persistedState = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "null"
  );

  const [state, send, actor] = useActor(wizardMachine, {
    input: {},
    snapshot: persistedState,
  });

  const saveWorkflowState = () => {
    const persistedState = actor.getPersistedSnapshot();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  };

  const triggerEvent = (event: WizardEvent, clean: boolean = false) => {
    send(event);
    if (clean) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      saveWorkflowState();
    }
  };

  const onSubmit = (data: FormData, errors: Record<string, any>) => {
    if (!hasErrors(errors)) {
      triggerEvent({ type: "NEXT", data: data.data }, false);
    }
  };

  const BackButton = () => {
    return (
      <FormButton
        label="Previous"
        action={() => triggerEvent({ type: "PREV" }, false)}
      />
    );
  };

  const ErrorSubmittingProject = () => {
    localStorage.removeItem(STORAGE_KEY);
    return (
      <div style={{ color: "#ef4444", "margin-bottom": "1rem" }}>
        There is an error while submitting your project. Please try again.
        <pre>{JSON.stringify(actor.getPersistedSnapshot(), null, 4)}</pre>
        <br />
        <pre>{JSON.stringify(state, null, 4)}</pre>
        <BackButton />
      </div>
    );
  };

  const SubmitButton = () => {
    const isSubmitting = state.matches("submitting");

    return (
      <FormButton
        label={isSubmitting ? "Submitting..." : "Submit"}
        action={() => triggerEvent({ type: "SUBMIT" }, false)}
        disabled={isSubmitting}
      />
    );
  };

  function Form(props: { schema?: any }) {
    const metadata: any = state.getMeta();
    const name = Object.keys(metadata)?.[0];
    const meta = metadata[name];
    const form =
      props.schema || meta?.form || (meta?.form_fields && getForm(meta));

    if (!form) {
      return <div>Internal error (incorrect form)</div>;
    }

    return (
      <BpmnForm
        schema={form || props.schema}
        data={state.context}
        onSubmit={onSubmit}
      />
    );
  }

  const ConfirmationMessage: Component = () => {
    localStorage.removeItem(STORAGE_KEY);
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Confirmation
          title="Success"
          message="Your project has been created successfully"
        />
        <Button
          component={A}
          href="/"
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 4 }}
        >
          Go to Home
        </Button>
      </Box>
    );
  };

  return (
    <div>
      <Switch>
        <Match when={state.matches("step1")}>
          <Form />
        </Match>
        <Match when={state.matches("step2")}>
          <Form />
          <BackButton />
        </Match>
        <Match when={state.matches("step3")}>
          <Form />
          <BackButton />
        </Match>
        <Match when={state.matches("submitting")}>
          <ErrorSubmittingProject />
        </Match>
        <Match when={state.matches("step4")}>
          <Review state={state}>
            <SubmitButton />
            <BackButton />
          </Review>
        </Match>
        <Match when={state.matches("complete")}>
          <ConfirmationMessage />
        </Match>
      </Switch>
    </div>
  );
};

export default WizardComponent;
