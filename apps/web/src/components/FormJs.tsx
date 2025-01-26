import { Form, Schema } from "@bpmn-io/form-js";
export type { Schema } from "@bpmn-io/form-js";
import { JSONSchema, Schema as S } from "effect";

import { createEffect, onCleanup } from "solid-js";

export type OnSubmitCallback = (
  data: FormEvent["data"],
  errors?: FormEvent["errors"]
) => void;

export interface Field {
  key: string;
  label: string;
}

export interface FormFields {
  title: string;
  form_fields: Field[];
}

interface FormEvent {
  data: Record<string, any>;
  errors: Record<string, any>;
}

export function getForm(f: FormFields): Schema {
  return {
    components: [
      {
        type: "text",
        text: `# ${f.title}`,
      },
      ...f.form_fields.map((field) => ({
        key: field.key,
        label: field.label,
        type: "textfield",
        validate: {
          required: true,
          minLength: 1,
        },
        layout: {
          columns: 16,
          row: "Row_1",
        },
      })),
      {
        key: "submit",
        label: "Submit",
        type: "button",
      },
    ],
    type: "default",
  };
}

function convertToFormJs(schema: S.Schema<any, any>) {
  const jsonSchema = JSONSchema.make(schema);
  const isJsonSchema7Object = (
    schema: any
  ): schema is JSONSchema.JsonSchema7Object => {
    return schema.type === "object";
  };

  const fields = isJsonSchema7Object(jsonSchema)
    ? Object.entries(jsonSchema.properties).map(([key, value]) => ({
        key,
        label: value.title || key,
      }))
    : [];

  const formFields: FormFields = {
    title: "Request Project",
    form_fields: fields,
  };

  return getForm(formFields);
}

export function createForm(
  container: HTMLElement,
  schema: Schema,
  data: any,
  onSubmit: OnSubmitCallback
): Form {
  const form = new Form({
    container: container,
  });

  form.importSchema(schema, data).then(() => {
    form.on("submit", (event: FormEvent) => {
      if (!hasErrors(event.errors)) {
        onSubmit(event.data, undefined);
      }
    });
  });

  return form;
}

export function hasErrors(errors: Record<string, any>): boolean {
  return errors && Object.keys(errors).length > 0;
}

function isFormJsSchema(schema: Schema | S.Schema<any, any>): schema is Schema {
  return "components" in schema || "type" in schema;
}

interface BpmnFormProps {
  key: string;
  schema: Schema | S.Schema<any, any>;
  data: any;
  onSubmit: OnSubmitCallback;
}

function BpmnForm(props: BpmnFormProps) {
  let formContainer!: HTMLDivElement;
  let form: Form;

  createEffect(() => {
    if (formContainer) {
      if (form) {
        form.destroy();
      }
      if (props.schema) {
        const schema = isFormJsSchema(props.schema)
          ? props.schema
          : convertToFormJs(props.schema);
        form = createForm(formContainer, schema, props.data, props.onSubmit);
      }
    }
  });

  onCleanup(() => {
    if (form) {
      form.destroy();
    }
  });

  return (
    <div>
      <div ref={(el) => (formContainer = el as HTMLDivElement)}></div>
    </div>
  );
}

export default BpmnForm;
