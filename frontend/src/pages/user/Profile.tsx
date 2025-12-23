// --- START OF FILE Profile.tsx ---

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { cartService } from '../../services/cartService';
import { authService } from '../../services/authService';
import './Profile.css';

// Reused Icons
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;

interface UserProfile {
    PK_Customer: number;
    Name: string;
    Phone?: string;
    Address?: string;
    Status?: string;
}

export default function Profile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
    const navigate = useNavigate();

    useEffect(() => {
        loadProfile();
        loadCartCount();
    }, []);

    const loadCartCount = async () => {
        try {
            const items = await cartService.getCart();
            setCartCount(items.length);
        } catch (error) { }
    };

    const loadProfile = async () => {
        try {
            const data = await userService.getProfile();
            setProfile(data);
            setFormData({
                name: data.Name || '',
                phone: data.Phone || '',
                address: data.Address || '',
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Trim all inputs
        const trimmedData = {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
        };

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

        try {
            await userService.updateProfile(trimmedData);
            await loadProfile();
            setEditing(false);
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    };

    if (loading) return <div className="profile-wrapper loading-state"><div className="spinner"></div></div>;

    return (
        <div className="profile-wrapper">
            <header className="shop-navbar">
                <div className="container nav-container">
                    <Link to="/" className="brand-logo">
                        <span className="logo-text">SHOPPY</span><span className="logo-dot">.</span>
                    </Link>
                    <nav className="nav-links">
                        <Link to="/shop">Shop</Link>
                        <Link to="/orders">Orders</Link>
                        <Link to="/profile" className="active">Profile</Link>
                        <Link to="/cart" className="icon-link cart-badge-wrap">
                            <CartIcon />
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container profile-main">
                <div className="profile-card-centered">
                    {!profile ? (
                        <div className="error-state">Profile not found</div>
                    ) : (
                        <>
                            <div className="profile-hero">
                                <div className="avatar-circle">
                                    {getInitials(profile.Name)}
                                </div>
                                <h2>{profile.Name}</h2>
                                <span className={`status-pill ${profile.Status?.toLowerCase()}`}>
                                    {profile.Status || 'Active'}
                                </span>
                            </div>

                            <div className="profile-content">
                                {!editing ? (
                                    <div className="view-mode">
                                        <div className="info-group">
                                            <label>Full Name</label>
                                            <div className="info-value">{profile.Name}</div>
                                        </div>
                                        <div className="info-group">
                                            <label>Phone Number</label>
                                            <div className="info-value">{profile.Phone || 'Not set'}</div>
                                        </div>
                                        <div className="info-group">
                                            <label>Shipping Address</label>
                                            <div className="info-value">{profile.Address || 'Not set'}</div>
                                        </div>

                                        <button className="btn-primary-full" onClick={() => setEditing(true)}>
                                            Edit Profile
                                        </button>

                                        <button className="btn-secondary-full" onClick={() => {
                                            authService.logout();
                                        }}>
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="edit-form">
                                        <div className="form-field">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                minLength={6}
                                                maxLength={100}
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                pattern="\d{9,15}"
                                                minLength={9}
                                                maxLength={15}
                                                placeholder="0123456789"
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Address</label>
                                            <textarea
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                rows={3}
                                                maxLength={500}
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn-save">
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}