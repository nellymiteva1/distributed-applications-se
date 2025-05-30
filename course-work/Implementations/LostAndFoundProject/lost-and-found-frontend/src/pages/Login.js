import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { setToken } from '../utils/auth';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      setToken(response.data.token);
      setEmail('');
      setPassword('');
      navigate('/dashboard');
    } catch (err) {
      alert('Грешка при вход! Проверете имейл и парола.');
      console.error(err);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" gutterBottom>Вход</Typography>
      <form onSubmit={handleLogin}>
        <TextField
          id="login-email"
          fullWidth
          label="Email"
          value={email}
          margin="normal"
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          id="login-password"
          fullWidth
          label="Парола"
          type="password"
          value={password}
          margin="normal"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Вход
        </Button>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Нямаш акаунт? <Link to="/register">Регистрирай се</Link>
        </Typography>
      </form>
    </Box>
  );
}
