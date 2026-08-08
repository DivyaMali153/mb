import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const dashboardData = [
  {
    title: "Total Users",
    value: "120",
  },
  {
    title: "Products",
    value: "75",
  },
  {
    title: "Orders",
    value: "310",
  },
  {
    title: "Revenue",
    value: "₹85,000",
  },
];

const recentUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@gmail.com",
    role: "Admin",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    role: "Manager",
  },
  {
    id: 3,
    name: "Priya Patel",
    email: "priya@gmail.com",
    role: "Employee",
  },
];

const Dashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={4}>
        Welcome to Admin Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        {dashboardData.map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={3}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {item.title}
                </Typography>

                <Typography variant="h4" fontWeight="bold">
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Users */}
      <Paper
        elevation={3}
        sx={{
          mt: 5,
          p: 2,
        }}
      >
        <Typography variant="h6" mb={2}>
          Recent Users
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;
