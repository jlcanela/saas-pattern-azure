import { Box, Button, Modal } from "@mantine/core"
import {
    TextArea,
    TextInput,
} from "@inato-form/fields";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react"
import { ProjectRequest, projectsCreate } from "common";
import { Effect, pipe } from "effect";
import { FormBody, FormDisplay } from "@inato-form/core";
import { MantineReactHookFormLive } from "./layer";
import * as Mantine from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const CreateProject = () => {
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure();

    const body = FormBody.struct({
        project_name: TextInput.Required,
        project_description: TextArea.Required,
        project_objective: TextInput.Required,
        project_stakeholders: TextInput.Required
    });

    const Display = pipe(
        FormDisplay.make(body),
        Effect.provide(MantineReactHookFormLive),
        Effect.runSync
    );

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (newProject: ProjectRequest) =>
            projectsCreate(newProject).pipe(Effect.runPromise),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            closeModal();
        },
    });

    const submit = (values: unknown) =>
            mutation.mutate(values as ProjectRequest)

    return (
        <>
            <Button
                leftSection={<IconPlus size={16} />}
                onClick={openModal}
            >
                Create a project
            </Button>

            <Modal
                opened={modalOpened}
                onClose={closeModal}
                title="Create New Project"
                centered
                size="md"
            >
                <Box>
                    <Display.Form
                        onSubmit={({ encoded }) => submit(encoded)}
                        onError={reportError}
                        validationMode="onSubmit"
                    >
                        <Mantine.Stack>
                            <Display.project_name label="Project name" placeholder="project name" />
                            <Display.project_description label="Project description" placeholder="project description" />
                            <Display.project_objective label="Project objective" placeholder="project objective" />
                            <Display.project_stakeholders label="Project stakeholders" placeholder="project stakeholders" />
                            <Mantine.Group justify="end">
                                <Display.Submit>Create</Display.Submit>
                            </Mantine.Group>
                        </Mantine.Stack>
                    </Display.Form>
                </Box>
            </Modal>
        </>

    )
}