import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated()) return null; // Не показвай navbar, ако не е логнат

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Lost & Found
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/dashboard">
            Предмети
          </Button>
          <Button color="inherit" component={Link} to="/categories">
            Категории
          </Button>
          <Button color="inherit" component={Link} to="/users">
            Потребители
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Изход
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
