import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import { getUserIdFromToken } from '../utils/tokenUtils';

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
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    dateFoundOrLost: dayjs(),
    estimatedValue: 0,
    categoryId: '',
    isClaimed: false
  });

  const [searchFilters, setSearchFilters] = useState({
    name: '',
    location: ''
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

const fetchCategories = useCallback(async () => {
  try {
    const response = await api.get('/category/search', {
      params: {
        pageNumber: 1,
        pageSize: 1000
      }
    });

    const rawList = response.data.categories?.$values || response.data.categories || [];
    setCategories(rawList);
    console.log('📦 Заредени категории за предмети:', rawList);
  } catch (err) {
    console.error('Error fetching categories:', err);
    setCategories([]);
  }
}, []);


const fetchItems = useCallback(async (pageNumber = page + 1, filters = searchFilters) => {
  setLoading(true);
  try {
    const response = await api.get('/item/search', {
      params: {
        name: filters.name,
        location: filters.location,
        pageNumber,
        pageSize
      }
    });

    console.log("🟡 RAW item response:", response.data);

 const rawList = (response.data.items?.$values || response.data.items || []).map((item) => ({
  ...item,
  id: item.id || item.Id,
  category: item.category || null // 🛡 гарантираме, че съществува
}));


    console.log("🔍 rawList details:", rawList.map(i => ({ id: i.id, Id: i.Id, name: i.name })));
    console.log("🟢 Декодирани предмети:", rawList);

    setItems(rawList);
    setTotalCount(response.data.totalItems || rawList.length); 
  } catch (err) {
    console.error('🔴 Error loading items:', err);
    setItems([]);
    setTotalCount(0);
  } finally {
    setLoading(false);
  }
}, [page, pageSize, searchFilters]);

  const handleSearch = () => {
    setPage(0);
    fetchItems(1, searchFilters);
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchItems(page + 1);
  }, [fetchItems, page, pageSize]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/item/${id}`);
      setItems(items.filter(item => item.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const openCreateForm = () => {
    setEditItem(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      dateFoundOrLost: dayjs(),
      estimatedValue: 0,
      categoryId: '',
      isClaimed: false
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      location: item.location,
      dateFoundOrLost: dayjs(item.dateFoundOrLost),
      estimatedValue: item.estimatedValue,
      categoryId: item.categoryId,
      isClaimed: item.isClaimed
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
  try {
    const userId = getUserIdFromToken();
    if (!userId) {
      alert('Грешка: невалиден потребител. Влез отново.');
      return;
    }

    const payload = {
      ...formData,
      dateFoundOrLost: formData.dateFoundOrLost.toISOString(),
      userId // 🟢 задължително!
    };

    if (editItem) {
      await api.put(`/item/${editItem.id}`, { ...editItem, ...payload });
    } else {
      await api.post('/item', payload);
    }

    setFormOpen(false);
    fetchItems();
  } catch (err) {
    console.error('Пълна грешка при запис:', err);
    if (err.response) {
      console.error('🔴 Статус:', err.response.status);
      console.error('📝 Данни:', err.response.data);
    } else {
      console.error('❌ Грешка извън отговора:', err.message);
    }
    alert(`Грешка при запис: ${err.response?.data?.message || 'Нещо се обърка.'}`);
  }
};


  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Име', width: 150 },
    { field: 'description', headerName: 'Описание', width: 200 },
    { field: 'location', headerName: 'Локация', width: 150 },
    { field: 'dateFoundOrLost', headerName: 'Дата', width: 130 },
    { field: 'estimatedValue', headerName: 'Стойност', width: 100 },
    {
      field: 'isClaimed',
      headerName: 'Приет',
      width: 100,
      renderCell: (params) => (params.value ? 'Да' : 'Не')
    },
  {
  field: 'category',
  headerName: 'Категория',
  width: 150,
  valueGetter: (params) => {
    try {
      return params.row.category?.name || '-';
    } catch (e) {
      console.warn('⚠️ Проблем с категория:', params.row);
      return '-';
    }
  }
},
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Действия',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Редактирай"
          onClick={() => openEditForm(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Изтрий"
          onClick={() => setDeleteId(params.id)}
          color="error"
        />
      ]
    }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Списък с предмети
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          id="search-name"
          label="Име"
          value={searchFilters.name}
          onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
        />
        <TextField
          id="search-location"
          label="Локация"
          value={searchFilters.location}
          onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
        />
        <Button variant="outlined" onClick={handleSearch}>Търси</Button>
        <Button
          variant="text"
          onClick={() => {
            setSearchFilters({ name: '', location: '' });
            setPage(0);
            fetchItems(1, { name: '', location: '' });
          }}
        >
          Изчисти
        </Button>
      </Box>

      <Button variant="contained" sx={{ mb: 2 }} onClick={openCreateForm}>
        Добави предмет
      </Button>

   <DataGrid
  rows={items}
  columns={columns}
  autoHeight
  pageSize={pageSize}
  paginationMode="server"
  rowCount={totalCount}
  page={page}
  onPageChange={(newPage) => setPage(newPage)}
  onPageSizeChange={(newSize) => setPageSize(newSize)}
  disableSelectionOnClick
  getRowId={(row) => row.id || row.Id} // 💡 това е критично!
  loading={loading}
/>




      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Сигурен ли си, че искаш да изтриеш предмета?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отказ</Button>
          <Button onClick={() => handleDelete(deleteId)} color="error">Изтрий</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editItem ? 'Редактирай предмет' : 'Нов предмет'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Попълни данните за предмета.</DialogContentText>

          <TextField
            id="item-name"
            fullWidth
            label="Име"
            margin="dense"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <TextField
            id="item-description"
            fullWidth
            label="Описание"
            margin="dense"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <TextField
            id="item-location"
            fullWidth
            label="Локация"
            margin="dense"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Дата"
              value={formData.dateFoundOrLost}
              onChange={(newDate) => setFormData({ ...formData, dateFoundOrLost: newDate })}
              sx={{ mt: 2, mb: 1, width: '100%' }}
              slotProps={{ textField: { id: 'item-dateFoundOrLost' } }}
            />
          </LocalizationProvider>

          <TextField
            id="item-estimatedValue"
            fullWidth
            label="Оценена стойност"
            type="number"
            margin="dense"
            value={formData.estimatedValue}
            onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
          />

          <TextField
            id="item-category"
            fullWidth
            select
            label="Категория"
            margin="dense"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Няма категории</MenuItem>
            )}
          </TextField>

          <FormControlLabel
            control={
              <Checkbox
                id="item-isClaimed"
                checked={formData.isClaimed}
                onChange={(e) => setFormData({ ...formData, isClaimed: e.target.checked })}
              />
            }
            label="Предметът е прибран"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Отказ</Button>
          <Button onClick={handleSave} variant="contained">
            Запази
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
