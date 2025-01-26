import { Component } from "solid-js";
import { A } from "@solidjs/router";
import MenuIcon from "@suid/icons-material/Menu";
import { FaBrandsGithub } from "solid-icons/fa";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@suid/material";
import { useLocation } from "@solidjs/router";

interface NavButtonProps {
  href: string;
  label: string;
  blank?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  blank?: boolean;
}

const NavButton: Component<NavButtonProps> = (props) => {
  const location = useLocation();
  const isActive = () => location.pathname === props.href;

  return (
    <>
      {props.blank ? (
        <Button
          component="a"
          color="inherit"
          href={props.href}
          target="_blank"
          sx={{
            bgcolor: isActive() ? "rgba(255, 255, 255, 0.12)" : "transparent",
            "&:hover": {
              bgcolor: isActive()
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          {props.label}
        </Button>
      ) : (
        <Button
          color="inherit"
          href={props.href}
          sx={{
            bgcolor: isActive() ? "rgba(255, 255, 255, 0.12)" : "transparent",
            "&:hover": {
              bgcolor: isActive()
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          {props.label}
        </Button>
      )}
    </>
  );
};

export function Header() {
  //const base = import.meta.env.MODE === 'production' ? '/project-ui' : '';

  const navItems: NavItem[] = [
    //{ href: "/project-requests", label: "Requests" },
    //{ href: "/audio-player", label: "Audio Player" },
    { href: "/request-project", label: "Request Project" },
    { href: "/projects", label: "Projects" },
    { href: "/docs", label: "OpenAPI (OAS 3.1)", blank: true },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          }
          <Typography variant="h6" component="div" sx={{ mr: 2 }}>
            Smart UI
          </Typography>
          <NavButton href="/" label="Home" />

          {navItems.map((item) => (
            <NavButton
              href={`${item.href}`}
              label={item.label}
              blank={item.blank}
            />
          ))}

          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            component={A}
            size="large"
            edge="start"
            color="inherit"
            aria-label="github repository"
            href="https://github.com/jlcanela/saas-pattern-app"
            sx={{ mr: 2 }}
            target="_blank"
          >
            <FaBrandsGithub />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
