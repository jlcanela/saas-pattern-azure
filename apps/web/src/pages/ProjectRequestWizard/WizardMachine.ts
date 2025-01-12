import { setup, assign, fromPromise } from 'xstate';

interface ProjectInput {
  project_name: string;
  project_description: string;
  project_objective: string;
  project_stakeholders: string;
}

interface ProjectResponse {
  project_id: string;
}

const createProject = async ({ input }: { input: ProjectInput }): Promise<ProjectResponse> => {
  return fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
}

export const wizardMachine = setup({
  types: {} as {
    context: {
      project_id?: string;
      project_name?: string;
      project_description?: string;
      project_objective?: string;
      project_stakeholders?: string;
      errorMessage?: string;
    };
    events: {
      type: 'NEXT' | 'PREV' | 'SUBMIT';
      data?: Partial<ProjectInput>;
    };
  },
  actors: {
    createProject: fromPromise(async ({ input }: { input: ProjectInput }) => {
      const project = await createProject({ input });
      return project;
    }),
  },
}).createMachine({
  id: 'wizard',
  initial: 'step1',
  context: {
    project_id: undefined,
    project_name: undefined,
    project_description: undefined,
    project_objective: undefined,
    project_stakeholders: undefined,
    errorMessage: undefined,
  },
  states: {
    step1: {
      meta: {
        title: "Request Project",
        form_fields: [{ key: 'project_name', label: 'Name' }, { key: 'project_description', label: 'Description' }]
      },
      on: {
        NEXT: {
          target: 'step2',
          actions: assign({
            project_name: ({ event }) => event.data?.project_name,
            project_description: ({ event }) => event.data?.project_description
          }),
        }
      }
    },
    step2: {
      meta: {
        title: "Project Objective",
        form_fields: [{ key: 'project_objective', label: 'Project Objective' }]
      },
      on: {
        PREV: 'step1',
        NEXT: {
          target: 'step3',
          actions: assign({
            project_objective: ({ event }) => event.data?.project_objective,
          }),
        }
      }
    },
    step3: {
      meta: {
        title: "Project Stakeholders",
        form_fields: [{ key: 'project_stakeholders', label: 'Project Stakeholders' }]
      },
      on: {
        PREV: 'step2',
        NEXT: {
          target: 'step4',
          actions: assign({
            project_stakeholders: ({ event }) => event.data?.project_stakeholders,
          }),
        }
      }
    },
    step4: {
      on: {
        PREV: {
          target: 'step3',
          actions: assign({
            errorMessage: undefined,
          }),
        },
        SUBMIT: {
          target: 'submitting'
        }
      }
    },
    submitting: {
      on: {
        PREV: 'step4'
      },
      invoke: {
        id: 'createProject',
        src: 'createProject',
        input: ({ context: { project_name, project_description, project_objective, project_stakeholders } }) => ({
          project_name,
          project_description,
          project_objective,
          project_stakeholders
        } as ProjectInput),
        onDone: {
          target: 'complete',
          actions: assign({
            project_id: ({ event }) => event.output.project_id,
            errorMessage: undefined
          })
        },
        onError: {
          target: 'step4',
          actions: assign({
            errorMessage: ({ event }) => event.error instanceof Error ? event.error.message : 'An unknown error occurred'
          })
        }
      }
    },
    complete: {
      type: 'final'
    }
  }
});
