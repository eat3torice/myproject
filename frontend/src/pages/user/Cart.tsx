import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import { userService } from '../../services/userService';
import './Cart.css';

interface CartItem {
    PK_CartItem: number;
    CartID: number;
    VariationID: number;
    Quantity: number;
    Price: number;
    variation_name?: string;
}

export default function Cart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const data = await cartService.getCart();
            setCartItems(data);
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemove(cartItemId);
            return;
        }
        try {
            await cartService.updateQuantity(cartItemId, newQuantity);
            loadCart();
        } catch (error: any) {
            let errorMsg = 'Failed to update quantity';
            if (error.response) {
                // Có phản hồi từ backend
                errorMsg = error.response.data?.detail || error.message || errorMsg;
                if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('stock')) {
                    alert('Số lượng vượt quá tồn kho!');
                } else {
                    alert(errorMsg);
                }
            } else {
                // Không có phản hồi (network error)
                alert('Không thể kết nối tới server. Vui lòng thử lại hoặc kiểm tra mạng.');
            }
        }
    };

    const handleRemove = async (cartItemId: number) => {
        try {
            await cartService.removeItem(cartItemId);
            loadCart();
        } catch (error) {
            alert('Failed to remove item');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + Number(item.Price) * item.Quantity, 0);
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            alert('Cart is empty');
            return;
        }
        try {
            await userService.createOrder({
                payment_method_id: 5, // Cash
                note: 'Online order',
            });
            alert('Order placed successfully!');
            navigate('/orders');
        } catch (error: any) {
            console.error('Checkout error:', error);
            const errorMsg = error.response?.data?.detail || error.message || 'Failed to create order';
            alert(errorMsg);
        }
    };

    if (loading) return <div className="loading">Loading cart...</div>;

    return (
        <div className="cart-container">
            <header className="cart-header">
                <Link to="/shop" className="back-link">
                    ← Back to Shop
                </Link>
                <h1>Shopping Cart</h1>
            </header>

            <main className="cart-main">
                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty</p>
                        <Link to="/shop" className="btn-continue">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div key={item.PK_CartItem} className="cart-item">
                                    <div className="item-info">
                                        <h3>{item.variation_name || 'Product'}</h3>
                                        <p className="item-price">${Number(item.Price).toFixed(2)} each</p>
                                    </div>
                                    <div className="item-actions">
                                        <div className="quantity-control">
                                            <button
                                                onClick={() =>
                                                    handleUpdateQuantity(item.PK_CartItem, item.Quantity - 1)
                                                }
                                            >
                                                -
                                            </button>
                                            <span>{item.Quantity}</span>
                                            <button
                                                onClick={() =>
                                                    handleUpdateQuantity(item.PK_CartItem, item.Quantity + 1)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            className="btn-remove"
                                            onClick={() => handleRemove(item.PK_CartItem)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="item-subtotal">
                                        ${(Number(item.Price) * item.Quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <div className="summary-row">
                                <span>Total:</span>
                                <span className="total-amount">${calculateTotal().toFixed(2)}</span>
                            </div>
                            <button className="btn-checkout" onClick={handleCheckout}>
                                Checkout
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
