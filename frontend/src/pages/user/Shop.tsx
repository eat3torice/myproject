// --- START OF FILE Shop.tsx ---

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicProductService } from '../../services/publicProductService';
import { categoryService } from '../../services/categoryService';
import { cartService } from '../../services/cartService';
import { imagesService } from '../../services/imagesService';
import { API_BASE_URL } from '../../config/api';
import './Shop.css';

// --- Interfaces ---
interface ProductVariation {
    PK_Variation: number;
    ProductID: number;
    SKU: string;
    Name: string;
    Price: number;
    Quantity: number;
    Color?: string;
    Material?: string;
    Size?: string;
    Description?: string;
    CategoryID?: number;
}

interface Category {
    PK_Category: number;
    Name: string;
    Description?: string;
}

interface Image {
    PK_Images: number;
    ProductID?: number;
    VariationID?: number;
    Id_Image: string;
    Set_Default: boolean;
}

// --- Icons (Inline SVG) ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;

// --- Helper Functions ---
const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;

    // Loại bỏ dấu / thừa ở cuối URL gốc và đầu path ảnh
    const cleanBase = API_BASE_URL.replace(/\/+$/, '');

    if (imagePath.startsWith('/static/')) {
        return `${cleanBase}${imagePath}`;
    }
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `${cleanBase}/static/images/${cleanPath}`;
};

