import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const roles = [
  {
    id: 'user',
    label: 'Buyer',
    icon: '🛍️',
    description: 'Browse and purchase products from our marketplace.',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  {
    id: 'seller',
    label: 'Seller',
    icon: '🏪',
    description: 'List your products and manage your store.',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
  },
];

const Register = () => {
  const [step, setStep] = useState('register');
  const [tempToken, setTempToken] = useState('');
  const [otp, setOtp] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await register(name, email, password, selectedRole);
    setLoading(false);
    if (result.success) {
      setTempToken(result.tempToken);
      setStep('otp');
      if (result.otp) {
        setOtp(result.otp); // Auto-fill for development
      }
    } else {
      setError(result.error);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await verifyOtp(tempToken, otp);
    setLoading(false);
    if (result.success) {
      if (selectedRole === 'seller') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
    }
  };

  const activeRole = roles.find((r) => r.id === selectedRole);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .reg-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: #0f0f1a;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .reg-page::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
          top: -200px;
          right: -200px;
          pointer-events: none;
        }

        .reg-page::after {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%);
          bottom: -100px;
          left: -100px;
          pointer-events: none;
        }

        .reg-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5);
          backdrop-filter: blur(20px);
          position: relative;
          z-index: 1;
        }

        .reg-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .reg-title {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.5px;
        }

        .reg-subtitle {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.45);
          margin: 0;
        }

        .role-section-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 0.75rem;
        }

        .role-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.75rem;
        }

        .role-card {
          border-radius: 14px;
          padding: 1rem 0.5rem;
          text-align: center;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .role-card:hover {
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-2px);
          background: rgba(255,255,255,0.06);
        }

        .role-card.active {
          border-color: transparent;
          transform: translateY(-2px);
        }

        .role-card.active::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 2px;
          background: var(--role-gradient);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .role-card.active .role-bg {
          opacity: 0.15;
        }

        .role-bg {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .role-icon {
          font-size: 1.75rem;
          display: block;
          margin-bottom: 0.4rem;
          position: relative;
          z-index: 1;
        }

        .role-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #fff;
          position: relative;
          z-index: 1;
          display: block;
        }

        .role-desc {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.4);
          margin-top: 0.25rem;
          line-height: 1.4;
          position: relative;
          z-index: 1;
        }

        .check-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #fff;
          z-index: 2;
        }

        .form-group {
          margin-bottom: 1.1rem;
        }

        .form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 0.95rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .form-input::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .form-input:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: rgba(255,255,255,0.07);
        }

        .error-box {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #f87171;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .submit-btn {
          width: 100%;
          padding: 0.875rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          color: #fff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s;
          margin-top: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-link {
          text-align: center;
          margin-top: 1.25rem;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.4);
        }

        .login-link a {
          color: #818cf8;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .login-link a:hover {
          color: #a5b4fc;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 1.5rem 0;
        }
      `}</style>

      <div className="reg-page">
        <div className="reg-card">
          <div className="reg-header">
            <h1 className="reg-title">Create Account</h1>
            <p className="reg-subtitle">Join our marketplace — choose your role to get started</p>
          </div>

          {/* Role Selection */}
          <p className="role-section-label">I want to join as</p>
          <div className="role-cards">
            {roles.map((role) => {
              const isActive = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  className={`role-card ${isActive ? 'active' : ''}`}
                  style={{ '--role-gradient': role.gradient }}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div
                    className="role-bg"
                    style={{ background: role.gradient, opacity: isActive ? 0.12 : 0 }}
                  />
                  {isActive && (
                    <div
                      className="check-badge"
                      style={{ background: role.gradient }}
                    >
                      ✓
                    </div>
                  )}
                  <span className="role-icon">{role.icon}</span>
                  <span className="role-label" style={{ color: isActive ? role.color : '#fff' }}>
                    {role.label}
                  </span>
                  <p className="role-desc">{role.description}</p>
                </div>
              );
            })}
          </div>

          <div className="divider" />

          {/* Form */}
          {error && (
            <div className="error-box">
              <span>⚠️</span> {error}
            </div>
          )}

          {step === 'register' ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-input"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  className="form-input"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                id="reg-submit"
                type="submit"
                className="submit-btn"
                style={{ background: activeRole.gradient }}
                disabled={loading}
              >
                {loading && <span className="spinner" />}
                {loading ? 'Creating Account...' : `Register as ${activeRole.label}`}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <label className="form-label">Verify OTP</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem', lineHeight: '1.4' }}>
                  A verification code has been sent to your email address (<b>{email}</b>). Please check your inbox and spam folder.
                </p>
              </div>
              <button
                type="submit"
                className="submit-btn"
                style={{ background: activeRole.gradient }}
                disabled={loading}
              >
                {loading && <span className="spinner" />}
                {loading ? 'Verifying...' : 'Verify Email & Create Account'}
              </button>
            </form>
          )}

          <p className="login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
