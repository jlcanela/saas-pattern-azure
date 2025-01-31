import { assign, fromPromise, setup } from "xstate";
import { Effect, Schema } from "effect"

import type { Context, Events } from "./machine-types";
import { StateContext } from "./machine-types";

import { ProjectRequest, projectsCreate } from "common";

export const machine = setup({
    types: {
        context: {} as Context,
        events: {} as Events,
    },
    actions: {
        setDisplayAsReview: assign({
            display: "review",
        }),
        setPrevious: assign({
            navigationPrevious: true,
        }),
        unsetPrevious: assign({
            navigationPrevious: false,
        }),
    },
    actors: {
        createProject: fromPromise(async ({ input }: { input?: ProjectRequest }) =>
            input ? projectsCreate(input).pipe(Effect.runPromise) : Effect.fail(new Error("Invalid input")))
    }
}).createMachine({
    context: Schema.decodeSync(StateContext)({
        display: "form",
        navigationPrevious: false
    }),
    id: "Project Request",
    initial: "info",
    states: {
        info: {
            on: {
                info: {
                    target: "objectives",
                    actions: assign({
                        info: ({ event }) => event.params.data,
                    }),
                },
            },
            entry: {
                type: "unsetPrevious",
            },
        },
        objectives: {
            on: {
                objectives: {
                    target: "submitting",
                    actions: assign({
                        objectives: ({ event }) => event.params.data,
                    }),
                },
                previous: {
                    target: "info",
                },
            },
            entry: {
                type: "setPrevious",
            },
        },
        submitting: {
            invoke: {
                id: 'createProject',
                src: 'createProject',
                input: ({ context }) => {
                    if (!context.info || !context.objectives) {
                        return undefined;
                    } else {
                        return ProjectRequest.make({
                            project_name: context.info.name,
                            project_description: context.info.description,
                            project_objective: context.objectives.objectives,
                            project_stakeholders: context.objectives.stakeholders
                        })
                    }
                },
                onDone: {
                    target: 'complete',
                    // actions: assign({
                    //     project_id: ({ event }) => event.output.project_id,
                    //     errorMessage: undefined
                    // })
                },
                onError: {
                    target: 'objectives',
                    // actions: assign({
                    //     errorMessage: ({ event }) => event.error instanceof Error ? event.error.message : 'An unknown error occurred'
                    // })
                }
            }
        },
        complete: {
            type: "final",
            entry: [{
                type: "setDisplayAsReview",
            }, {
                type: "unsetPrevious"
            }]
        },
    },
});

