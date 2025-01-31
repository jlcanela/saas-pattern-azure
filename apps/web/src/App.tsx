import { Route, Router } from "@solidjs/router";

import { createTheme, ThemeProvider } from "@suid/material/styles";
import { Header } from "./components/Header.jsx";
import { Box } from "@suid/material";
import Home from "./pages/Home";

import Projects from "./pages/Projects";
import { AudioPlayer } from "./pages/AudioPlayer/index.jsx";
import { ProjectRequest } from "./pages/ProjectRequest/index.jsx";
import { EditProject } from "./pages/EditProject.jsx";
import { ViewProjectHistory } from "./pages/ViewProjectHistory.jsx";

// Create the custom theme
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 1920, // add your custom breakpoint value
    },
  },
});

function Layout(props: any) {
  return (
    <>
      <Header />
      <Box
        sx={{
          maxWidth: "80%", // Set maximum width
          margin: "30px auto", // Center the box
        }}
      >
        {props.children}
      </Box>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router root={Layout}>
        <Route path="/" component={Home} />
        <Route path="/project-requests" component={Home} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/:id/edit" component={EditProject} />
        <Route path="/projects/:id/history" component={ViewProjectHistory} />
        <Route path="/audio-player" component={AudioPlayer} />
        <Route path="/request-project" component={ProjectRequest} />
      </Router>
    </ThemeProvider>
  );
}
