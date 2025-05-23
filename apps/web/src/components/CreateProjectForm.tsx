import { useState, type FormEvent } from 'react';
import {
  Form,
  FormGroup,
  TextInput,
  TextArea,
  FormSelect,
  FormSelectOption,
  Checkbox,
  ActionGroup,
  Button,
  Radio,
  HelperText,
  HelperTextItem,
  FormHelperText
} from '@patternfly/react-core';

export const CreateProjectForm: React.FunctionComponent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [option, setOption] = useState('please choose');

const handleNameChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
  setName(value);
};

const handleEmailChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
  setEmail(value);
};

// const handleEmailChange = (value: string, event: React.FormEvent<HTMLInputElement>) => {
//   setEmail(value);
// };


  const handleExperienceChange = (_event: FormEvent<HTMLTextAreaElement>, experience: string) => {
    setExperience(experience);
  };

  const handleOptionChange = (_event: React.FormEvent<HTMLSelectElement>, value: string) => {
    setOption(value);
  };

  const options = [
    { value: 'select one', label: 'Select one', disabled: false },
    { value: 'mr', label: 'Mr', disabled: false },
    { value: 'miss', label: 'Miss', disabled: false },
    { value: 'mrs', label: 'Mrs', disabled: false },
    { value: 'ms', label: 'Ms', disabled: false },
    { value: 'dr', label: 'Dr', disabled: false },
    { value: 'other', label: 'Other', disabled: false }
  ];

  return (
    <Form isHorizontal>
      <FormGroup label="Full name" isRequired fieldId="horizontal-form-name">
        <TextInput
          value={name}
          isRequired
          type="text"
          id="horizontal-form-name"
          aria-describedby="horizontal-form-name-helper"
          name="horizontal-form-name"
          onChange={handleNameChange}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>Include your middle name if you have one.</HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
      <FormGroup label="Email" isRequired fieldId="horizontal-form-email">
        <TextInput
          value={email}
          isRequired
          type="email"
          id="horizontal-form-email"
          name="horizontal-form-email"
          onChange={handleEmailChange}
        />
      </FormGroup>
      <FormGroup label="Your title" fieldId="horizontal-form-title">
        <FormSelect
          value={option}
          onChange={handleOptionChange}
          id="horizontal-form-title"
          name="horizontal-form-title"
          aria-label="Your title"
        >
          {options.map((option, index) => (
            <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
          ))}
        </FormSelect>
      </FormGroup>
      <FormGroup label="Your experience" fieldId="horizontal-form-exp">
        <TextArea
          value={experience}
          onChange={handleExperienceChange}
          id="horizontal-form-exp"
          name="horizontal-form-exp"
        />
      </FormGroup>
      <FormGroup
        label="How can we contact you?"
        isStack
        fieldId="horizontal-form-checkbox-group"
        hasNoPaddingTop
        role="group"
      >
        <Checkbox label="Email" id="alt-form-checkbox-1" name="alt-form-checkbox-1" />
        <Checkbox label="Phone" id="alt-form-checkbox-2" name="alt-form-checkbox-2" />
        <Checkbox label="Mail" id="alt-form-checkbox-3" name="alt-form-checkbox-3" />
      </FormGroup>
      <FormGroup role="radiogroup" isStack fieldId="horizontal-form-radio-group" hasNoPaddingTop label="Time zone">
        <Radio name="horizontal-inline-radio" label="Eastern" id="horizontal-inline-radio-01" />
        <Radio name="horizontal-inline-radio" label="Central" id="horizontal-inline-radio-02" />
        <Radio name="horizontal-inline-radio" label="Pacific" id="horizontal-inline-radio-03" />
      </FormGroup>
      <ActionGroup>
        <Button variant="primary">Submit</Button>
        <Button variant="link">Cancel</Button>
      </ActionGroup>
    </Form>
  );
};
