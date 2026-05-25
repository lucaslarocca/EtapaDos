import { configureStore } from '@reduxjs/toolkit';
import authReducer      from './slices/authSlice';
import clientesReducer  from './slices/clientesSlice';
import creditosReducer  from './slices/creditosSlice';
import cobranzasReducer from './slices/cobranzasSlice';
import gestoresReducer  from './slices/gestoresSlice';
import morasReducer     from './slices/morasSlice';

const store = configureStore({
  reducer: {
    auth:      authReducer,
    clientes:  clientesReducer,
    creditos:  creditosReducer,
    cobranzas: cobranzasReducer,
    gestores:  gestoresReducer,
    moras:     morasReducer,
  },
});

export default store;
