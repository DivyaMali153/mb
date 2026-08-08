import LoginForm from "@/app/components/molecules/Loginform/loginform";
import Box from "@mui/material/Box";

const Login = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <LoginForm />
    </Box>
  );
};

export default Login;
