import { setup, assign } from 'xstate';

export const wizardMachine = setup({
  types: {} as {
    context: {
      project_name?: string;
      project_description?: string;
      project_objective?: string;
      project_stakeholders?: string;
    };
  },
}).createMachine({
  id: 'wizard',
  initial: 'step1',
  context: {
    project_name: undefined,
    project_description: undefined,
    project_objective: undefined,
    project_stakeholders: undefined
  },
  states: {
    step1: {
      meta: {
        title: "Request Project",
        form_fields: [{key: 'project_name', label: 'Name'}, {key: 'project_description', label: 'Description'}]
      },
      on: {
        NEXT: {
          target: 'step2',
          actions: assign({
            project_name: ({ event }) => event.data.project_name,
            project_description: ({ event }) => event.data.project_description
          }),
        }
      }
    },
    step2: {
      meta: {
        title: "Project Objective",
        form_fields: [{key: 'project_objective', label: 'Project Objective'}]
      },
      on: {
        PREV: 'step1',
        NEXT: {
          target: 'step3',
          actions: assign({
            project_objective: ({ event }) => event.data.project_objective,
          }),
        }
      }
    },
    step3: {
      meta: {
        title: "Project Stakeholders",
        form_fields: [{key: 'project_stakeholders', label: 'Project Stakeholders'}]
      },
      on: {
        PREV: 'step2',
        NEXT: {
          target: 'step4',
          actions: assign({
            project_stakeholders: ({ event }) => event.data.project_stakeholders,
          }),
        }
      }
    },
    step4: {
      on: {
        PREV: 'step3',
        SUBMIT: 'complete'
      }
    },
    complete: {
      type: 'final'
    }
  }
}
);
