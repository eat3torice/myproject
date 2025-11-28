// --- START OF FILE VariationDetail.tsx ---

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { variationService } from '../../services/variationService';
import { imagesService } from '../../services/imagesService';
import { cartService } from '../../services/cartService'; // Import cartService
import { API_BASE_URL } from '../../config/api';
import type { Variation } from '../../types';
import './VariationDetail.css';

// Reuse Icons
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

// Helper for image URLs
const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanBase = API_BASE_URL.replace(/\/+$/, '');
    if (imagePath.startsWith('/static/')) return `${cleanBase}${imagePath}`;
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `${cleanBase}/static/images/${cleanPath}`;
};

export default function VariationDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State
    const [variation, setVariation] = useState<Variation | null>(null);
    const [images, setImages] = useState<any[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [addSuccess, setAddSuccess] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top on load
        loadVariation();
        loadCartCount();
    }, [id]);

    const loadCartCount = async () => {
        try {
            if (localStorage.getItem('token')) {
                const items = await cartService.getCart();
                setCartCount(items.length);
            }
        } catch (error) { }
    };

    const loadVariation = async () => {
        setLoading(true);
        try {
            const varId = Number(id);
            const data = await variationService.getById(varId);
            setVariation(data);

            const imgs = await imagesService.getImagesByVariation(varId);
            setImages(imgs);

            // Set default image
            if (imgs.length > 0) {
                const defaultImg = imgs.find((i: any) => i.Set_Default) || imgs[0];
                setSelectedImage(getImageUrl(defaultImg.Id_Image));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setIsAdding(true);
        try {
            // Check if quantity is valid
            if (variation && quantity > variation.Quantity) {
                alert('Not enough stock available');
                return;
            }

            await cartService.addItem(Number(id), quantity);
            setAddSuccess(true);
            loadCartCount(); // Update badge
            setTimeout(() => setAddSuccess(false), 2000);
        } catch (error: any) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                alert('Failed to add to cart');
            }
        } finally {
            setIsAdding(false);
        }
    };

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => {
            const newVal = prev + delta;
            if (newVal < 1) return 1;
            if (variation && newVal > variation.Quantity) return variation.Quantity;
            return newVal;
        });
    };

    // --- Loading State ---
    if (loading) {
        return (
            <div className="shop-wrapper loading-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!variation) {
        return (
            <div className="shop-wrapper error-center">
                <h2>Product not found</h2>
                <Link to="/shop" className="btn-primary">Back to Shop</Link>
            </div>
        );
    }

    const isOutOfStock = variation.Quantity === 0;

    return (
        <div className="shop-wrapper">
            {/* Header Reused (Minimal version for detail page) */}
            <header className="shop-navbar">
                <div className="container nav-container">
                    <Link to="/" className="brand-logo">
                        <span className="logo-text">SHOPPY</span><span className="logo-dot">.</span>
                    </Link>
                    <nav className="nav-links">
                        <Link to="/shop">Shop</Link>
                        <Link to="/cart" className="icon-link cart-badge-wrap">
                            <CartIcon />
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container detail-main">
                <div className="breadcrumb">
                    <Link to="/shop" className="back-link">
                        <ArrowLeftIcon /> Back to Shop
                    </Link>
                </div>

                <div className="product-detail-grid">
                    {/* Left Column: Images */}
                    <div className="product-gallery">
                        <div className="main-image-frame">
                            {selectedImage ? (
                                <img src={selectedImage} alt={variation.Name} className="main-image" />
                            ) : (
                                <div className="no-image-placeholder">No Image Available</div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="thumbnail-strip">
                                {images.map((img) => {
                                    const url = getImageUrl(img.Id_Image);
                                    return (
                                        <div
                                            key={img.PK_Images}
                                            className={`thumbnail ${selectedImage === url ? 'active' : ''}`}
                                            onClick={() => setSelectedImage(url)}
                                        >
                                            <img src={url} alt="thumbnail" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Info & Actions */}
                    <div className="product-info-panel">
                        <div className="product-header-info">
                            <h1 className="product-title-large">{variation.Name}</h1>
                            <div className="sku-tag">SKU: {variation.SKU}</div>

                            <div className="price-row">
                                <span className="current-price">${Number(variation.Price).toFixed(2)}</span>
                                {variation.Quantity > 0 ? (
                                    <span className="stock-badge in-stock">In Stock</span>
                                ) : (
                                    <span className="stock-badge out-stock">Out of Stock</span>
                                )}
                            </div>
                        </div>

                        <div className="description-section">
                            <p>{variation.Description || 'No description available for this product.'}</p>
                        </div>

                        <div className="specs-grid">
                            <div className="spec-item">
                                <span className="spec-label">Color</span>
                                <span className="spec-value">
                                    {variation.Color ? (
                                        <span className="color-preview">
                                            <span className="dot" style={{ backgroundColor: variation.Color.toLowerCase() }}></span>
                                            {variation.Color}
                                        </span>
                                    ) : 'N/A'}
                                </span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Material</span>
                                <span className="spec-value">{variation.Material || 'N/A'}</span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Size</span>
                                <span className="spec-value">{variation.Size || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="action-box">
                            {!isOutOfStock && (
                                <div className="quantity-selector">
                                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>−</button>
                                    <input type="text" readOnly value={quantity} />
                                    <button onClick={() => handleQuantityChange(1)} disabled={quantity >= variation.Quantity}>+</button>
                                </div>
                            )}

                            <button
                                className={`btn-add-large ${addSuccess ? 'success' : ''}`}
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || isAdding || addSuccess}
                            >
                                {addSuccess ? (
                                    <><CheckIcon /> Added to Cart</>
                                ) : isAdding ? (
                                    'Adding...'
                                ) : isOutOfStock ? (
                                    'Out of Stock'
                                ) : (
                                    'Add to Cart'
                                )}
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="trust-badges">
                            <div className="trust-item">
                                <span>🛡️</span> Genuine Product
                            </div>
                            <div className="trust-item">
                                <span>🚚</span> Fast Delivery
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}