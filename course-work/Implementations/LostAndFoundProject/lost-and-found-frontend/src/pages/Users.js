import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    isActive: true,
    profilePictureUrl: ''
  });
  const [filters, setFilters] = useState({ firstName: '', lastName: '' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async (pageNumber = page + 1, filter = filters) => {
    setLoading(true);
    try {
      const res = await api.get('/user', {
        params: {
          firstName: filter.firstName,
          lastName: filter.lastName,
          pageNumber,
          pageSize
        }
      });
      setUsers(res.data.users || res.data.Users);
      setTotalCount(res.data.totalItems || res.data.TotalItems);
    } catch (err) {
      console.error('Error loading users', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, page, pageSize]);

  const handleSearch = () => {
    setPage(0);
    fetchUsers(1, filters);
  };

  const openCreateForm = () => {
    setEditUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      phoneNumber: '',
      isActive: true,
      profilePictureUrl: ''
    });
    setFormOpen(true);
  };

  const openEditForm = (user) => {
    setEditUser(user);
    setFormData({ ...user, password: '' });
    setFormOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editUser) {
        await api.put(`/user/${editUser.id}`, formData);
      } else {
        await api.post('/user', formData);
      }
      setFormOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Грешка при запис');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/user/${id}`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user', err);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'Име', width: 120 },
    { field: 'lastName', headerName: 'Фамилия', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'username', headerName: 'Потребител', width: 120 },
    { field: 'phoneNumber', headerName: 'Телефон', width: 130 },
    { field: 'isActive', headerName: 'Активен', width: 100, renderCell: (params) => params.value ? 'Да' : 'Не' },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Действия',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Редактирай" onClick={() => openEditForm(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Изтрий" onClick={() => setDeleteId(params.id)} color="error" />
      ]
    }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Потребители</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          id="filter-firstName"
          label="Име"
          value={filters.firstName}
          onChange={(e) => setFilters({ ...filters, firstName: e.target.value })}
        />
        <TextField
          id="filter-lastName"
          label="Фамилия"
          value={filters.lastName}
          onChange={(e) => setFilters({ ...filters, lastName: e.target.value })}
        />
        <Button variant="outlined" onClick={handleSearch}>Търси</Button>
        <Button
          variant="text"
          onClick={() => {
            setFilters({ firstName: '', lastName: '' });
            setPage(0);
            fetchUsers(1, { firstName: '', lastName: '' });
          }}
        >
          Изчисти
        </Button>
      </Box>

      <Button variant="contained" sx={{ mb: 2 }} onClick={openCreateForm}>Добави потребител</Button>

      <DataGrid
        rows={users}
        columns={columns}
        autoHeight
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 20]}
        paginationMode="server"
        rowCount={totalCount}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
        disableSelectionOnClick
        getRowId={(row) => row.id}
        loading={loading}
      />

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Изтриване на потребител</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отказ</Button>
          <Button onClick={() => handleDelete(deleteId)} color="error">Изтрий</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editUser ? 'Редакция' : 'Нов потребител'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Попълни данни за потребителя.</DialogContentText>

          <TextField
            id="user-firstName"
            fullWidth
            label="Име"
            margin="dense"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <TextField
            id="user-lastName"
            fullWidth
            label="Фамилия"
            margin="dense"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          <TextField
            id="user-email"
            fullWidth
            label="Email"
            margin="dense"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
          id="user-password"
          fullWidth
          label="Парола"
          type="password"
          margin="dense"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <TextField
            id="user-username"
            fullWidth
            label="Потребителско име"
            margin="dense"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          
      
          <TextField
            id="user-phoneNumber"
            fullWidth
            label="Телефон"
            margin="dense"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
          <TextField
            id="user-profilePictureUrl"
            fullWidth
            label="Снимка (URL)"
            margin="dense"
            value={formData.profilePictureUrl}
            onChange={(e) => setFormData({ ...formData, profilePictureUrl: e.target.value })}
          />
<FormControlLabel
  control={
    <Checkbox
      id="user-isActive"
      checked={formData.isActive}
      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
    />
  }
  label="Активен"
/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Отказ</Button>
          <Button onClick={handleSave} variant="contained">Запази</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
