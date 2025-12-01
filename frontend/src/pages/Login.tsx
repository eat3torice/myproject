import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login({ username, password });

            // Check if user is admin or employee, prevent access to user area
            if (response.role_id === 1 || response.role_id === 18) {
                setError('Admin and Employee accounts cannot login to customer area. Please use admin login.');
                return;
            }

            authService.setToken(response.access_token);
            navigate('/shop');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Customer Login</h1>
                <p className="login-subtitle">Login to your account to shop</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="login-footer">
                    <p>
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>
                    <Link to="/shop" className="link-shop">
                        Continue as Guest
                    </Link>
                    <p className="admin-link-wrapper">
                        <Link to="/admin/login" className="admin-link">Admin Login →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
