import { Form, Schema } from "@bpmn-io/form-js";
import { onMount } from "solid-js";

type OnSubmitCallback = (data: any, errors: any) => void;

interface Field {
  key: string;
  label: string;
}

interface FormFields {
  title: string;
  form_fields: Field[];
}

interface FormEvent {
  data: Record<string, any>;
  errors: Record<string, any>;
}

export function getForm(f: FormFields): Schema {
  console.log('form', f);
  return {
    "components": [
      {
        "type": "text",
        "text": `# ${f.title}`
      },
      ...f.form_fields.map((field) => ({
        "key": field.key,
        "label": field.label,
        "type": "textfield",
        "validate": {
          "required": true,
          "minLength": 1
        },
        "layout": {
          "columns": 16,
          "row": "Row_1"
        }
      })),
      {
        "key": "submit",
        "label": "Submit",
        "type": "button"
      }
    ],
    "type": "default"
  }
}

export function createForm(container: HTMLElement, schema: Schema, data: any, onSubmit: OnSubmitCallback): void {
  const form = new Form({
    container: container,
  });

  form.importSchema(schema, data).then(() => {
    form.on("submit", (event: FormEvent) => {
      if (!hasErrors(event.errors)) {
        console.log("form_submit", event);
        onSubmit(event, undefined);
      }
    });
  });
}

export function hasErrors(errors: Record<string, any>): boolean {
  return errors && Object.keys(errors).length > 0;
}

function BpmnForm({ schema, data, onSubmit }: { schema: Schema; data: any, onSubmit: OnSubmitCallback }) {
    let formContainer!: HTMLDivElement;
  
    onMount(() => {
      createForm(formContainer, schema, data, onSubmit);
    });
  
    return (
      <div>
        <div ref={el => (formContainer = el as HTMLDivElement)}></div>
      </div>
    );
  }

export default BpmnForm;
