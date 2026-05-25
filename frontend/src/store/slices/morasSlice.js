import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getMoras,
  getMorasPorCredito,
  getMorasPorCliente,
  getMorasPorEstado,
  getMorasPorGestor,
  crearMora,
  asignarGestor,
  actualizarEstadoMora,
  eliminarMora,
} from '../../api/moras';

export const fetchMoras = createAsyncThunk('moras/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getMoras();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMorasPorCredito = createAsyncThunk('moras/fetchByCredito', async (idCredito, { rejectWithValue }) => {
  try {
    return await getMorasPorCredito(idCredito);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMorasPorCliente = createAsyncThunk('moras/fetchByCliente', async (dni, { rejectWithValue }) => {
  try {
    return await getMorasPorCliente(dni);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMorasPorEstado = createAsyncThunk('moras/fetchByEstado', async (estado, { rejectWithValue }) => {
  try {
    return await getMorasPorEstado(estado);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMorasPorGestor = createAsyncThunk('moras/fetchByGestor', async (idGestor, { rejectWithValue }) => {
  try {
    return await getMorasPorGestor(idGestor);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addMora = createAsyncThunk('moras/add', async (data, { rejectWithValue }) => {
  try {
    return await crearMora(data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const asignarGestorMora = createAsyncThunk('moras/asignarGestor', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await asignarGestor(id, data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const cambiarEstadoMora = createAsyncThunk('moras/cambiarEstado', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await actualizarEstadoMora(id, data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeMora = createAsyncThunk('moras/remove', async (id, { rejectWithValue }) => {
  try {
    await eliminarMora(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// Helper: reemplaza una mora en la lista por la versión actualizada que devuelve el backend
const reemplazarMora = (state, action) => {
  state.loading = false;
  const index = state.lista.findIndex(m => m.id === action.payload.id);
  if (index !== -1) state.lista[index] = action.payload;
};

const morasSlice = createSlice({
  name: 'moras',
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
      // fetchMoras
      .addCase(fetchMoras.pending,              (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchMoras.fulfilled,            (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchMoras.rejected,             (state, action) => { state.loading = false; state.error = action.payload; })
      // fetchMorasPorCredito
      .addCase(fetchMorasPorCredito.pending,    (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchMorasPorCredito.fulfilled,  (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchMorasPorCredito.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })
      // fetchMorasPorCliente
      .addCase(fetchMorasPorCliente.pending,    (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchMorasPorCliente.fulfilled,  (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchMorasPorCliente.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })
      // fetchMorasPorEstado
      .addCase(fetchMorasPorEstado.pending,     (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchMorasPorEstado.fulfilled,   (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchMorasPorEstado.rejected,    (state, action) => { state.loading = false; state.error = action.payload; })
      // fetchMorasPorGestor
      .addCase(fetchMorasPorGestor.pending,     (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchMorasPorGestor.fulfilled,   (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchMorasPorGestor.rejected,    (state, action) => { state.loading = false; state.error = action.payload; })
      // addMora
      .addCase(addMora.pending,                 (state) => { state.loading = true;  state.error = null; })
      .addCase(addMora.fulfilled,               (state, action) => { state.loading = false; state.lista.push(action.payload); })
      .addCase(addMora.rejected,                (state, action) => { state.loading = false; state.error = action.payload; })
      // asignarGestorMora
      .addCase(asignarGestorMora.pending,       (state) => { state.loading = true;  state.error = null; })
      .addCase(asignarGestorMora.fulfilled,     reemplazarMora)
      .addCase(asignarGestorMora.rejected,      (state, action) => { state.loading = false; state.error = action.payload; })
      // cambiarEstadoMora
      .addCase(cambiarEstadoMora.pending,       (state) => { state.loading = true;  state.error = null; })
      .addCase(cambiarEstadoMora.fulfilled,     reemplazarMora)
      .addCase(cambiarEstadoMora.rejected,      (state, action) => { state.loading = false; state.error = action.payload; })
      // removeMora
      .addCase(removeMora.pending,              (state) => { state.loading = true;  state.error = null; })
      .addCase(removeMora.fulfilled,            (state, action) => {
        state.loading = false;
        state.lista = state.lista.filter(m => m.id !== action.payload);
      })
      .addCase(removeMora.rejected,             (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError } = morasSlice.actions;
export default morasSlice.reducer;
