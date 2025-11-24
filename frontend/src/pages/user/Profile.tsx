import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import './Profile.css';

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
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

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
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userService.updateProfile(formData);
            await loadProfile();
            setEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="loading">Loading profile...</div>;

    return (
        <div className="profile-container">
            <header className="profile-header">
                <Link to="/shop" className="back-link">
                    ← Back to Shop
                </Link>
                <h1>My Profile</h1>
            </header>

            <main className="profile-main">
                {!profile ? (
                    <div className="no-profile">
                        <p>Profile not found</p>
                    </div>
                ) : (
                    <div className="profile-card">
                        {!editing ? (
                            <>
                                <div className="profile-info">
                                    <div className="info-row">
                                        <span className="label">Name:</span>
                                        <span className="value">{profile.Name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Phone:</span>
                                        <span className="value">{profile.Phone || 'Not set'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Address:</span>
                                        <span className="value">{profile.Address || 'Not set'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Status:</span>
                                        <span className={`status ${profile.Status?.toLowerCase()}`}>
                                            {profile.Status}
                                        </span>
                                    </div>
                                </div>
                                <button className="btn-edit" onClick={() => setEditing(true)}>
                                    Edit Profile
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address: e.target.value })
                                        }
                                        rows={3}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-save">
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
