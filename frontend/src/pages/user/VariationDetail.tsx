import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { variationService } from '../../services/variationService';
import { imagesService } from '../../services/imagesService';
import { API_BASE_URL } from '../../config/api';
import type { Variation } from '../../types';
import './VariationDetail.css';
import './Shop.css';

export default function VariationDetail() {
    const { id } = useParams<{ id: string }>();
    const [variation, setVariation] = useState<Variation | null>(null);
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadVariation();
    }, [id]);

    const loadVariation = async () => {
        setLoading(true);
        try {
            const data = await variationService.getById(Number(id));
            setVariation(data);
            const imgs = await imagesService.getImagesByVariation(Number(id));
            setImages(imgs);
        } catch (error) {
            alert('Failed to load variation detail');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container">Loading...</div>;
    if (!variation) return <div className="loading-container">Variation not found</div>;

    return (
        <div className="shop-container">
            <header className="shop-header">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <h1>E-Shop</h1>
                    </Link>
                    <nav className="main-nav">
                        <Link to="/shop">Shop</Link>
                        <Link to="/cart">Cart</Link>
                        <Link to="/orders">My Orders</Link>
                        <Link to="/profile">Profile</Link>
                        {localStorage.getItem('token') ? (
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    navigate('/login');
                                }}
                                className="logout-btn"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link to="/login" className="login-link">Login</Link>
                        )}
                    </nav>
                </div>
            </header>

            <main className="shop-main">
                <div className="variation-detail-container">
                    <Link to="/shop" className="back-link">&larr; Back to Shop</Link>
                    <div className="variation-detail-card">
                        <h1>{variation.Name}</h1>
                        <div className="variation-images">
                            {images.length > 0 ? (
                                images.map((img) => {
                                    const imageUrl = img.Id_Image.startsWith('/static/')
                                        ? `${API_BASE_URL}${img.Id_Image}`
                                        : `${API_BASE_URL}/static/images/${img.Id_Image}`;
                                    return (
                                        <img
                                            key={img.PK_Images}
                                            src={imageUrl}
                                            alt={variation.Name}
                                            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginRight: '12px' }}
                                        />
                                    );
                                })
                            ) : (
                                <div className="no-image">No images</div>
                            )}
                        </div>
                        <div className="variation-info">
                            <div><strong>SKU:</strong> {variation.SKU}</div>
                            <div><strong>Price:</strong> ${variation.Price}</div>
                            <div><strong>Quantity:</strong> {variation.Quantity}</div>
                            <div><strong>Color:</strong> {variation.Color || 'N/A'}</div>
                            <div><strong>Material:</strong> {variation.Material || 'N/A'}</div>
                            <div><strong>Size:</strong> {variation.Size || 'N/A'}</div>
                            <div><strong>Description:</strong> {variation.Description || 'N/A'}</div>
                            <div><strong>Status:</strong> {variation.Status || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
