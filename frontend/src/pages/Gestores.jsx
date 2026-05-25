import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGestores,
  addGestor,
  updateGestor,
  removeGestor,
  clearError,
} from '../store/slices/gestoresSlice';

const FORM_VACIO = { nombre: '', email: '' };

export default function Gestores() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.gestores);

  const [form, setForm]         = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null); // null = modo crear

  useEffect(() => {
    dispatch(fetchGestores());
  }, [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (editandoId !== null) {
      result = await dispatch(updateGestor({ id: editandoId, data: form }));
    } else {
      result = await dispatch(addGestor(form));
    }
    if (result.meta.requestStatus === 'fulfilled') {
      setForm(FORM_VACIO);
      setEditandoId(null);
    }
  };

  const handleEditar = (gestor) => {
    setForm({ nombre: gestor.nombre, email: gestor.email });
    setEditandoId(gestor.id);
    dispatch(clearError());
  };

  const handleCancelar = () => {
    setForm(FORM_VACIO);
    setEditandoId(null);
    dispatch(clearError());
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este gestor?')) return;
    dispatch(removeGestor(id));
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Gestores</h2>

      {/* Formulario crear / editar */}
      <div style={styles.card}>
        <h3>{editandoId !== null ? `Editando gestor #${editandoId}` : 'Nuevo gestor'}</h3>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <button style={styles.btn} disabled={loading}>
            {loading ? 'Guardando...' : editandoId !== null ? 'Guardar cambios' : 'Agregar'}
          </button>
          {editandoId !== null && (
            <button type="button" style={styles.btnSecundario} onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* Tabla */}
      <div style={styles.card}>
        <h3>Lista de gestores ({lista.length})</h3>
        {loading && <p style={styles.empty}>Cargando...</p>}
        {!loading && lista.length === 0 && <p style={styles.empty}>No hay gestores registrados.</p>}
        {lista.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((g) => (
                <tr key={g.id} style={editandoId === g.id ? styles.filaEditando : undefined}>
                  <td style={styles.td}>{g.id}</td>
                  <td style={styles.td}>{g.nombre}</td>
                  <td style={styles.td}>{g.email}</td>
                  <td style={styles.td}>
                    <button style={styles.btnEditar}  onClick={() => handleEditar(g)}>Editar</button>
                    <button style={styles.btnEliminar} onClick={() => handleEliminar(g.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:         { padding: '32px', maxWidth: '860px', margin: '0 auto' },
  title:        { color: '#1e3a5f', marginBottom: '24px' },
  card:         { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '24px' },
  form:         { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  input:        { padding: '10px', border: '1px solid #ccc', borderRadius: '6px', flex: '1', minWidth: '180px' },
  btn:          { padding: '10px 20px', backgroundColor: '#1e3a5f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnSecundario:{ padding: '10px 20px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnEditar:    { padding: '6px 14px', backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '0.85rem' },
  btnEliminar:  { padding: '6px 14px', backgroundColor: '#c62828', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  error:        { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem' },
  empty:        { color: '#999' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #e0e0e0', color: '#1e3a5f' },
  td:           { padding: '10px 12px', borderBottom: '1px solid #f0f0f0' },
  filaEditando: { backgroundColor: '#e3f2fd' },
};
