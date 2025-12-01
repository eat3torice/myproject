import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { customerService } from '../../services/customerService';
import { variationService } from '../../services/variationService';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import type { Customer, Variation, Category, Product } from '../../types';
import './POSOrder.css';

interface OrderLine {
    VariationID: number;
    Quantity: number;
    Unit_Price: number;
}

interface CartItem extends OrderLine {
    variationName: string;
}

export default function POSOrder() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [variations, setVariations] = useState<Variation[]>([]);
    const [allVariations, setAllVariations] = useState<Variation[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [searchName, setSearchName] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
    const [selectedVariation, setSelectedVariation] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);
    const [paymentMethod, setPaymentMethod] = useState<number>(5); // ID 5 = Cash
    const [note, setNote] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterVariations();
    }, [allVariations, selectedCategory, selectedProduct, searchName]);

    const loadData = async () => {
        try {
            const [customersData, variationsData, categoriesData, productsData] = await Promise.all([
                customerService.getAll({ skip: 0, limit: 100 }),
                variationService.getAll(0, 200),
                categoryService.getAll({ skip: 0, limit: 100 }),
                productService.getAll({ skip: 0, limit: 100 }),
            ]);
            setCustomers(customersData);
            setAllVariations(variationsData);
            setCategories(categoriesData);
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const filterVariations = () => {
        let filtered = [...allVariations];
        if (selectedCategory) {
            filtered = filtered.filter(v => {
                const prod = products.find(p => p.PK_Product === v.ProductID);
                return prod && prod.CategoryID === selectedCategory;
            });
        }
        if (selectedProduct) {
            filtered = filtered.filter(v => v.ProductID === selectedProduct);
        }
        if (searchName.trim()) {
            filtered = filtered.filter(v => v.Name.toLowerCase().includes(searchName.trim().toLowerCase()));
        }
        setVariations(filtered.filter(v => v.Quantity > 0));
    };

    const addToCart = () => {
        if (selectedVariation === 0 || quantity <= 0) {
            alert('Please select a variation and enter quantity');
            return;
        }

        const variation = variations.find((v) => v.PK_Variation === selectedVariation);
        if (!variation) return;

        if (quantity > variation.Quantity) {
            alert(`Only ${variation.Quantity} items available`);
            return;
        }

        const existingItem = cart.find((item) => item.VariationID === selectedVariation);
        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.VariationID === selectedVariation
                        ? { ...item, Quantity: item.Quantity + quantity }
                        : item
                )
            );
        } else {
            setCart([
                ...cart,
                {
                    VariationID: selectedVariation,
                    Quantity: quantity,
                    Unit_Price: variation.Price,
                    variationName: variation.Name,
                },
            ]);
        }

        setSelectedVariation(0);
        setQuantity(1);
    };

    const removeFromCart = (variationId: number) => {
        setCart(cart.filter((item) => item.VariationID !== variationId));
    };

    const updateCartQuantity = (variationId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(variationId);
            return;
        }

        const variation = variations.find((v) => v.PK_Variation === variationId);
        if (variation && newQuantity > variation.Quantity) {
            alert(`Only ${variation.Quantity} items available`);
            return;
        }

        setCart(
            cart.map((item) =>
                item.VariationID === variationId ? { ...item, Quantity: newQuantity } : item
            )
        );
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.Unit_Price * item.Quantity, 0);
    };

    const handleSubmitOrder = async () => {
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        if (!paymentMethod) {
            alert('Please select payment method');
            return;
        }

        try {
            const orderData = {
                CustomerID: selectedCustomer,
                EmployeeID: 1, // You might want to get this from logged-in user
                PaymentMethodID: paymentMethod,
                Note: note,
                Type_Order: 'POS',
                order_lines: cart.map((item) => ({
                    VariationID: item.VariationID,
                    Quantity: item.Quantity,
                    Unit_Price: item.Unit_Price,
                })),
            };

            await orderService.create(orderData);
            alert('Order created successfully!');

            // Reset form
            setCart([]);
            setSelectedCustomer(null);
            setNote('');
            setPaymentMethod(5);

            // Reload variations to update quantities
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to create order');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="pos-container">
            <div className="pos-left">
                <h2>Select Products</h2>
                <div className="filter-bar" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <input
                        type="text"
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
                        placeholder="Search by name..."
                        style={{ padding: '8px', minWidth: 160 }}
                    />
                    <select
                        value={selectedCategory || ''}
                        onChange={e => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                        style={{ padding: '8px', minWidth: 120 }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.PK_Category} value={cat.PK_Category}>{cat.Name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedProduct || ''}
                        onChange={e => setSelectedProduct(e.target.value ? parseInt(e.target.value) : null)}
                        style={{ padding: '8px', minWidth: 120 }}
                    >
                        <option value="">All Products</option>
                        {products
                            .filter(p => !selectedCategory || p.CategoryID === selectedCategory)
                            .map(prod => (
                                <option key={prod.PK_Product} value={prod.PK_Product}>{prod.Name}</option>
                            ))}
                    </select>
                </div>
                <div className="product-selector">
                    <select
                        value={selectedVariation}
                        onChange={(e) => setSelectedVariation(parseInt(e.target.value))}
                        className="select-variation"
                    >
                        <option value={0}>Select Variation</option>
                        {variations.map((variation) => (
                            <option key={variation.PK_Variation} value={variation.PK_Variation}>
                                {variation.Name} - ${variation.Price} (Stock: {variation.Quantity})
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        className="input-quantity"
                        placeholder="Qty"
                    />
                    <button onClick={addToCart} className="btn-add">
                        Add to Cart
                    </button>
                </div>

                <div className="product-grid">
                    {variations.slice(0, 12).map((variation) => (
                        <div
                            key={variation.PK_Variation}
                            className="product-card"
                            onClick={() => {
                                setSelectedVariation(variation.PK_Variation);
                                setQuantity(1);
                            }}
                        >
                            <div className="product-name">{variation.Name}</div>
                            <div className="product-price">${variation.Price}</div>
                            <div className="product-stock">Stock: {variation.Quantity}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pos-right">
                <h2>Order Details</h2>

                <div className="customer-select">
                    <label>Customer (Optional)</label>
                    <select
                        value={selectedCustomer || ''}
                        onChange={(e) => setSelectedCustomer(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">Guest</option>
                        {customers.map((customer) => (
                            <option key={customer.PK_Customer} value={customer.PK_Customer}>
                                {customer.Name} - {customer.Phone}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="cart-items">
                    <h3>Cart</h3>
                    {cart.length === 0 ? (
                        <div className="empty-cart">Cart is empty</div>
                    ) : (
                        <div className="cart-list">
                            {cart.map((item) => (
                                <div key={item.VariationID} className="cart-item">
                                    <div className="cart-item-info">
                                        <div className="cart-item-name">{item.variationName}</div>
                                        <div className="cart-item-price">${item.Unit_Price}</div>
                                    </div>
                                    <div className="cart-item-actions">
                                        <button
                                            onClick={() =>
                                                updateCartQuantity(item.VariationID, item.Quantity - 1)
                                            }
                                            className="btn-qty"
                                        >
                                            -
                                        </button>
                                        <span className="cart-item-qty">{item.Quantity}</span>
                                        <button
                                            onClick={() =>
                                                updateCartQuantity(item.VariationID, item.Quantity + 1)
                                            }
                                            className="btn-qty"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(item.VariationID)}
                                            className="btn-remove"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div className="cart-item-subtotal">
                                        ${(item.Unit_Price * item.Quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="order-options">
                    <div className="form-group">
                        <label>Payment Method</label>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(parseInt(e.target.value))}>
                            <option value={5}>Cash</option>
                            <option value={6}>Credit Card</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Note</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Order notes..."
                        />
                    </div>
                </div>

                <div className="order-total">
                    <div className="total-label">Total:</div>
                    <div className="total-amount">${calculateTotal().toFixed(2)}</div>
                </div>

                <button
                    onClick={handleSubmitOrder}
                    disabled={cart.length === 0}
                    className="btn-checkout"
                >
                    Complete Order
                </button>
            </div>
        </div>
    );
}
