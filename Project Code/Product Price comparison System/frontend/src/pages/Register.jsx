import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-card glass-card">
        <h1>Create Account</h1>
        <p>Join PriceHive and start saving money</p>

        {error && <div className="badge badge-danger" style={{ padding: '10px 16px', width: '100%', display: 'block', textAlign: 'center', marginBottom: '1rem', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="register-name">Full Name</label>
            <input id="register-name" className="input" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="input-group">
            <label htmlFor="register-email">Email</label>
            <input id="register-email" className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div className="input-group">
            <label htmlFor="register-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                style={{ width: '100%', paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="register-confirm">Confirm Password</label>
            <input id="register-confirm" className="input" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
