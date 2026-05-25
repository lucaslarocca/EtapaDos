import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getGestores, crearGestor, actualizarGestor, eliminarGestor } from '../../api/gestores';

export const fetchGestores = createAsyncThunk('gestores/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getGestores();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addGestor = createAsyncThunk('gestores/add', async (data, { rejectWithValue }) => {
  try {
    return await crearGestor(data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateGestor = createAsyncThunk('gestores/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await actualizarGestor(id, data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeGestor = createAsyncThunk('gestores/remove', async (id, { rejectWithValue }) => {
  try {
    await eliminarGestor(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const gestoresSlice = createSlice({
  name: 'gestores',
  initialState: {
    lista:   [],
    loading: false,
    error:   null,
  },
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchGestores
      .addCase(fetchGestores.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchGestores.fulfilled, (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchGestores.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })
      // addGestor
      .addCase(addGestor.pending,       (state) => { state.loading = true;  state.error = null; })
      .addCase(addGestor.fulfilled,     (state, action) => { state.loading = false; state.lista.push(action.payload); })
      .addCase(addGestor.rejected,      (state, action) => { state.loading = false; state.error = action.payload; })
      // updateGestor
      .addCase(updateGestor.pending,    (state) => { state.loading = true;  state.error = null; })
      .addCase(updateGestor.fulfilled,  (state, action) => {
        state.loading = false;
        const index = state.lista.findIndex(g => g.id === action.payload.id);
        if (index !== -1) state.lista[index] = action.payload;
      })
      .addCase(updateGestor.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })
      // removeGestor
      .addCase(removeGestor.pending,    (state) => { state.loading = true;  state.error = null; })
      .addCase(removeGestor.fulfilled,  (state, action) => {
        state.loading = false;
        state.lista = state.lista.filter(g => g.id !== action.payload);
      })
      .addCase(removeGestor.rejected,   (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError } = gestoresSlice.actions;
export default gestoresSlice.reducer;
