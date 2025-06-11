import { useState } from 'react';
import {
  Table,
  Checkbox,
  Button,
  Group,
  Text,
  MultiSelect,
  Select,
  ActionIcon,
  Menu,
  Box,
  Flex,
  type StyleProp,
  type DefaultMantineColor
} from '@mantine/core';

import {
  IconDots,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
} from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router'
import { CreateProject } from '@/components/CreateProjectForm';
import { useSuspenseQuery } from '@tanstack/react-query';
import { projectsQueryOptions } from '@/utils/fetchProjects';


export default function ProjectsTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [creatorFilter, setCreatorFilter] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: projects } = useSuspenseQuery(projectsQueryOptions);

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        console.log('Deleting selected:', selectedRows)
        // Add your delete logic here
        break
      case 'export':
        console.log('Exporting selected:', selectedRows)
        // Add export logic
        break
    }
  }

  const rows = projects.map((project) => (
    <Table.Tr
      key={project.id}
      bg={(selectedRows.includes(project.id) ? 'var(--mantine-color-blue-light)' : undefined) as StyleProp<DefaultMantineColor>}
    >
      <Table.Td>
        <Checkbox
          aria-label="Select row"
          checked={selectedRows.includes(project.id)}
          onChange={(event) =>
            setSelectedRows(
              event.currentTarget.checked
                ? [...selectedRows, project.id]
                : selectedRows.filter((id) => id !== project.id)
            )
          }
        />
      </Table.Td>
      <Table.Td>
        <Link to="/projects/$projectId" params={{ projectId: project.id.toString() }}><Text fw={500}>{project.project_name}</Text></Link>
      </Table.Td>
      <Table.Td>{project.project_description}</Table.Td>
      <Table.Td>{project.project_objective}</Table.Td>
      <Table.Td>{project.project_stakeholders}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button size="xs" variant="outline">Edit</Button>
          <Button size="xs" variant="outline" color="red">Delete</Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box p="md">
      {/* Header */}
      <Text size="xl" fw={700} mb="xs">Projects</Text>
      <Text c="dimmed" mb="lg">List of projects.</Text>

      {/* Top Controls */}
      <Flex justify="space-between" align="center" mb="md" wrap="wrap" gap="md">
        <Group>


          {/* Creator Filter */}
          <MultiSelect
            placeholder="Filter by creator name"
            data={[
              { value: 'john', label: 'John Smith' },
              { value: 'jane', label: 'Jane Doe' },
            ]}
            value={creatorFilter}
            onChange={setCreatorFilter}
            w={250}
            rightSection={<IconChevronDown size={16} />}
          />
        </Group>

        <Group>
          {/* Create Project Button */}
          <CreateProject />

          {selectedRows.length > 0 && (
            <>
            <Select
              placeholder="Bulk actions"
              data={[
                { value: 'delete', label: 'Delete selected' },
                { value: 'export', label: 'Export selected' },
              ]}
              onChange={handleBulkAction}
              w={200}
              rightSection={<IconChevronDown size={16} />}
              />

               {/* More Actions Menu */}
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item>Action</Menu.Item>
              <Menu.Divider />
              <Menu.Item>Separated Action</Menu.Item>
            </Menu.Dropdown>
          </Menu>
              </>
          ) }

         
        </Group>
      </Flex>

      {/* Table */}
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={50}>
              <Checkbox
                checked={selectedRows.length === projects.length}
                indeterminate={selectedRows.length > 0 && selectedRows.length < projects.length}
                onChange={(event) =>
                  setSelectedRows(event.currentTarget.checked ? projects.map(p => p.id) : [])
                }
              />
            </Table.Th>
            <Table.Th>Project Name</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Objective</Table.Th>
            <Table.Th>Stakeholders</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      {/* Bottom Pagination Controls */}
      <Flex justify="space-between" align="center" mt="md">
        <Group>
          <Text size="sm" c="dimmed">
            {selectedRows.length > 0 && `${selectedRows.length} selected`}
          </Text>
        </Group>

        <Group>
          {/* Items per page */}
          <Select
            value={pageSize}
            onChange={(value) => value && setPageSize(value)}
            data={[
              { value: '1', label: '1 per page' },
              { value: '5', label: '5 per page' },
              { value: '10', label: '10 per page' },
            ]}
            w={130}
            size="sm"
          />

          <Text size="sm" c="dimmed">
            1 - {Math.min(parseInt(pageSize), projects.length)} of {projects.length}
          </Text>

          {/* Pagination buttons */}
          <Group gap={5}>
            <ActionIcon
              variant="subtle"
              color="gray"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <IconChevronLeft size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="gray"
              disabled={currentPage * parseInt(pageSize) >= projects.length}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Flex>

    </Box>
  );
}

export const Route = createFileRoute('/projects')({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(projectsQueryOptions),
  component: ProjectsTable,
})

