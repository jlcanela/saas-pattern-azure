import { Alert, AlertTitle, Box, Link, Paper, Stack, Typography } from "@suid/material";
import { Component, JSXElement } from "solid-js";

export interface ReviewProps {
  state: {
    context: {
      errorMessage?: string;
      [key: string]: any;
    };
  };
  children?: JSXElement;
}

const Review: Component<ReviewProps> = (props) => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Review
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Final step! Congratulations!
      </Typography>

      {props.state.context.errorMessage && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            "& .MuiAlertTitle-root": {
              fontWeight: "bold",
              mb: 1,
            },
          }}
        >
          <AlertTitle>Something went wrong</AlertTitle>
          <Box sx={{ mb: 2 }}>
            We encountered an issue while processing your request. Don't worry -
            your data is safely stored in your browser.
          </Box>
          <Box
            component="pre"
            sx={{
              mt: 2,
              p: 1.5,
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              borderRadius: 1,
              overflow: "auto",
              fontSize: "0.875rem",
            }}
          >
            {props.state.context.errorMessage}
          </Box>
          <Box sx={{ mb: 2 }}>
            You can try:
            <ul>
              <li>Refreshing the page</li>
              <li>Checking your internet connection</li>
              <li>Coming back in a few minutes</li>
            </ul>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Link
              href="mailto:support@example.com"
              sx={{
                color: "inherit",
                textDecoration: "underline",
              }}
            >
              Contact support
            </Link>{" "}
            if the problem persists.
          </Box>
        </Alert>
      )}

      <Paper
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: "grey.100",
          overflowX: "auto",
        }}
      >
        <pre>{JSON.stringify(props.state.context, null, 2)}</pre>
      </Paper>

      <Stack direction="row" spacing={2}>
        {props.children}
      </Stack>
    </Box>
  );
};

export default Review;
