import { useNavigate } from "@solidjs/router";
import { Button } from "@suid/material";
import { CheckCircle } from "@suid/icons-material";
import { Box, Typography } from "@suid/material";
import { green } from "@suid/material/colors";

interface ConfirmationProps {
  storageKey: string;
}

export const Confirmation = (props: ConfirmationProps) => {
  const navigate = useNavigate();
  return (
    <>
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
          Confirmation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Project has been successfully submitted
        </Typography>
        <Button
          onClick={() => {
            localStorage.removeItem(props.storageKey);
            navigate("/projects");
          }}
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 4 }}
        >
          Close and Go to Projects
        </Button>
      </Box>
    </>
  );
};
