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

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priorityLevel: 1,
    isActive: true,
    averageValue: 0,
    totalItemsFound: 0
  });
  const [filters, setFilters] = useState({ name: '', description: '' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCategories = useCallback(async (pageNumber = page + 1, filter = filters) => {
  setLoading(true);
  try {
    const res = await api.get('/category/search', {
      params: {
        name: filter.name,
        description: filter.description,
        pageNumber,
        pageSize
      }
    });

    const rawList =
  res.data.categories?.$values ||
  res.data.categories ||
  res.data?.$values ||
  res.data ||
  [];
console.log('💡 Full response from backend:', res.data);
console.log('📦 Използван списък:', rawList);

    setCategories(rawList);
    console.log('📦 Категории (разпакетирани):', rawList);

    setTotalCount(res.data.totalItems);
  } catch (err) {
    console.error('Error loading categories', err);
  } finally {
    setLoading(false);
  }
}, [page, pageSize, filters]);


  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = () => {
    setPage(0);
    fetchCategories(1, filters);
  };

  const openCreateForm = () => {
    setEditCategory(null);
    setFormData({
      name: '',
      description: '',
      priorityLevel: 1,
      isActive: true,
      averageValue: 0,
      totalItemsFound: 0
    });
    setFormOpen(true);
  };

  const openEditForm = (category) => {
    setEditCategory(category);
    setFormData(category);
    setFormOpen(true);
  };

const handleSave = async () => {
  try {
    const cleanData = {
      ...formData,
      priorityLevel: Number(formData.priorityLevel) || 1,
      averageValue: Number(formData.averageValue) || 0,
      totalItemsFound: Number(formData.totalItemsFound) || 0
    };

    if (editCategory) {
      await api.put(`/category/${editCategory.id}`, cleanData);
    } else {
      await api.post('/category', cleanData);
    }

setFormOpen(false);
setFilters({ name: '', description: '' });
await fetchCategories(1, { name: '', description: '' });
setPage(0);

    const updated = await api.get('/category/search', {
      params: {
        name: '',
        description: '',
        pageNumber: 1,
        pageSize: 10
      }
    });

    
    console.log('📦 Категории от сървъра след запис:', updated.data.categories);

  } catch (err) {
    const message = err.response?.data?.message || JSON.stringify(err.response?.data || err.message);
    alert('❌ Грешка при запис:\n' + message);
    console.error('Грешка:', err.response?.data || err);
  }
};

  const handleDelete = async (id) => {
    try {
      await api.delete(`/category/${id}`);
      fetchCategories();
    } catch (err) {
      console.error('Грешка при изтриване:', err.response?.data || err);
      alert('Грешка при изтриване');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Име', width: 150 },
    { field: 'description', headerName: 'Описание', width: 200 },
    { field: 'priorityLevel', headerName: 'Приоритет', width: 120 },
    { field: 'isActive', headerName: 'Активна', width: 100, renderCell: (params) => params.value ? 'Да' : 'Не' },
    { field: 'averageValue', headerName: 'Средна стойност', width: 150 },
    { field: 'totalItemsFound', headerName: 'Намерени предмети', width: 160 },
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
      <Typography variant="h4" gutterBottom>Категории</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField label="Име" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <TextField label="Описание" value={filters.description} onChange={(e) => setFilters({ ...filters, description: e.target.value })} />
        <Button variant="outlined" onClick={handleSearch}>Търси</Button>
        <Button variant="text" onClick={() => { setFilters({ name: '', description: '' }); setPage(0); fetchCategories(1, { name: '', description: '' }); }}>Изчисти</Button>
      </Box>

      <Button variant="contained" sx={{ mb: 2 }} onClick={openCreateForm}>Добави категория</Button>

     <DataGrid
  rows={categories}
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
  loading={loading}
  getRowId={(row) => row.id} 
/>


      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Изтриване на категория</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отказ</Button>
          <Button onClick={() => handleDelete(deleteId)} color="error">Изтрий</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editCategory ? 'Редакция' : 'Нова категория'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Попълни данни за категорията.</DialogContentText>

          <TextField fullWidth label="Име" margin="dense" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <TextField fullWidth label="Описание" margin="dense" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <TextField fullWidth type="number" label="Приоритет" margin="dense" inputProps={{ min: 1, max: 5 }} value={formData.priorityLevel} onChange={(e) => setFormData({ ...formData, priorityLevel: e.target.value })} />
          <FormControlLabel control={<Checkbox checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label="Активна" />
          <TextField fullWidth type="number" label="Средна стойност" margin="dense" value={formData.averageValue} onChange={(e) => setFormData({ ...formData, averageValue: e.target.value })} />
          <TextField fullWidth type="number" label="Общо намерени" margin="dense" value={formData.totalItemsFound} onChange={(e) => setFormData({ ...formData, totalItemsFound: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Отказ</Button>
          <Button onClick={handleSave} variant="contained">Запази</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
