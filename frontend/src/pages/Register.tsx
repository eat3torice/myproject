import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/userService';
import './Register.css';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Trim all input fields
        const trimmedData = {
            username: formData.username.trim(),
            password: formData.password.trim(),
            confirmPassword: formData.confirmPassword.trim(),
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
        };

        // Validate username
        if (!trimmedData.username) {
            alert('Username is required.');
            return;
        }
        if (trimmedData.username.length < 6) {
            alert('Username must be at least 6 characters.');
            return;
        }
        if (trimmedData.username.length > 50) {
            alert('Username must not exceed 50 characters.');
            return;
        }
        if (/\s/.test(trimmedData.username)) {
            alert('Username cannot contain spaces.');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmedData.username)) {
            alert('Username can only contain letters, numbers, and underscores.');
            return;
        }

        // Validate password
        if (!trimmedData.password) {
            alert('Password is required.');
            return;
        }
        if (trimmedData.password.length < 6) {
            alert('Password must be at least 6 characters.');
            return;
        }
        if (trimmedData.password.length > 72) {
            alert('Password must not exceed 72 characters.');
            return;
        }

        // Validate confirm password
        if (trimmedData.password !== trimmedData.confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        // Validate name
        if (!trimmedData.name) {
            alert('Full Name is required.');
            return;
        }
        if (trimmedData.name.length < 6) {
            alert('Full Name must be at least 6 characters.');
            return;
        }
        if (trimmedData.name.length > 100) {
            alert('Full Name must not exceed 100 characters.');
            return;
        }

        // Validate phone if provided
        if (trimmedData.phone) {
            if (!/^\d+$/.test(trimmedData.phone)) {
                alert('Phone number must contain only digits.');
                return;
            }
            if (trimmedData.phone.length < 9) {
                alert('Phone number must be at least 9 digits.');
                return;
            }
            if (trimmedData.phone.length > 15) {
                alert('Phone number must not exceed 15 digits.');
                return;
            }
        }

        // Validate address if provided
        if (trimmedData.address && trimmedData.address.length > 500) {
            alert('Address must not exceed 500 characters.');
            return;
        }

        setLoading(true);
        try {
            await userService.register({
                username: trimmedData.username,
                password: trimmedData.password,
                name: trimmedData.name,
                phone: trimmedData.phone,
                address: trimmedData.address,
            });
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error: any) {
            let errorMsg = 'Registration failed';
            if (error.response?.data?.detail) {
                if (Array.isArray(error.response.data.detail)) {
                    // Pydantic validation errors
                    errorMsg = error.response.data.detail.map((d: any) => d.msg).join('\n');
                } else {
                    // Custom backend error
                    errorMsg = error.response.data.detail;
                }
            } else if (error.message) {
                errorMsg = error.message;
            }
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h1>Create Account</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username *</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            minLength={6}
                            maxLength={50}
                            pattern="[a-zA-Z0-9_]+"
                            title="Username must be 6-50 characters and contain only letters, numbers, and underscores"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                            maxLength={72}
                            title="Password must be 6-72 characters"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password *</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            minLength={6}
                            maxLength={72}
                            title="Must match password"
                        />
                    </div>
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            minLength={6}
                            maxLength={100}
                            title="Full name must be 6-100 characters"
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            pattern="\d{9,15}"
                            minLength={9}
                            maxLength={15}
                            title="Phone number must be 9-15 digits"
                            placeholder="0123456789"
                        />
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                            maxLength={500}
                            placeholder="Enter your address (optional)"
                        />
                    </div>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
                <div className="register-footer">
                    <p>
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                    <Link to="/shop" className="link-shop">
                        Continue as Guest
                    </Link>
                </div>
            </div>
        </div>
    );
}
