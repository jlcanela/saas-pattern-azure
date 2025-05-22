import {
  Form as PfForm,
  FormGroup,
  TextInput,
  NumberInput,
  Button,
  FormHelperText,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { useForm } from "@tanstack/react-form";
import { Schema } from "effect";
import type { AnyFieldApi, DeepKeys, DeepValue } from "@tanstack/react-form";

// Helper function remains the same
function transformCamelCaseToSpacedCapitalized(input: string): string {
  return input
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid && (
        <FormHelperText>
          {field.state.meta.errors.map((e) => e.message).join(", ")}
          <ExclamationCircleIcon />
        </FormHelperText>
      )}
    </>
  );
}

export function Form<Fields extends Record<string, Schema.Schema.Any>>({
  schema,
  defaultValues,
}: {
  schema: Schema.Struct<Fields>;
  defaultValues: Schema.Schema.Type<Schema.Struct<Fields>>;
}) {
  type FormValues = Schema.Schema.Type<Schema.Struct<Fields>>;

  const form = useForm({
    defaultValues,
    validators: {
      onChange: Schema.standardSchemaV1(Schema.typeSchema(schema)),
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  function FieldWrapper<K extends keyof FormValues & string>({
    name,
    type = "text",
    parseValue,
    formatValue = (v) => String(v),
  }: {
    name: K;
    type: "text" | "int";
    parseValue: (_: string) => FormValues[K];
    formatValue?: (_: FormValues[K]) => string | number;
  }) {
    return (
      <form.Field
        name={name as unknown as DeepKeys<FormValues>}
        children={(field) => (
          <FormGroup
            label={transformCamelCaseToSpacedCapitalized(name)}
            fieldId={name}
          >
            {type === "int" ? (
              <NumberInput
                id={name}
                value={field.state.value as number}
                onMinus={() => {
                  const newValue = (field.state.value as number) - 1;
                  field.handleChange(
                    newValue as DeepValue<FormValues, DeepKeys<FormValues>>
                  );
                }}
                onPlus={() => {
                  const newValue = (field.state.value as number) + 1;
                  field.handleChange(
                    newValue as DeepValue<FormValues, DeepKeys<FormValues>>
                  );
                }}
                onChange={(event) => {
                  const value = Number(event.currentTarget.value);
                  field.handleChange(
                    (isNaN(value) ? 0 : value) as DeepValue<
                      FormValues,
                      DeepKeys<FormValues>
                    >
                  );
                }}
                onBlur={field.handleBlur}
              />
            ) : (
              <TextInput
                id={name}
                type={type}
                value={formatValue(field.state.value as FormValues[K])}
                onChange={(_event, value) => {
                  field.handleChange(
                    parseValue(value) as DeepValue<
                      FormValues,
                      DeepKeys<FormValues>
                    >
                  );
                }}
                onBlur={field.handleBlur}
                style={{
                  boxShadow: "none",
                  outline: "none",
                  borderBottomColor: "#c0c0c0",
                  borderBottomWidth: 1,
                }}
              />
            )}
            <FieldInfo field={field} />
          </FormGroup>
        )}
      />
    );
  }

  const schemaKeys = Object.keys(schema.fields) as Array<
    keyof FormValues & string
  >;

  return (
    <div>
      <PfForm
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {schemaKeys.map((key) => {
          const fieldType =
            typeof defaultValues[key] === "number" ? "int" : "text";
          return (
            <FieldWrapper
              key={key}
              name={key}
              type={fieldType}
              parseValue={
                fieldType === "int"
                  ? (v) =>
                      (v === "" ? 0 : parseInt(v, 10)) as FormValues[typeof key]
                  : (v) => v as FormValues[typeof key]
              }
              formatValue={
                fieldType === "int" ? (v) => v as number : (v) => v as string
              }
            />
          );
        })}

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <div className="pf-v5-c-form__group">
              <Button type="submit" isDisabled={!canSubmit} variant="primary">
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                type="reset"
                variant="secondary"
                onClick={() => form.reset()}
                className="pf-v5-u-ml-sm"
              >
                Reset
              </Button>
            </div>
          )}
        />
      </PfForm>
    </div>
  );
}
