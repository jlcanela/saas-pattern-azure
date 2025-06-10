// src/components/Page.tsx
import React from "react";
import {
    AppShell,
    Burger,
    Group,
    NavLink,
    Menu,
    Avatar,
    Text,
    rem,
    Button,
    ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
    IconBell,
    IconApps,
    IconSettings,
    IconHelp,
    IconUser,
    IconUsers,
    IconLogout,
    IconChevronDown,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

export default function Page({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 250,
                breakpoint: "sm",
                collapsed: { mobile: !opened, desktop: false },
            }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" />
                        <Text fw={700} size="lg">
                            Project Management
                        </Text>
                    </Group>
                    <Group>
                        <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Notifications">
                            <IconBell size={18} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Applications">
                            <IconApps size={18} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Settings">
                            <IconSettings size={18} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Help">
                            <IconHelp size={18} />
                        </ActionIcon>

                        <Menu width={200} shadow="md" position="bottom-end">
                            <Menu.Target>
                                <Button
                                    variant="default"
                                    color="gray"
                                    rightSection={<IconChevronDown style={{ width: rem(16), height: rem(16) }} />}
                                    px="xs"
                                    radius="md"
                                    style={{ display: 'flex', alignItems: 'center', gap: rem(8) }}
                                >
                                    <Group gap="xs" align="center">
                                        <Avatar radius="xl" size={24} />
                                        <Text size="sm">John Smith</Text>
                                    </Group>
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item leftSection={<IconUser size={16} />}>My Profile</Menu.Item>
                                <Menu.Item leftSection={<IconUsers size={16} />}>User Management</Menu.Item>
                                <Menu.Divider />
                                <Menu.Item leftSection={<IconLogout size={16} />} color="red">
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <NavLink label="Administration" component={Link} to="/administration" />
                <NavLink label="Projects" component={Link} to="/projects" />
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
}
