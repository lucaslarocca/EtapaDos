import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCobranzasPorCredito, addCobranza, clearCobranzas } from '../store/slices/cobranzasSlice';
import './pages.css';

export default function Cobranzas() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.cobranzas);
  const [idCredito, setIdCredito] = useState('');
  const [buscado, setBuscado]     = useState(false);
  const [form, setForm]           = useState({ idCredito:'', idCuota:'', importe:'' });

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCobranzas());
    const result = await dispatch(fetchCobranzasPorCredito(idCredito));
    if (result.meta.requestStatus === 'fulfilled') setBuscado(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { idCredito: Number(form.idCredito), idCuota: Number(form.idCuota), importe: Number(form.importe) };
    const result = await dispatch(addCobranza(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ idCredito:'', idCuota:'', importe:'' });
      if (String(form.idCredito) === idCredito) dispatch(fetchCobranzasPorCredito(idCredito));
    }
  };

  return (
    <div className="page page-sm">
      <h2 className="page-title">Cobranzas</h2>

      <div className="card">
        <h3>Buscar cobranzas por crédito</h3>
        <form onSubmit={buscar} className="form-row">
          <input className="input-flex" placeholder="ID del crédito" type="number" value={idCredito} onChange={e => setIdCredito(e.target.value)} required />
          <button className="btn">Buscar</button>
        </form>
      </div>

      <div className="card">
        <h3>Registrar pago de cuota</h3>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="form-row">
          <input className="input-flex" placeholder="ID crédito" type="number" value={form.idCredito} onChange={e => setForm({...form, idCredito: e.target.value})} required />
          <input className="input-flex" placeholder="Nro. cuota"  type="number" min="1" value={form.idCuota}   onChange={e => setForm({...form, idCuota: e.target.value})}   required />
          <input className="input-flex" placeholder="Importe"     type="number" value={form.importe}    onChange={e => setForm({...form, importe: e.target.value})}    required />
          <button className="btn" disabled={loading}>{loading ? 'Registrando...' : 'Registrar'}</button>
        </form>
      </div>

      {buscado && (
        <div className="card">
          <h3>Cobranzas del crédito #{idCredito} ({lista.length})</h3>
          {loading && <p className="empty">Cargando...</p>}
          {!loading && lista.length === 0 && <p className="empty">Sin cobranzas registradas.</p>}
          {lista.length > 0 && (
            <table className="table">
              <thead><tr><th>ID</th><th>Crédito</th><th>Cuota</th><th>Importe</th></tr></thead>
              <tbody>
                {lista.map(c => (
                  <tr key={c.id}><td>#{c.id}</td><td>{c.idCredito}</td><td>{c.idCuota}</td><td>${c.importe}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
