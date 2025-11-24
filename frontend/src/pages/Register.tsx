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


        // Validate all fields >= 6 chars
        const requiredFields = [
            { label: 'Username', value: formData.username },
            { label: 'Password', value: formData.password },
            { label: 'Confirm Password', value: formData.confirmPassword },
            { label: 'Full Name', value: formData.name },
        ];
        for (const field of requiredFields) {
            if (!field.value || field.value.length < 6) {
                alert(`${field.label} must be at least 6 characters.`);
                return;
            }
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (formData.password.length > 50) {
            alert('Password is too long. Maximum 50 characters allowed.');
            return;
        }

        // Phone must be at least 9 digits if provided
        if (formData.phone && formData.phone.length < 9) {
            alert('Phone number must be at least 9 digits.');
            return;
        }

        setLoading(true);
        try {
            await userService.register({
                username: formData.username,
                password: formData.password,
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
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
                        />
                    </div>
                    <div className="form-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password *</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
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
