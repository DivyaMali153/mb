"use client";

import {
  Drawer,
  Toolbar,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const drawerWidth = 150;

const menu = [
  {
    name: "Dashboard",
    path: "/billSystem/dashboard",
  },
  {
    name: "My Bills",
    path: "/billSystem/my-bills",
  },
  {
    name: "Profile",
    path: "/billSystem/profile",
  },
  {
    name: "Users",
    path: "/billSystem/users",
  },
  {
    name: "Settings",
    path: "/billSystem/settings",
  },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />

      <List>
        {menu.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            href={item.path}
            selected={pathname === item.path}
            sx={{
              "&.Mui-selected": {
                bgcolor: "#1976d2",
                color: "#fff",
              },
              "&.Mui-selected:hover": {
                bgcolor: "#1565c0",
              },
            }}
          >
            <ListItemText primary={item.name} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
