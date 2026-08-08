import { Outlet } from "react-router-dom";

import Box from "@mui/material/Box";
import Header from "../../Organisms/Header/Header";
import Sidebar from "../../Organisms/Sidebar/Sidebar";
import Footer from "../../Organisms/Footer/Footer";

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
      >
        <Outlet />
      </Box>

      <Footer />
    </>
  );
};

export default AdminLayout;
