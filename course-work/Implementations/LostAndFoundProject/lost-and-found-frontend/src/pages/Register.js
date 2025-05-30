import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('Паролите не съвпадат!');
      return;
    }

    try {
      await api.post('/auth/register', {
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });

      alert('Регистрацията е успешна. Влез в профила си.');
      navigate('/login');
    } catch (err) {
      alert('Грешка при регистрация. Възможно е потребителят вече да съществува.');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5">Регистрация</Typography>
      <form onSubmit={handleRegister}>
        <TextField fullWidth label="Потребителско име" name="username" value={form.username} margin="normal" onChange={handleChange} />
        <TextField fullWidth label="Име" name="firstName" value={form.firstName} margin="normal" onChange={handleChange} />
        <TextField fullWidth label="Фамилия" name="lastName" value={form.lastName} margin="normal" onChange={handleChange} />
        <TextField fullWidth label="Имейл" name="email" value={form.email} margin="normal" onChange={handleChange} />
        <TextField fullWidth label="Парола" type="password" name="password" value={form.password} margin="normal" onChange={handleChange} />
        <TextField fullWidth label="Потвърди паролата" type="password" name="confirmPassword" value={form.confirmPassword} margin="normal" onChange={handleChange} />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Регистрация
        </Button>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Имаш акаунт? <a href="/login">Влез тук</a>
        </Typography>
      </form>
    </Box>
  );
}
