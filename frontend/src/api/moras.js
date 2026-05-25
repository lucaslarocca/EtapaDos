import { api } from './apiClient';

export const getMoras              = ()               => api.get('/moras');
export const getMora               = (id)             => api.get(`/moras/${id}`);
export const getMorasPorCredito    = (idCredito)      => api.get(`/moras/credito/${idCredito}`);
export const getMorasPorCliente    = (dni)            => api.get(`/moras/cliente/${dni}`);
export const getMorasPorEstado     = (estado)         => api.get(`/moras/estado/${estado}`);
export const getMorasPorGestor     = (idGestor)       => api.get(`/moras/gestor/${idGestor}`);
export const crearMora             = (data)           => api.post('/moras', data);
export const asignarGestor         = (id, data)       => api.put(`/moras/${id}/gestor`, data);
export const actualizarEstadoMora  = (id, data)       => api.put(`/moras/${id}/estado`, data);
export const eliminarMora          = (id)             => api.delete(`/moras/${id}`);
