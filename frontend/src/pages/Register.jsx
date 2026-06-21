import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerThunk } from '../store/slices/authSlice';
import './pages.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerThunk(form));
    if (result.meta.requestStatus === 'fulfilled') navigate('/clientes');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Crear cuenta</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="form-label">Usuario</label>
          <input className="input-auth" name="username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
          <label className="form-label">Contraseña (mín. 6 caracteres)</label>
          <input className="input-auth" name="password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
          <button className="btn-auth" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
        </form>
        <p className="auth-footer">¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
      </div>
    </div>
  );
}
