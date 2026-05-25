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

const ESTADOS = ['PENDIENTE', 'EN_GESTION', 'REGULARIZADA', 'INCOBRABLE'];

const COLOR_ESTADO = {
  PENDIENTE:    { bg: '#fff3e0', color: '#e65100' },
  EN_GESTION:   { bg: '#e3f2fd', color: '#1565c0' },
  REGULARIZADA: { bg: '#e8f5e9', color: '#2e7d32' },
  INCOBRABLE:   { bg: '#ffebee', color: '#c62828' },
};

const FORM_MORA_VACIO   = { idCredito: '', motivo: '', observaciones: '' };
const FORM_GESTOR_VACIO = { idGestor: '' };
const FORM_ESTADO_VACIO = { estado: 'PENDIENTE', observaciones: '' };

export default function Moras() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.moras);

  // Búsqueda
  const [tipoBusqueda,  setTipoBusqueda]  = useState('todas');
  const [valorBusqueda, setValorBusqueda] = useState('');
  const [buscado,       setBuscado]       = useState(false);

  // Formulario nueva mora
  const [formMora, setFormMora] = useState(FORM_MORA_VACIO);

  // Acciones inline en la tabla: { id, tipo: 'gestor' | 'estado' } o null
  const [accionActiva,  setAccionActiva]  = useState(null);
  const [formGestor,    setFormGestor]    = useState(FORM_GESTOR_VACIO);
  const [formEstado,    setFormEstado]    = useState(FORM_ESTADO_VACIO);

  // ─── Búsqueda ────────────────────────────────────────────────────────────────

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

  // ─── Nueva mora ──────────────────────────────────────────────────────────────

  const handleSubmitMora = async (e) => {
    e.preventDefault();
    const payload = { ...formMora, idCredito: Number(formMora.idCredito) };
    const result = await dispatch(addMora(payload));
    if (result.meta.requestStatus === 'fulfilled') setFormMora(FORM_MORA_VACIO);
  };

  // ─── Acciones inline ─────────────────────────────────────────────────────────

  const abrirAccion = (id, tipo) => {
    if (accionActiva?.id === id && accionActiva?.tipo === tipo) {
      setAccionActiva(null); // toggle: cierra si ya está abierta
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

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Moras</h2>

      {/* Sección 1 — Buscar */}
      <div style={styles.card}>
        <h3>Buscar moras</h3>
        <form onSubmit={buscar} style={styles.row}>
          <select style={styles.select} value={tipoBusqueda} onChange={e => { setTipoBusqueda(e.target.value); setValorBusqueda(''); }}>
            <option value="todas">Todas</option>
            <option value="credito">Por ID de crédito</option>
            <option value="cliente">Por DNI de cliente</option>
            <option value="estado">Por estado</option>
            <option value="gestor">Por ID de gestor</option>
          </select>

          {tipoBusqueda === 'estado' ? (
            <select style={styles.select} value={valorBusqueda} onChange={e => setValorBusqueda(e.target.value)} required>
              <option value="">— Elegir estado —</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          ) : tipoBusqueda !== 'todas' ? (
            <input
              style={styles.input}
              placeholder={tipoBusqueda === 'credito' ? 'ID del crédito' : tipoBusqueda === 'cliente' ? 'DNI del cliente' : 'ID del gestor'}
              value={valorBusqueda}
              onChange={e => setValorBusqueda(e.target.value)}
              required
            />
          ) : null}

          <button style={styles.btn}>Buscar</button>
        </form>
      </div>

      {/* Sección 2 — Nueva mora */}
      <div style={styles.card}>
        <h3>Registrar mora nueva</h3>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmitMora} style={styles.grid}>
          <input
            style={styles.input}
            placeholder="ID del crédito"
            type="number"
            value={formMora.idCredito}
            onChange={e => setFormMora({ ...formMora, idCredito: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Motivo"
            value={formMora.motivo}
            onChange={e => setFormMora({ ...formMora, motivo: e.target.value })}
            required
          />
          <input
            style={{ ...styles.input, gridColumn: 'span 2' }}
            placeholder="Observaciones (opcional)"
            value={formMora.observaciones}
            onChange={e => setFormMora({ ...formMora, observaciones: e.target.value })}
          />
          <button style={{ ...styles.btn, gridColumn: 'span 2' }} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar mora'}
          </button>
        </form>
      </div>

      {/* Sección 3 — Resultados */}
      {buscado && (
        <div style={styles.card}>
          <h3>Resultados ({lista.length})</h3>
          {loading && <p style={styles.empty}>Cargando...</p>}
          {!loading && lista.length === 0 && <p style={styles.empty}>No se encontraron moras.</p>}
          {lista.length > 0 && (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['ID','Crédito','Cliente','Gestor','Fecha','Motivo','Estado','Acciones'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((m) => (
                  <>
                    <tr key={m.id}>
                      <td style={styles.td}>#{m.id}</td>
                      <td style={styles.td}>#{m.idCredito}</td>
                      <td style={styles.td}>{m.nombreCliente}<br /><small style={styles.dni}>{m.dniCliente}</small></td>
                      <td style={styles.td}>{m.nombreGestor ?? <span style={styles.sinGestor}>Sin asignar</span>}</td>
                      <td style={styles.td}>{m.fechaRegistro}</td>
                      <td style={styles.td}>{m.motivo}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...COLOR_ESTADO[m.estado] }}>{m.estado}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.acciones}>
                          <button
                            style={{ ...styles.btnAccion, backgroundColor: '#1565c0' }}
                            onClick={() => abrirAccion(m.id, 'gestor')}
                          >
                            Gestor
                          </button>
                          <button
                            style={{ ...styles.btnAccion, backgroundColor: '#6a1b9a' }}
                            onClick={() => abrirAccion(m.id, 'estado')}
                          >
                            Estado
                          </button>
                          {m.estado === 'PENDIENTE' && (
                            <button
                              style={{ ...styles.btnAccion, backgroundColor: '#c62828' }}
                              onClick={() => handleEliminar(m.id)}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Fila expandida: asignar gestor */}
                    {accionActiva?.id === m.id && accionActiva?.tipo === 'gestor' && (
                      <tr key={`${m.id}-gestor`}>
                        <td colSpan={8} style={styles.tdExpandido}>
                          <div style={styles.formInline}>
                            <strong>Asignar gestor:</strong>
                            <input
                              style={styles.inputChico}
                              placeholder="ID del gestor"
                              type="number"
                              value={formGestor.idGestor}
                              onChange={e => setFormGestor({ idGestor: e.target.value })}
                            />
                            <button style={styles.btnConfirmar} onClick={() => handleAsignarGestor(m.id)}>Confirmar</button>
                            <button style={styles.btnCancelar}  onClick={() => setAccionActiva(null)}>Cancelar</button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Fila expandida: cambiar estado */}
                    {accionActiva?.id === m.id && accionActiva?.tipo === 'estado' && (
                      <tr key={`${m.id}-estado`}>
                        <td colSpan={8} style={styles.tdExpandido}>
                          <div style={styles.formInline}>
                            <strong>Cambiar estado:</strong>
                            <select
                              style={styles.selectChico}
                              value={formEstado.estado}
                              onChange={e => setFormEstado({ ...formEstado, estado: e.target.value })}
                            >
                              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                            <input
                              style={{ ...styles.inputChico, minWidth: '220px' }}
                              placeholder="Observaciones"
                              value={formEstado.observaciones}
                              onChange={e => setFormEstado({ ...formEstado, observaciones: e.target.value })}
                            />
                            <button style={styles.btnConfirmar} onClick={() => handleCambiarEstado(m.id)}>Confirmar</button>
                            <button style={styles.btnCancelar}  onClick={() => setAccionActiva(null)}>Cancelar</button>
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

const styles = {
  page:        { padding: '32px', maxWidth: '1100px', margin: '0 auto' },
  title:       { color: '#1e3a5f', marginBottom: '24px' },
  card:        { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '24px' },
  row:         { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  grid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input:       { padding: '10px', border: '1px solid #ccc', borderRadius: '6px', width: '100%', boxSizing: 'border-box' },
  inputChico:  { padding: '8px', border: '1px solid #ccc', borderRadius: '6px', minWidth: '120px' },
  select:      { padding: '10px', border: '1px solid #ccc', borderRadius: '6px', minWidth: '180px' },
  selectChico: { padding: '8px', border: '1px solid #ccc', borderRadius: '6px' },
  btn:         { padding: '10px 20px', backgroundColor: '#1e3a5f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' },
  btnConfirmar:{ padding: '7px 14px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnCancelar: { padding: '7px 14px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnAccion:   { padding: '5px 10px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  acciones:    { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  error:       { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem' },
  empty:       { color: '#999' },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th:          { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #e0e0e0', color: '#1e3a5f', whiteSpace: 'nowrap' },
  td:          { padding: '10px 12px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'top' },
  tdExpandido: { padding: '0', backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' },
  formInline:  { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', padding: '12px 16px' },
  badge:       { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' },
  dni:         { color: '#9e9e9e' },
  sinGestor:   { color: '#bdbdbd', fontStyle: 'italic' },
};
