import { Component } from "solid-js";
import { useActor } from "@xstate/solid";
import { Match, Switch } from "solid-js";
import { wizardMachine } from "./WizardMachine";
import BpmnForm, { getForm, hasErrors } from "../../components/Form";

const STORAGE_KEY = 'workflow-state';

interface WizardEvent {
  type: string;
  data?: Record<string, any>;
}

interface FormData {
  data: Record<string, any>;
  errors?: Record<string, any>;
}

const WizardComponent: Component = () => {
  const persistedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

  const [state, send, actor] = useActor(wizardMachine, {
    input: {},
    snapshot: persistedState,
  });

  const saveWorkflowState = () => {
    const persistedState = actor.getPersistedSnapshot();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  }

  const triggerEvent = (event: WizardEvent, clean: boolean = false) => {
    send(event);
    if (clean) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      saveWorkflowState();
    }
  }

  const onSubmit = (data: FormData, errors: Record<string, any>) => {
    if (!hasErrors(errors)) {
      triggerEvent({ type: "NEXT", data: data.data }, false);
    }
  };

  function FormButton(props: { label: string; action: () => void }) {
    return (
      <div class="fjs-container">
        <button type="submit" class="fjs-button" onClick={() => props.action()}>
          {props.label}
        </button>
      </div>
    );
  }

  const BackButton = () => {
    return (
      <FormButton label="Previous" action={() => triggerEvent({ type: "PREV" }, false)} />
    );
  };

  const SubmitButton = () => {
    return (
      <FormButton label="Submit" action={() => triggerEvent({ type: "SUBMIT" }, true)} />
    );
  };

  function Form(props: { schema?: any }) {
    const metadata: any = state.getMeta();
    const name = Object.keys(metadata)?.[0];
    const meta = metadata[name];
    const form = props.schema || meta?.form || (meta?.form_fields && getForm(meta));

    if (!form) {
      return <div>Internal error (incorrect form)</div>;
    }

    return (
      <>
        <BpmnForm
          schema={form || props.schema}
          data={state.context}
          onSubmit={onSubmit}
        />
      </>
    );
  }

  function Review() {
    return (
      <div>
        <h2>Review</h2>
        <p>Final step ! Congratulations !</p>
        <pre>
          {JSON.stringify(state.context, null, 4)}
        </pre>
        <SubmitButton />
        <BackButton />
      </div>
    );
  }

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
        <Match when={state.matches("step4")}>
          <Review/>
        </Match>
        <Match when={state.matches("complete")}>
          <div>
            <h2>Confirmation</h2>
            <p>Project has been successfully submitted</p>
          </div>
        </Match>
      </Switch>
    </div>
  );
};

export default WizardComponent;
