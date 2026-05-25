import { api } from './apiClient';

export const getGestores       = ()          => api.get('/gestores');
export const getGestor         = (id)        => api.get(`/gestores/${id}`);
export const crearGestor       = (data)      => api.post('/gestores', data);
export const actualizarGestor  = (id, data)  => api.put(`/gestores/${id}`, data);
export const eliminarGestor    = (id)        => api.delete(`/gestores/${id}`);
