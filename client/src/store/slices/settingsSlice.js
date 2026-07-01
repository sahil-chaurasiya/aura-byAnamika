import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSettings = createAsyncThunk('settings/fetch', async () => {
  const { data } = await api.get('/settings/public');
  return data.data;
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    data: {
      store_name: 'Aura by Anamika',
      logo: '/assets/img/logo.png',
      primary_color: '#EF2853',
      currency_symbol: '$',
      announcement_text: '🌟 Free shipping on orders over $100!',
    },
    loaded: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSettings.fulfilled, (state, action) => {
      state.data = { ...state.data, ...action.payload };
      state.loaded = true;
    });
  },
});

export const selectSettings = state => state.settings.data;
export default settingsSlice.reducer;