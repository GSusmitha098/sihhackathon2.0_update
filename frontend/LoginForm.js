import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';

const LoginForm = ({ actor, onRegisterClick, onLoginSuccess, setError: setParentError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const displayActor = actor
    ? actor.charAt(0).toUpperCase() + actor.slice(1)
    : 'User';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (!actor) {
      setError('User type is not specified');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await loginUser(actor, email, password);
      console.log('Login response:', response.data);

      if (response.data && response.data.token) {
        // Save token
        localStorage.setItem('token', response.data.token);

        // Save specific IDs for migrant, admin, hospital, etc.
        const userData = response.data[actor];
        if (userData?._id) {
          localStorage.setItem(`${actor}Id`, userData._id);
        }

        // Notify parent (App) so it can update its state and navigate
        if (onLoginSuccess) {
          try {
            onLoginSuccess(userData || {});
          } catch (err) {
            console.warn('onLoginSuccess threw', err);
          }
        } else {
          // Fallback navigation if parent didn't provide callback
          switch (actor) {
            case 'migrant':
              navigate('/migrant-dashboard');
              break;
            case 'admin':
              navigate('/admin-dashboard');
              break;
            case 'hospital':
              navigate('/hospital-dashboard');
              break;
            default:
              navigate('/loginselection');
              break;
          }
        }
      } else {
        const msg = response.data?.msg || 'Invalid email or password';
        setError(msg);
        if (setParentError) setParentError(msg);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Server error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: 'auto',
        marginTop: 80,
        padding: 40,
        borderRadius: 10,
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        backgroundColor: '#f5f6fa',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
      }}
    >
      <h2 style={{ marginBottom: 30, color: '#2c3e50' }}>
        Login as {displayActor}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div style={{ marginBottom: 20, textAlign: 'left' }}>
          <label>Email:</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginTop: 5,
              borderRadius: 6,
              border: '1px solid #ccc',
            }}
          />
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: 20, textAlign: 'left' }}>
          <label>Password:</label>
          <br />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                flex: 1,
                padding: '10px',
                marginTop: 5,
                borderRadius: 6,
                border: '1px solid #ccc',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                marginLeft: 10,
                padding: '10px 15px',
                border: 'none',
                borderRadius: 6,
                backgroundColor: '#2980b9',
                color: '#fff',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = '#3498db')
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = '#2980b9')
              }
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && <p style={{ color: 'red', marginBottom: 10 }}>{error}</p>}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: 6,
            backgroundColor: loading ? '#95a5a6' : '#27ae60',
            color: '#fff',
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) =>
            !loading && (e.target.style.backgroundColor = '#2ecc71')
          }
          onMouseLeave={(e) =>
            !loading && (e.target.style.backgroundColor = '#27ae60')
          }
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Register link */}
      <p style={{ marginTop: 20 }}>
        No account?{' '}
        <button
          onClick={onRegisterClick}
          style={{
            color: '#2980b9',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Register here
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
