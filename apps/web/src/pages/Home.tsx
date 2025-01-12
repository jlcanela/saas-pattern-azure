import { Box, Typography, Button, Container } from "@suid/material";
import { A } from "@solidjs/router";

function Hero() {

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        backgroundColor: "#f5f5f5",
        textAlign: "center",
        padding: 4,
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to Our Application
      </Typography>
      <Typography variant="h5" component="p" gutterBottom>
        Discover amazing features and enhance your productivity.
      </Typography>
      <Button component={A} href="./simple-wizard" variant="contained" color="primary" size="large" sx={{ mt: 4 }}>
        Get Started
      </Button>
    </Box>
  );
}

function Home() {
  return (
    <Container>
      <Hero />
      {/* Additional content can be added here */}
    </Container>
  );
}

export default Home;
