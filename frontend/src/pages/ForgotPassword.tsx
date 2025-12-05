import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import './Auth.css';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: verify identity, 2: reset password
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        new_password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleVerifyIdentity = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/user/verify-identity', {
                username: formData.username,
                phone: formData.phone
            });
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Username or phone number is incorrect');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.new_password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        if (formData.new_password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/user/reset-password', {
                username: formData.username,
                phone: formData.phone,
                new_password: formData.new_password
            });
            alert('Password reset successfully! Please login with your new password.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Forgot Password</h2>

                {step === 1 ? (
                    <>
                        <p className="auth-subtitle">Enter your username and phone number to verify your identity</p>
                        <form onSubmit={handleVerifyIdentity}>
                            {error && <div className="error-message">{error}</div>}

                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    placeholder="0123456789"
                                />
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify Identity'}
                            </button>

                            <div className="auth-links">
                                <a href="/login">Back to Login</a>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <p className="auth-subtitle">Enter your new password</p>
                        <form onSubmit={handleResetPassword}>
                            {error && <div className="error-message">{error}</div>}

                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={formData.new_password}
                                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                    required
                                    minLength={6}
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={formData.confirm_password}
                                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>

                            <div className="auth-links">
                                <a href="/login">Back to Login</a>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
