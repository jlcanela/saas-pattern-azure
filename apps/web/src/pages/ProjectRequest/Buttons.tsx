import type { Component } from "solid-js";

interface FormButtonProps {
  label: string;
  action: () => void;
  disabled?: boolean;
}

export const FormButton: Component<FormButtonProps> = (props) => {
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

interface BackButtonProps {
  action: () => void;
}

export const BackButton = (props: BackButtonProps) => {
  return <FormButton label="Previous" action={props.action} />;
};
