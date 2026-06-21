import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCreditosPorCliente, addCredito, clearCreditos } from '../store/slices/creditosSlice';
import './pages.css';

export default function Creditos() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.creditos);
  const [dni, setDni]         = useState('');
  const [buscado, setBuscado] = useState(false);
  const [form, setForm]       = useState({ dniCliente:'', deudaOriginal:'', fecha:'', importeCuota:'', cantidadCuotas:'' });

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCreditos());
    const result = await dispatch(fetchCreditosPorCliente(dni));
    if (result.meta.requestStatus === 'fulfilled') setBuscado(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      deudaOriginal:  Number(form.deudaOriginal),
      importeCuota:   Number(form.importeCuota),
      cantidadCuotas: Number(form.cantidadCuotas),
    };
    const result = await dispatch(addCredito(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ dniCliente:'', deudaOriginal:'', fecha:'', importeCuota:'', cantidadCuotas:'' });
      if (form.dniCliente === dni) dispatch(fetchCreditosPorCliente(dni));
    }
  };

  return (
    <div className="page page-md">
      <h2 className="page-title">Créditos</h2>

      <div className="card">
        <h3>Buscar créditos por cliente</h3>
        <form onSubmit={buscar} className="form-row">
          <input className="input-flex" placeholder="DNI del cliente" value={dni} onChange={e => setDni(e.target.value)} required />
          <button className="btn">Buscar</button>
        </form>
      </div>

      <div className="card">
        <h3>Nuevo crédito</h3>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="form-grid">
          <input className="input" placeholder="DNI cliente"    value={form.dniCliente}     onChange={e => setForm({...form, dniCliente: e.target.value})}     required />
          <input className="input" placeholder="Deuda original" value={form.deudaOriginal}  onChange={e => setForm({...form, deudaOriginal: e.target.value})}  type="number" required />
          <input className="input" placeholder="Fecha"          value={form.fecha}          onChange={e => setForm({...form, fecha: e.target.value})}          type="date"   required />
          <input className="input" placeholder="Importe cuota"  value={form.importeCuota}   onChange={e => setForm({...form, importeCuota: e.target.value})}   type="number" required />
          <input className="input" placeholder="Cant. cuotas"   value={form.cantidadCuotas} onChange={e => setForm({...form, cantidadCuotas: e.target.value})} type="number" min="1" required />
          <button className="btn span-2" disabled={loading}>{loading ? 'Guardando...' : 'Crear crédito'}</button>
        </form>
      </div>

      {buscado && (
        <div className="card">
          <h3>Créditos del cliente ({lista.length})</h3>
          {loading && <p className="empty">Cargando...</p>}
          {!loading && lista.length === 0 && <p className="empty">Sin créditos.</p>}
          {lista.map(cr => (
            <div key={cr.id} className="credito-box">
              <p><strong>ID #{cr.id}</strong> — Deuda: ${cr.deudaOriginal} — {cr.cantidadCuotas} cuotas de ${cr.importeCuota}</p>
              <table className="table">
                <thead><tr><th>#</th><th>Vencimiento</th><th>Estado</th></tr></thead>
                <tbody>
                  {cr.cuotas.map(c => (
                    <tr key={c.idCuota}>
                      <td>{c.idCuota}</td>
                      <td>{c.fechaVencimiento}</td>
                      <td className={c.pagada ? 'cuota-pagada' : 'cuota-pendiente'}>{c.pagada ? '✔ Pagada' : '✘ Pendiente'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
