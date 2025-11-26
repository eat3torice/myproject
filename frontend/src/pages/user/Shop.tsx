import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicProductService } from '../../services/publicProductService';
import { categoryService } from '../../services/categoryService';
import { cartService } from '../../services/cartService';
import { imagesService } from '../../services/imagesService';
import { API_BASE_URL } from '../../config/api';
import './Shop.css';

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

export default function Shop() {
    const [products, setProducts] = useState<ProductVariation[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartVariations, setCartVariations] = useState<number[]>([]);
    const [productImages, setProductImages] = useState<{ [key: number]: Image[] }>({});
    const navigate = useNavigate();

    useEffect(() => {
        loadProducts();
        loadCategories();
        // load cart items to prevent duplicate adds
        if (localStorage.getItem('token')) {
            loadCart();
        }
    }, []);

    useEffect(() => {
        loadProductsByCategory();
    }, [selectedCategory]);

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
                console.error(`Error loading images for variation ${variation.PK_Variation}:`, error);
                imagesMap[variation.PK_Variation] = [];
            }
        }
        setProductImages(imagesMap);
    };

    const loadProducts = async () => {
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
            // ignore errors (user may not be logged in)
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            loadProducts();
            return;
        }
        try {
            const data = await publicProductService.search(searchTerm);
            setProducts(data);
        } catch (error) {
            console.error('Error searching products:', error);
        }
    };

    const handleAddToCart = async (variationId: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to add items to cart');
            navigate('/login');
            return;
        }

        // Prevent duplicate adds on frontend
        if (cartVariations.includes(variationId)) {
            alert('Sản phẩm đã được thêm vào giỏ hàng rồi');
            return;
        }

        try {
            await cartService.addItem(variationId, 1);
            // update local set so subsequent clicks won't add again
            setCartVariations((prev) => [...prev, variationId]);
            alert('Added to cart!');
        } catch (error: any) {
            if (error.response?.status === 401) {
                alert('Please login to add items to cart');
                navigate('/login');
            } else {
                alert('Failed to add to cart');
            }
        }
    };

    if (loading) return <div className="loading">Loading products...</div>;

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
                <div className="search-bar">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit">Search</button>
                    </form>
                </div>
            </header>

            <main className="shop-main">
                <aside className="shop-sidebar">
                    <h3>Categories</h3>
                    <div className="category-list">
                        <button
                            className={`category-item ${selectedCategory === null ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            All Products
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.PK_Category}
                                className={`category-item ${selectedCategory === category.PK_Category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category.PK_Category)}
                            >
                                {category.Name}
                            </button>
                        ))}
                    </div>
                </aside>
                <div className="shop-content">
                    <h2>Products</h2>
                    <div className="product-grid">
                        {products.map((product) => {
                            const images = productImages[product.PK_Variation] || [];
                            const defaultImage = images.find(img => img.Set_Default) || images[0];
                            const imageUrl = defaultImage ?
                                (defaultImage.Id_Image.startsWith('/static/') ?
                                    `${API_BASE_URL}${defaultImage.Id_Image}` :
                                    `${API_BASE_URL}/static/images/${defaultImage.Id_Image}`) :
                                '';

                            return (
                                <div key={product.PK_Variation} className="product-card">
                                    <h3 className="product-title">{product.Name}</h3>
                                    <div className="product-image" onClick={() => navigate(`/variation/${product.PK_Variation}`)} style={{ cursor: 'pointer' }}>
                                        {defaultImage ? (
                                            <img
                                                src={imageUrl}
                                                alt={product.Name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    position: 'relative',
                                                    zIndex: 1
                                                }}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const placeholder = target.nextElementSibling as HTMLElement;
                                                    if (placeholder) placeholder.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className="placeholder-image" style={{ display: defaultImage ? 'none' : 'flex' }}>
                                            No Image
                                        </div>
                                    </div>
                                    <div className="product-info">
                                        {product.Color && (
                                            <p className="product-detail">Color: {product.Color}</p>
                                        )}
                                        {product.Size && (
                                            <p className="product-detail">Size: {product.Size}</p>
                                        )}
                                        <p className="product-price">${Number(product.Price).toFixed(2)}</p>
                                        <p className="product-stock">
                                            {product.Quantity > 0 ? `In stock: ${product.Quantity}` : 'Out of stock'}
                                        </p>
                                        <button
                                            className="btn-add-cart"
                                            onClick={() => handleAddToCart(product.PK_Variation)}
                                            disabled={product.Quantity === 0}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {products.length === 0 && (
                        <div className="no-products">No products found</div>
                    )}
                </div>
            </main>
        </div>
    );
}
