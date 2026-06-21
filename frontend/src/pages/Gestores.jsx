import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGestores,
  addGestor,
  updateGestor,
  removeGestor,
  clearError,
} from '../store/slices/gestoresSlice';
import './pages.css';

const FORM_VACIO = { nombre: '', email: '' };

export default function Gestores() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.gestores);

  const [form, setForm]             = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);

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
    <div className="page page-lg">
      <h2 className="page-title">Gestores</h2>

      <div className="card">
        <h3>{editandoId !== null ? `Editando gestor #${editandoId}` : 'Nuevo gestor'}</h3>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="form-row">
          <input
            className="input-flex"
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <input
            className="input-flex"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <button className="btn" disabled={loading}>
            {loading ? 'Guardando...' : editandoId !== null ? 'Guardar cambios' : 'Agregar'}
          </button>
          {editandoId !== null && (
            <button type="button" className="btn-secondary" onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="card">
        <h3>Lista de gestores ({lista.length})</h3>
        {loading && <p className="empty">Cargando...</p>}
        {!loading && lista.length === 0 && <p className="empty">No hay gestores registrados.</p>}
        {lista.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th className="th">ID</th>
                <th className="th">Nombre</th>
                <th className="th">Email</th>
                <th className="th">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((g) => (
                <tr key={g.id} className={editandoId === g.id ? 'row-editing' : ''}>
                  <td className="td">{g.id}</td>
                  <td className="td">{g.nombre}</td>
                  <td className="td">{g.email}</td>
                  <td className="td">
                    <button className="btn-edit"   onClick={() => handleEditar(g)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleEliminar(g.id)}>Eliminar</button>
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
