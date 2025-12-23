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

        // Trim inputs
        const trimmedUsername = formData.username.trim();
        const trimmedPhone = formData.phone.trim();

        // Validate username
        if (!trimmedUsername) {
            setError('Username is required.');
            return;
        }
        if (trimmedUsername.length < 6) {
            setError('Username must be at least 6 characters.');
            return;
        }

        // Validate phone
        if (!trimmedPhone) {
            setError('Phone number is required.');
            return;
        }
        if (!/^\d+$/.test(trimmedPhone)) {
            setError('Phone number must contain only digits.');
            return;
        }
        if (trimmedPhone.length < 9) {
            setError('Phone number must be at least 9 digits.');
            return;
        }
        if (trimmedPhone.length > 15) {
            setError('Phone number must not exceed 15 digits.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/user/verify-identity', {
                username: trimmedUsername,
                phone: trimmedPhone
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

        // Trim passwords
        const trimmedNewPassword = formData.new_password.trim();
        const trimmedConfirmPassword = formData.confirm_password.trim();

        // Validate new password
        if (!trimmedNewPassword) {
            setError('New password is required.');
            return;
        }
        if (trimmedNewPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (trimmedNewPassword.length > 72) {
            setError('Password must not exceed 72 characters.');
            return;
        }

        // Validate password match
        if (trimmedNewPassword !== trimmedConfirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/user/reset-password', {
                username: formData.username.trim(),
                phone: formData.phone.trim(),
                new_password: trimmedNewPassword
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
                                    minLength={6}
                                    maxLength={50}
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
                                    pattern="\d{9,15}"
                                    minLength={9}
                                    maxLength={15}
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
