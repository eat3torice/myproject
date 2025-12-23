import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './AdminLogin.css';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Trim inputs
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        // Validate username
        if (!trimmedUsername) {
            setError('Username is required.');
            return;
        }
        if (trimmedUsername.length < 6) {
            setError('Username must be at least 6 characters.');
            return;
        }
        if (trimmedUsername.length > 50) {
            setError('Username must not exceed 50 characters.');
            return;
        }

        // Validate password
        if (!trimmedPassword) {
            setError('Password is required.');
            return;
        }
        if (trimmedPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.login({
                username: trimmedUsername,
                password: trimmedPassword
            });

            // Check if user has admin or employee role (role_id = 1 for ADMIN, 18 for EMPLOYEE)
            if (response.role_id !== 1 && response.role_id !== 18) {
                setError('Access denied. Only Admin and Employee accounts can access the admin panel.');
                return;
            }

            authService.setToken(response.access_token);
            // Store role information for role-based UI
            localStorage.setItem('userRole', response.role_id.toString());
            navigate('/admin');
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Login failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <h1>Admin Login</h1>
                    <p>Access to Administrative Dashboard</p>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={6}
                            maxLength={50}
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="current-password"
                        />
                    </div>
                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
