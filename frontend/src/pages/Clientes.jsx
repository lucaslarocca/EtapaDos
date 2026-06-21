import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientes, addCliente } from '../store/slices/clientesSlice';
import './pages.css';

export default function Clientes() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.clientes);
  const [form, setForm] = useState({ dni: '', nombre: '' });

  useEffect(() => { dispatch(fetchClientes()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(addCliente(form));
    if (result.meta.requestStatus === 'fulfilled') setForm({ dni: '', nombre: '' });
  };

  return (
    <div className="page page-sm">
      <h2 className="page-title">Clientes</h2>

      <div className="card">
        <h3>Nuevo cliente</h3>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="form-row">
          <input className="input-flex" placeholder="DNI" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} required />
          <input className="input-flex" placeholder="Nombre completo" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
          <button className="btn" disabled={loading}>{loading ? 'Guardando...' : 'Agregar'}</button>
        </form>
      </div>

      <div className="card">
        <h3>Lista de clientes ({lista.length})</h3>
        {loading && <p className="empty">Cargando...</p>}
        {!loading && lista.length === 0 && <p className="empty">No hay clientes registrados.</p>}
        {lista.length > 0 && (
          <table className="table">
            <thead><tr><th>DNI</th><th>Nombre</th></tr></thead>
            <tbody>
              {lista.map(c => (
                <tr key={c.dni}><td>{c.dni}</td><td>{c.nombre}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
