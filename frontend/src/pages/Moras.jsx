import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMoras,
  fetchMorasPorCredito,
  fetchMorasPorCliente,
  fetchMorasPorEstado,
  fetchMorasPorGestor,
  addMora,
  asignarGestorMora,
  cambiarEstadoMora,
  removeMora,
  clearError,
} from '../store/slices/morasSlice';
import './pages.css';

const ESTADOS = ['PENDIENTE', 'EN_GESTION', 'REGULARIZADA', 'INCOBRABLE'];

const BADGE_CLASS = {
  PENDIENTE:    'badge-pendiente',
  EN_GESTION:   'badge-en-gestion',
  REGULARIZADA: 'badge-regularizada',
  INCOBRABLE:   'badge-incobrable',
};

const FORM_MORA_VACIO   = { idCredito: '', motivo: '', observaciones: '' };
const FORM_GESTOR_VACIO = { idGestor: '' };
const FORM_ESTADO_VACIO = { estado: 'PENDIENTE', observaciones: '' };

export default function Moras() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.moras);

  const [tipoBusqueda,  setTipoBusqueda]  = useState('todas');
  const [valorBusqueda, setValorBusqueda] = useState('');
  const [buscado,       setBuscado]       = useState(false);

  const [formMora, setFormMora] = useState(FORM_MORA_VACIO);

  const [accionActiva, setAccionActiva] = useState(null);
  const [formGestor,   setFormGestor]   = useState(FORM_GESTOR_VACIO);
  const [formEstado,   setFormEstado]   = useState(FORM_ESTADO_VACIO);

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    let result;
    switch (tipoBusqueda) {
      case 'credito': result = await dispatch(fetchMorasPorCredito(valorBusqueda)); break;
      case 'cliente': result = await dispatch(fetchMorasPorCliente(valorBusqueda)); break;
      case 'estado':  result = await dispatch(fetchMorasPorEstado(valorBusqueda));  break;
      case 'gestor':  result = await dispatch(fetchMorasPorGestor(valorBusqueda));  break;
      default:        result = await dispatch(fetchMoras());                        break;
    }
    if (result.meta.requestStatus === 'fulfilled') setBuscado(true);
  };

  const handleSubmitMora = async (e) => {
    e.preventDefault();
    const payload = { ...formMora, idCredito: Number(formMora.idCredito) };
    const result = await dispatch(addMora(payload));
    if (result.meta.requestStatus === 'fulfilled') setFormMora(FORM_MORA_VACIO);
  };

  const abrirAccion = (id, tipo) => {
    if (accionActiva?.id === id && accionActiva?.tipo === tipo) {
      setAccionActiva(null);
    } else {
      setAccionActiva({ id, tipo });
      setFormGestor(FORM_GESTOR_VACIO);
      setFormEstado(FORM_ESTADO_VACIO);
      dispatch(clearError());
    }
  };

  const handleAsignarGestor = async (id) => {
    const result = await dispatch(asignarGestorMora({ id, data: { idGestor: Number(formGestor.idGestor) } }));
    if (result.meta.requestStatus === 'fulfilled') {
      setAccionActiva(null);
      setFormGestor(FORM_GESTOR_VACIO);
    }
  };

  const handleCambiarEstado = async (id) => {
    const result = await dispatch(cambiarEstadoMora({ id, data: formEstado }));
    if (result.meta.requestStatus === 'fulfilled') {
      setAccionActiva(null);
      setFormEstado(FORM_ESTADO_VACIO);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar esta mora?')) return;
    dispatch(removeMora(id));
  };

  return (
    <div className="page page-xl">
      <h2 className="page-title">Moras</h2>

      {/* Sección 1 — Buscar */}
      <div className="card">
        <h3>Buscar moras</h3>
        <form onSubmit={buscar} className="form-row">
          <select className="select" value={tipoBusqueda} onChange={e => { setTipoBusqueda(e.target.value); setValorBusqueda(''); }}>
            <option value="todas">Todas</option>
            <option value="credito">Por ID de crédito</option>
            <option value="cliente">Por DNI de cliente</option>
            <option value="estado">Por estado</option>
            <option value="gestor">Por ID de gestor</option>
          </select>

          {tipoBusqueda === 'estado' ? (
            <select className="select" value={valorBusqueda} onChange={e => setValorBusqueda(e.target.value)} required>
              <option value="">— Elegir estado —</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          ) : tipoBusqueda !== 'todas' ? (
            <input
              className="input-flex"
              placeholder={tipoBusqueda === 'credito' ? 'ID del crédito' : tipoBusqueda === 'cliente' ? 'DNI del cliente' : 'ID del gestor'}
              value={valorBusqueda}
              onChange={e => setValorBusqueda(e.target.value)}
              required
            />
          ) : null}

          <button className="btn">Buscar</button>
        </form>
      </div>

      {/* Sección 2 — Nueva mora */}
      <div className="card">
        <h3>Registrar mora nueva</h3>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmitMora} className="form-grid">
          <input
            className="input"
            placeholder="ID del crédito"
            type="number"
            value={formMora.idCredito}
            onChange={e => setFormMora({ ...formMora, idCredito: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Motivo"
            value={formMora.motivo}
            onChange={e => setFormMora({ ...formMora, motivo: e.target.value })}
            required
          />
          <input
            className="input span-2"
            placeholder="Observaciones (opcional)"
            value={formMora.observaciones}
            onChange={e => setFormMora({ ...formMora, observaciones: e.target.value })}
          />
          <button className="btn span-2" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar mora'}
          </button>
        </form>
      </div>

      {/* Sección 3 — Resultados */}
      {buscado && (
        <div className="card">
          <h3>Resultados ({lista.length})</h3>
          {loading && <p className="empty">Cargando...</p>}
          {!loading && lista.length === 0 && <p className="empty">No se encontraron moras.</p>}
          {lista.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  {['ID','Crédito','Cliente','Gestor','Fecha','Motivo','Estado','Acciones'].map(h => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((m) => (
                  <>
                    <tr key={m.id}>
                      <td className="td">#{m.id}</td>
                      <td className="td">#{m.idCredito}</td>
                      <td className="td">{m.nombreCliente}<br /><small className="text-dni">{m.dniCliente}</small></td>
                      <td className="td">{m.nombreGestor ?? <span className="sin-gestor">Sin asignar</span>}</td>
                      <td className="td">{m.fechaRegistro}</td>
                      <td className="td">{m.motivo}</td>
                      <td className="td">
                        <span className={`badge ${BADGE_CLASS[m.estado]}`}>{m.estado}</span>
                      </td>
                      <td className="td">
                        <div className="actions">
                          <button className="btn-action btn-action-blue"   onClick={() => abrirAccion(m.id, 'gestor')}>Gestor</button>
                          <button className="btn-action btn-action-purple" onClick={() => abrirAccion(m.id, 'estado')}>Estado</button>
                          {m.estado === 'PENDIENTE' && (
                            <button className="btn-action btn-action-red" onClick={() => handleEliminar(m.id)}>Eliminar</button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {accionActiva?.id === m.id && accionActiva?.tipo === 'gestor' && (
                      <tr key={`${m.id}-gestor`}>
                        <td colSpan={8} className="td-expanded">
                          <div className="form-inline">
                            <strong>Asignar gestor:</strong>
                            <input
                              className="input-small"
                              placeholder="ID del gestor"
                              type="number"
                              value={formGestor.idGestor}
                              onChange={e => setFormGestor({ idGestor: e.target.value })}
                            />
                            <button className="btn-confirm" onClick={() => handleAsignarGestor(m.id)}>Confirmar</button>
                            <button className="btn-cancel"  onClick={() => setAccionActiva(null)}>Cancelar</button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {accionActiva?.id === m.id && accionActiva?.tipo === 'estado' && (
                      <tr key={`${m.id}-estado`}>
                        <td colSpan={8} className="td-expanded">
                          <div className="form-inline">
                            <strong>Cambiar estado:</strong>
                            <select
                              className="select-small"
                              value={formEstado.estado}
                              onChange={e => setFormEstado({ ...formEstado, estado: e.target.value })}
                            >
                              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                            <input
                              className="input-small input-small-wide"
                              placeholder="Observaciones"
                              value={formEstado.observaciones}
                              onChange={e => setFormEstado({ ...formEstado, observaciones: e.target.value })}
                            />
                            <button className="btn-confirm" onClick={() => handleCambiarEstado(m.id)}>Confirmar</button>
                            <button className="btn-cancel"  onClick={() => setAccionActiva(null)}>Cancelar</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
