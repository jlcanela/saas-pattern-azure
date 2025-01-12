import { CheckCircle } from "@suid/icons-material";
import { Box, Typography } from "@suid/material";
import { green } from "@suid/material/colors";
import { Component } from "solid-js";

interface ConfirmationProps {
  title?: string;
  message?: string;
}

const Confirmation: Component<ConfirmationProps> = (props) => {
  return (
    <Box
      sx={{
        textAlign: "center",
        p: 3,
      }}
    >
      <CheckCircle
        sx={{
          color: green[500],
          fontSize: 64,
          mb: 2,
        }}
      />
      <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
        {props.title || "Confirmation"}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {props.message || "Project has been successfully submitted"}
      </Typography>
    </Box>
  );
};

export default Confirmation;
