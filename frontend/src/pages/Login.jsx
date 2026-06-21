import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '../store/slices/authSlice';
import './pages.css';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginThunk(form));
    if (result.meta.requestStatus === 'fulfilled') navigate('/clientes');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Iniciar sesión</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="form-label">Usuario</label>
          <input className="input-auth" name="username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
          <label className="form-label">Contraseña</label>
          <input className="input-auth" name="password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <button className="btn-auth" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
        </form>
        <p className="auth-footer">¿No tenés cuenta? <Link to="/register">Registrate</Link></p>
      </div>
    </div>
  );
}
