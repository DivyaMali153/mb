import Box from "@mui/material/Box";
import Header from "./components/Organisms/Header";
import Sidebar from "./components/Organisms/Sidebar/Sidebar";
import Footer from "./components/Organisms/Footer/Footer";

const AdminLayout = () => {
  return (
    <>
      <Header />

      <Sidebar />

      <Box
        sx={{
          ml: "150px",
          mt: "64px",
          p: 3,
          minHeight: "calc(100vh - 64px)",
        }}
      ></Box>

      <Footer />
    </>
  );
};

export default AdminLayout;