const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function Shop() {
    // --- State ---
    const [products, setProducts] = useState<ProductVariation[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartVariations, setCartVariations] = useState<number[]>([]);
    const [productImages, setProductImages] = useState<{ [key: number]: Image[] }>({});
    const [addingToCart, setAddingToCart] = useState<number | null>(null);

    const navigate = useNavigate();

    // --- Effects ---
    useEffect(() => {
        loadProducts();
        loadCategories();
        if (localStorage.getItem('token')) {
            loadCart();
        }
    }, []);

    useEffect(() => {
        loadProductsByCategory();
    }, [selectedCategory]);

    // --- Data Loading ---
    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadImages = async (variations: ProductVariation[]) => {
        const imagesMap: { [key: number]: Image[] } = {};
        for (const variation of variations) {
            try {
                const images = await imagesService.getImagesByVariation(variation.PK_Variation);
                imagesMap[variation.PK_Variation] = images;
            } catch (error) {
                imagesMap[variation.PK_Variation] = [];
            }
        }
        setProductImages(imagesMap);
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await publicProductService.getAll(0, 50);
            setProducts(data);
            await loadImages(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProductsByCategory = async () => {
        setLoading(true);
        try {
            const data = await publicProductService.getByCategory(selectedCategory || undefined, 0, 50);
            setProducts(data);
            await loadImages(data);
        } catch (error) {
            console.error('Error loading products by category:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCart = async () => {
        try {
            const items = await cartService.getCart();
            const variationIds = items.map((i: any) => i.VariationID).filter((v: any) => v !== undefined && v !== null);
            setCartVariations(variationIds);
        } catch (error) {
            // ignore
        }
    };

    // --- Handlers ---
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (!searchTerm.trim()) {
            loadProducts();
            return;
        }
        try {
            const data = await publicProductService.search(searchTerm);
            setProducts(data);
            await loadImages(data);
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (variationId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn chặn chuyển trang khi bấm nút Add
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        if (cartVariations.includes(variationId)) return;

        setAddingToCart(variationId);
        try {
            await cartService.addItem(variationId, 1);
            setCartVariations((prev) => [...prev, variationId]);
            setTimeout(() => setAddingToCart(null), 1000); // Reset state sau 1s
        } catch (error: any) {
            setAddingToCart(null);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                alert('Failed to add to cart');
            }
        }
    };

    // --- Skeleton Render ---
    const renderSkeleton = () => (
        <div className="product-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="product-card skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-text title"></div>
                    <div className="skeleton-text price"></div>
                </div>
            ))}
        </div>
    );

    // --- Main Render ---
    return (
        <div className="shop-wrapper">
            {/* Header */}
            <header className="shop-navbar">
                <div className="container nav-container">
                    <Link to="/" className="brand-logo">
                        <span className="logo-text">SHOPPY</span>
                        <span className="logo-dot">.</span>
                    </Link>

                    <div className="search-container">
                        <form onSubmit={handleSearch}>
                            <SearchIcon />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>
                    </div>

                    <nav className="nav-links">
                        <Link to="/shop" className="active">Shop</Link>
                        <Link to="/orders">Orders</Link>
                        <div className="nav-actions">
                            <Link to="/profile" className="icon-link"><UserIcon /></Link>
                            <Link to="/cart" className="icon-link cart-badge-wrap">
                                <CartIcon />
                                {cartVariations.length > 0 && <span className="cart-badge">{cartVariations.length}</span>}
                            </Link>
                            {localStorage.getItem('token') ? (
                                <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="btn-logout">
                                    Logout
                                </button>
                            ) : (
                                <Link to="/login" className="btn-login">Login</Link>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            {!selectedCategory && !searchTerm && (
                <section className="shop-hero">
                    <div className="container hero-content">
                        <h2>New Season Arrivals</h2>
                        <p>Check out all the new trends for this season with up to 50% off.</p>
                    </div>
                </section>
            )}

            <main className="container shop-main-layout">
                {/* Sidebar */}
                <aside className="shop-sidebar">
                    <div className="sidebar-section">
                        <div className="sidebar-header">
                            <FilterIcon />
                            <h3>Categories</h3>
                        </div>
                        <div className="category-menu">
                            <button
                                className={`cat-btn ${selectedCategory === null ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                All Products
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.PK_Category}
                                    className={`cat-btn ${selectedCategory === cat.PK_Category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.PK_Category)}
                                >
                                    {cat.Name}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <div className="shop-content-area">
                    <div className="products-toolbar">
                        <div className="toolbar-left">
                            <h1>{selectedCategory ? categories.find(c => c.PK_Category === selectedCategory)?.Name : 'All Products'}</h1>
                            <span className="product-count">{products.length} items found</span>
                        </div>
                    </div>

                    {loading ? renderSkeleton() : (
                        <div className="product-grid">
                            {products.length === 0 ? (
                                <div className="empty-state">
                                    <h3>No products found</h3>
                                    <p>Try changing your search or category.</p>
                                    <button onClick={() => { setSearchTerm(''); setSelectedCategory(null); loadProducts(); }}>Clear Filters</button>
                                </div>
                            ) : (
                                products.map((product) => {
                                    const images = productImages[product.PK_Variation] || [];
                                    const defaultImage = images.find(img => img.Set_Default) || images[0];
                                    const imageUrl = defaultImage ? getImageUrl(defaultImage.Id_Image) : '';

                                    const isAdded = cartVariations.includes(product.PK_Variation);
                                    const isAdding = addingToCart === product.PK_Variation;
                                    const isOutOfStock = product.Quantity === 0;

                                    return (
                                        <div key={product.PK_Variation} className="product-card" onClick={() => navigate(`/variation/${product.PK_Variation}`)}>
                                            <div className="card-image-wrap">
                                                {isOutOfStock && <span className="badge badge-stock">Sold Out</span>}
                                                {!isOutOfStock && Math.random() > 0.8 && <span className="badge badge-new">New</span>}

                                                {defaultImage ? (
                                                    <>
                                                        <img
                                                            src={imageUrl}
                                                            alt={product.Name}
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                // Nếu ảnh lỗi, ẩn ảnh đi, placeholder bên dưới sẽ hiện ra
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                const placeholder = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                                                if (placeholder) placeholder.style.display = 'flex';
                                                            }}
                                                        />
                                                        {/* Placeholder này mặc định ẩn, chỉ hiện qua onError ở trên hoặc CSS */}
                                                        <div className="placeholder-img" style={{ display: 'none' }}><span>No Image</span></div>
                                                    </>
                                                ) : (
                                                    <div className="placeholder-img"><span>No Image</span></div>
                                                )}

                                                {!isOutOfStock && (
                                                    <div className="card-overlay">
                                                        <button
                                                            className={`btn-quick-add ${isAdded ? 'added' : ''}`}
                                                            onClick={(e) => handleAddToCart(product.PK_Variation, e)}
                                                            disabled={isAdded || isAdding}
                                                        >
                                                            {isAdding ? 'Adding...' : isAdded ? 'In Cart' : 'Quick Add'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="card-info">
                                                <p className="card-category">{categories.find(c => c.PK_Category === product.CategoryID)?.Name || 'Product'}</p>
                                                <h3 className="card-title" title={product.Name}>{product.Name}</h3>
                                                <div className="card-bottom">
                                                    <div className="price-wrap">
                                                        <span className="price">{formatPrice(product.Price)}</span>
                                                    </div>
                                                    {product.Color && (
                                                        <span
                                                            className="color-dot"
                                                            style={{ backgroundColor: product.Color.toLowerCase(), border: '1px solid #ddd' }}
                                                            title={product.Color}
                                                        ></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}