import { Fragment, useState } from "react";
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Modal,
  ModalVariant,
  Wizard,
  // WizardHeader,
  WizardStep,
} from "@patternfly/react-core";

import { projectsCreate } from "common";
import { Effect } from "effect"
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const CreateProjectWizard: React.FunctionComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const queryClient = useQueryClient();
 
  const handleModalToggle = (/*_event: KeyboardEvent | React.MouseEvent*/) => {
    setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen);
  };

//   const handleWizardToggle = () => {
//     setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen);
//   };

//   const createProject = async () => {
//   await projectsCreate({
//     project_name: "dummy",
//     project_description: "description of the project",
//     project_objective: "make it work",
//     project_stakeholders: "John & Jane Doe"
//   }).pipe(Effect.runPromise)
// };

  // const mutation = useMutation({
  //   mutationFn: (newProject) => 
  //     projectsCreate({
  //       project_name: "dummy",
  //       project_description: "description of the project",
  //       project_objective: "make it work",
  //       project_stakeholders: "John & Jane Doe"
  //     }).pipe(Effect.runPromise),
  //     // fetch('/api/projects', {
  //     //   method: 'POST',
  //     //   body: JSON.stringify(newProject),
  //     //   headers: { 'Content-Type': 'application/json' }
  //     // }),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['projects'] }); // Refresh projects list
  //     setIsModalOpen(false);
  //   },
  //   onError: (error) => {
  //     console.error('Submission failed:', error);
  //   }
  // });
  
  // const projectCreationSteps = [
  //   <WizardStep
  //     name={`Identification`}
  //     key={`Step 1`}
  //     id={`with-wizard-step-1`}
  //   >
  //     <p>Name and Description</p>
  //   </WizardStep>,
  //   <WizardStep name={`Objective`} key={`Step 2`} id={`with-wizard-step-2`}>
  //     <p>Project Objective</p>
  //   </WizardStep>,
  //   <WizardStep name={`Stakeholders`} key={`Step 3`} id={`with-wizard-step-3`}>
  //     <p>Project Stakeholders</p>
  //   </WizardStep>,
  // ];

  return (
    <Fragment>
      <Button variant="primary" onClick={handleModalToggle}>
        Create a project
      </Button>
      <Modal
        variant={ModalVariant.large}
        isOpen={isModalOpen}
        aria-labelledby="modal-wizard-label"
        aria-describedby="modal-wizard-description"
      >
        <WizardModal onClose={() => handleModalToggle()}/>       
      </Modal>
    </Fragment>
  );
};

import {
  Form,
  FormGroup,
  TextInput,
  TextArea,
} from '@patternfly/react-core';

interface ProjectFormData {
  project_name: string;
  project_description: string;
  project_objective: string;
  project_stakeholders: string;
}

interface StepProps {
  formData: ProjectFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
}

const ProjectDetailsStep = ({ formData, setFormData }: StepProps) => (
  <Form>
    <FormGroup
      label="Project Name"
      fieldId="project_name"
      isRequired
    >
      <TextInput
        id="project_name"
        name="project_name"
        value={formData.project_name}
        onChange={(_event, value) => {
          console.log(value);
          setFormData(prev => ({
            ...prev,
            project_name: value
          }));
        }}
        isRequired
        validated={formData.project_name ? 'default' : 'error'}
        // helperTextInvalid="This field is required"
      />
    </FormGroup>
    <FormGroup
      label="Description"
      fieldId="project_description"
      isRequired
    >
      <TextArea
        id="project_description"
        name="project_description"
        value={formData.project_description}
        onChange={(_event, value) => setFormData(prev => ({
          ...prev,
          project_description: value
        }))}
        isRequired
        validated={formData.project_description ? 'default' : 'error'}
        // helperTextInvalid="This field is required"
      />
    </FormGroup>
  </Form>
);

const ObjectivesStep = ({ formData, setFormData }: StepProps) => (
  <Form>
    <FormGroup
      label="Objective"
      fieldId="project_objective"
      isRequired
    >
      <TextInput
        id="project_objective"
        name="project_objective"
        value={formData.project_objective}
        onChange={(_event, value) => setFormData(prev => ({
          ...prev,
          project_objective: value
        }))}
        isRequired
        validated={formData.project_objective ? 'default' : 'error'}
        // helperTextInvalid="This field is required"
      />
    </FormGroup>
    <FormGroup
      label="Stakeholders"
      fieldId="project_stakeholders"
      isRequired
    >
      <TextInput
        id="project_stakeholders"
        name="project_stakeholders"
        value={formData.project_stakeholders}
        onChange={(_event, value) => setFormData(prev => ({
          ...prev,
          project_stakeholders: value
        }))}
        isRequired
        validated={formData.project_stakeholders ? 'default' : 'error'}
        //helperTextInvalid="This field is required"
      />
    </FormGroup>
  </Form>
);


const ReviewStep = ({ formData }: { formData: ProjectFormData }) => (
  <div className="pf-v5-c-wizard__main-body">
    <DescriptionList isHorizontal>
      <DescriptionListGroup>
        <DescriptionListTerm>Project Name</DescriptionListTerm>
        <DescriptionListDescription>{formData.project_name}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Description</DescriptionListTerm>
        <DescriptionListDescription>{formData.project_description}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Objective</DescriptionListTerm>
        <DescriptionListDescription>{formData.project_objective}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Stakeholders</DescriptionListTerm>
        <DescriptionListDescription>{formData.project_stakeholders}</DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  </div>
);

interface WizardModalProps {
  onClose: (event?: KeyboardEvent | React.MouseEvent) => void;
}

const WizardModal = ({ onClose }: WizardModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProjectFormData>({
    project_name: '',
    project_description: '',
    project_objective: '',
    project_stakeholders: ''
  });

  const mutation = useMutation({
    mutationFn: (newProject: ProjectFormData) =>
      projectsCreate(newProject).pipe(Effect.runPromise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    }
  });

  return (
    <Wizard
      title="Create New Project"
      onClose={onClose}
      height={500}
    >
      <WizardStep name="Project Details" id="step1">
        <ProjectDetailsStep formData={formData} setFormData={setFormData} />
      </WizardStep>
      <WizardStep name="Objectives & Stakeholders" id="step2">
        <ObjectivesStep formData={formData} setFormData={setFormData} />
      </WizardStep>
       <WizardStep name="Review" id="step3" footer={{ nextButtonText: "Create", onNext: () => mutation.mutate(formData) }}>
        <ReviewStep formData={formData} />
      </WizardStep>
    </Wizard>
  );
};
