import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import { login } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const portal = params.get('portal');

  
  async function handleSubmit(event) {
      event.preventDefault();
      setError('');
      setLoading(true);

      try {
          const user = await login(username, password);

          console.log('Authenticated user:', user);
          console.log('User role:', user.role);

          // Survivor portal
          if (user.role === 'SURVIVOR') {
              navigate('/survivor', { replace: true });
          }

          // Verified rescue team portal
          else if (
              user.role === 'RESCUE_TEAM' &&
              user.is_verified === true
          ) {
              navigate('/rescue', { replace: true });
          }

          // Administrator portal
          else if (user.role === 'ADMIN') {
              navigate('/admin-dashboard', { replace: true });
          }

          else {
              setError('Your account does not have permission to access this portal.');
          }

      } catch (err) {
          console.error('Login error:', err);

          const detail =
              err.response?.data?.detail ||
              err.response?.data?.non_field_errors?.[0] ||
              err.message;

          setError(
              detail || 'Login failed. Check your username and password.'
          );

      } finally {
          setLoading(false);
      }
  }


  return <div className="auth-page"><div className="auth-left"><nav><Brand light /></nav><div className="auth-message"><div className="eyebrow"><span className="live-dot"/> RESQMAP RESPONSE NETWORK</div><h1>Prepared communities.<br/><em>Coordinated response.</em></h1><p>Reliable information helps communities and rescue teams make better decisions when it matters most.</p><div className="auth-points"><span>✓ &nbsp; Location-based reporting</span><span>✓ &nbsp; Shared disaster updates</span><span>✓ &nbsp; Connected response teams</span></div></div><div className="auth-foot">RESQMAP · DISASTER RESPONSE NETWORK</div></div>
    <div className="auth-right"><Link to="/" className="back-home">← Back to homepage</Link><div className="login-box"><div className="login-symbol">↗</div><div className="eyebrow">WELCOME BACK</div><h2>Sign in to ResQMap</h2><p className="login-desc">Access your dedicated disaster response workspace.</p>{portal && <div className="portal-hint">{portal === 'rescue' ? 'Rescue team' : 'Survivor'} portal selected. Your account role determines your dashboard.</div>}
      <form onSubmit={handleSubmit}><label htmlFor="username">Username</label><input id="username" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter your username" required/><div className="password-label"><label htmlFor="password">Password</label></div><div className="password-wrap"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div>{error && <div className="form-error" role="alert">{error}</div>}<button className="btn btn-primary submit-btn" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <span>→</span></button></form>
      <div className="login-help">New to ResQMap? <Link to="/register">Create a survivor account</Link></div><div className="secure-note">Your account is protected with secure authentication.</div></div></div></div>;
}
