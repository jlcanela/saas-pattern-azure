import { useActor } from "@xstate/solid";
import { machine } from "./machine";
import BpmnForm from "../../components/FormJs";
import type { Events } from "./machine-types";
import { StateContext } from "./machine-types";
import { createEffect, createMemo } from "solid-js";
import { BackButton } from "./Buttons";
import { Confirmation } from "./Confirmation";

const STORAGE_KEY = "workflow-state";

export const ProjectRequest = () => {
  const persistedState = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "null"
  );

  const [state, send, actor] = useActor(machine, {
    input: {},
    snapshot: persistedState,
  });

  const saveWorkflowState = () => {
    const persistedState = actor.getPersistedSnapshot();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  };

  const triggerEvent = (event: Events, clean: boolean = false) => {
    send(event);
    if (clean) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      saveWorkflowState();
    }
  };

  const onSubmit = <T extends Events["type"]>(
    eventType: T,
    data: T extends "previous" ? never : any
  ) => {
    triggerEvent({ type: eventType, params: { data } }, false);
  };

  const schema = createMemo(() => {
    const step = state.value;
    if (step != "complete" && step != "submitting") {
      return StateContext.fields[step].from;
    }
  });

  createEffect(() => {
    if ((state.value as any) === "stopped") {
      // TODO: Handle error
      console.log("error is state machine");
      console.log(state);
      localStorage.removeItem(STORAGE_KEY);
    }
  });

  return (
    <div>
      {state.context.display === "form" && state.value && (
        <BpmnForm
          key={state.value}
          schema={schema()}
          data={{}}
          onSubmit={(data /*, errors*/) => {
            if (state.value !== "complete" && state.value !== "submitting") {
              onSubmit(state.value, data);
            }
          }}
        />
      )}
      {state.context.navigationPrevious && (
        <BackButton action={() => triggerEvent({ type: "previous" }, false)} />
      )}
      {state.context.display === "review" && (
        <Confirmation storageKey={STORAGE_KEY} />
      )}
    </div>
  );
};
