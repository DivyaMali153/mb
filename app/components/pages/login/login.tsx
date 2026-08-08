import Box from "@mui/material/Box";
import LoginForm from "../../molecules/Loginform/loginform";

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
