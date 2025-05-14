import { Fragment, useState } from "react";
import {
  Button,
  Modal,
  ModalVariant,
  Wizard,
  WizardHeader,
  WizardStep,
} from "@patternfly/react-core";

import { ProjectRequest, projectsCreate } from "common";
import { Effect } from "effect"

export const ModalWithWizard: React.FunctionComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen);
  };

  const handleWizardToggle = () => {
    setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen);
  };

  const createProject = async () => {
  await projectsCreate({
    project_name: "dummy",
    project_description: "description of the project",
    project_objective: "make it work",
    project_stakeholders: "John & Jane Doe"
  }).pipe(Effect.runPromise)
  // Optionally handle success/failure here
  setIsModalOpen(false); // Close the modal after creation
};
  
  const projectCreationSteps = [
    <WizardStep
      name={`Identification`}
      key={`Step 1`}
      id={`with-wizard-step-1`}
    >
      <p>Name and Description</p>
    </WizardStep>,
    <WizardStep name={`Objective`} key={`Step 2`} id={`with-wizard-step-2`}>
      <p>Project Objective</p>
    </WizardStep>,
    <WizardStep name={`Stakeholders`} key={`Step 3`} id={`with-wizard-step-3`}>
      <p>Project Stakeholders</p>
    </WizardStep>,
  ];

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
        <Wizard
          height={400}
          header={
            <WizardHeader
              title="Create a Project"
              titleId="modal-wizard-label"
              description="This is a wizard inside of a modal."
              descriptionId="modal-wizard-description"
              onClose={handleWizardToggle}
              closeButtonAriaLabel="Close wizard"
            />
          }
          onClose={handleWizardToggle}
        >
          {projectCreationSteps}
          <WizardStep
            name="Review"
            id="with-wizard-review-step"
            footer={{ nextButtonText: "Finish", onNext: createProject }}
          >
            Review step
          </WizardStep>
        </Wizard>
      </Modal>
    </Fragment>
  );
};
