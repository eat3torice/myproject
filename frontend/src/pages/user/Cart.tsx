// --- START OF FILE Cart.tsx ---

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import { userService } from '../../services/userService';
import { addressService } from '../../services/addressService';
import type { Address, Province, District, Ward } from '../../services/addressService';
import './Cart.css';

// --- Icons (Inline SVGs) ---
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const BagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;

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
    const [processing, setProcessing] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
    const [selectedWard, setSelectedWard] = useState<number | null>(null);
    const [streetAddress, setStreetAddress] = useState('');
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
        loadAddresses();
        loadProvinces();
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

    const loadAddresses = async () => {
        try {
            const data = await addressService.getMyAddresses();
            setAddresses(data);
            // Set default address if exists
            const defaultAddr = data.find(addr => addr.IsDefault === 1);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.PK_Address);
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
        }
    };

    const loadProvinces = async () => {
        try {
            const data = await addressService.getProvinces();
            setProvinces(data);
        } catch (error) {
            console.error('Error loading provinces:', error);
        }
    };

    const handleProvinceChange = async (provinceId: number) => {
        setSelectedProvince(provinceId);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
        try {
            const data = await addressService.getDistrictsByProvince(provinceId);
            setDistricts(data);
        } catch (error) {
            console.error('Error loading districts:', error);
        }
    };

    const handleDistrictChange = async (districtId: number) => {
        setSelectedDistrict(districtId);
        setSelectedWard(null);
        setWards([]);
        try {
            const data = await addressService.getWardsByDistrict(districtId);
            setWards(data);
        } catch (error) {
            console.error('Error loading wards:', error);
        }
    };

    const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemove(cartItemId);
            return;
        }

        // Optimistic update (Cập nhật UI trước khi gọi API để cảm giác nhanh hơn)
        const oldItems = [...cartItems];
        setCartItems(prev => prev.map(item =>
            item.PK_CartItem === cartItemId ? { ...item, Quantity: newQuantity } : item
        ));

        try {
            await cartService.updateQuantity(cartItemId, newQuantity);
            // Không cần loadCart lại nếu API trả về OK, vì UI đã update rồi
        } catch (error: any) {
            // Revert nếu lỗi
            setCartItems(oldItems);
            let errorMsg = 'Failed to update quantity';
            if (error.response?.data?.detail) {
                errorMsg = error.response.data.detail;
            }
            if (errorMsg.toLowerCase().includes('stock')) {
                alert('Not enough stock available!');
            }
        }
    };

    const handleRemove = async (cartItemId: number) => {
        if (!window.confirm("Remove this item?")) return;
        try {
            await cartService.removeItem(cartItemId);
            setCartItems(prev => prev.filter(item => item.PK_CartItem !== cartItemId));
        } catch (error) {
            alert('Failed to remove item');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + Number(item.Price) * item.Quantity, 0);
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        // Check if address is selected
        if (!selectedAddressId) {
            alert('Please select a delivery address');
            setShowAddressModal(true);
            return;
        }

        setProcessing(true);
        try {
            await userService.createOrder({
                payment_method_id: 5, // Cash
                address_id: selectedAddressId,
                note: 'Online order',
            });
            // Show success via alert for now, ideally a toast
            alert('Order placed successfully! Redirecting...');
            navigate('/orders');
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || 'Checkout failed. Please try again.';
            alert(errorMsg);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="cart-wrapper loading-state">
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="cart-wrapper">
            {/* Header Reused */}
            <header className="shop-navbar">
                <div className="container nav-container">
                    <Link to="/" className="brand-logo">
                        <span className="logo-text">SHOPPY</span><span className="logo-dot">.</span>
                    </Link>
                    <nav className="nav-links">
                        <Link to="/shop">Shop</Link>
                        <Link to="/cart" className="active">Cart ({cartItems.length})</Link>
                    </nav>
                </div>
            </header>

            <main className="container cart-main">
                <div className="cart-page-header">
                    <Link to="/shop" className="back-link">
                        <ArrowLeftIcon /> Continue Shopping
                    </Link>
                    <h1>Your Shopping Cart</h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="empty-cart-state">
                        <div className="empty-icon"><BagIcon /></div>
                        <h2>Your cart is currently empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/shop" className="btn-primary-large">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        {/* Cart Items Column */}
                        <div className="cart-items-column">
                            <div className="cart-header-row">
                                <span>Product</span>
                                <span className="header-qty">Quantity</span>
                                <span className="header-total">Total</span>
                            </div>

                            <div className="cart-list">
                                {cartItems.map((item) => (
                                    <div key={item.PK_CartItem} className="cart-item-row">
                                        <div className="product-info-cell">
                                            {/* Placeholder for image since API might not send it here directly yet */}
                                            <div className="product-thumb-placeholder">
                                                {item.variation_name ? item.variation_name.charAt(0) : 'P'}
                                            </div>
                                            <div className="product-details">
                                                <h3 className="product-name">{item.variation_name || 'Product Item'}</h3>
                                                <p className="unit-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.Price))}</p>
                                            </div>
                                        </div>

                                        <div className="qty-cell">
                                            <div className="qty-control">
                                                <button onClick={() => handleUpdateQuantity(item.PK_CartItem, item.Quantity - 1)}>
                                                    <MinusIcon />
                                                </button>
                                                <input type="text" readOnly value={item.Quantity} />
                                                <button onClick={() => handleUpdateQuantity(item.PK_CartItem, item.Quantity + 1)}>
                                                    <PlusIcon />
                                                </button>
                                            </div>
                                            <button className="btn-remove-text" onClick={() => handleRemove(item.PK_CartItem)}>
                                                <TrashIcon /> Remove
                                            </button>
                                        </div>

                                        <div className="total-cell">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.Price) * item.Quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary Column */}
                        <div className="cart-summary-column">
                            <div className="summary-card">
                                <h3>Order Summary</h3>

                                {/* Delivery Address Section */}
                                <div className="address-section">
                                    <h4>Delivery Address</h4>
                                    {selectedAddressId ? (
                                        <div className="selected-address">
                                            {(() => {
                                                const addr = addresses.find(a => a.PK_Address === selectedAddressId);
                                                return addr ? (
                                                    <div>
                                                        <p>{addr.StreetAddress}</p>
                                                        <p>{addr.WardName}, {addr.DistrictName}, {addr.ProvinceName}</p>
                                                    </div>
                                                ) : (
                                                    <p>No address selected</p>
                                                );
                                            })()}
                                            <button
                                                className="btn-change-address"
                                                onClick={() => setShowAddressModal(true)}
                                            >
                                                Change Address
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn-select-address"
                                            onClick={() => setShowAddressModal(true)}
                                        >
                                            Select Delivery Address
                                        </button>
                                    )}
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span className="free-text">Free</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row total-row">
                                    <span>Total</span>
                                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}</span>
                                </div>

                                <button
                                    className="btn-checkout-full"
                                    onClick={handleCheckout}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Checkout'}
                                </button>

                                <div className="secure-checkout">
                                    <ShieldCheckIcon /> Secure Checkout
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Address Selection Modal */}
            {showAddressModal && (
                <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Select Delivery Address</h3>
                            <button className="modal-close" onClick={() => setShowAddressModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            {/* Existing Addresses */}
                            {addresses.length > 0 && (
                                <div className="existing-addresses">
                                    <h4>Your Addresses</h4>
                                    {addresses.map(addr => (
                                        <div
                                            key={addr.PK_Address}
                                            className={`address-option ${selectedAddressId === addr.PK_Address ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedAddressId(addr.PK_Address);
                                                setShowAddressModal(false);
                                            }}
                                        >
                                            <div className="address-content">
                                                <p className="street">{addr.StreetAddress}</p>
                                                <p className="location">{addr.WardName}, {addr.DistrictName}, {addr.ProvinceName}</p>
                                                {addr.IsDefault === 1 && <span className="default-badge">Default</span>}
                                            </div>
                                            <div className="radio-indicator">
                                                {selectedAddressId === addr.PK_Address && <div className="radio-selected"></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add New Address */}
                            <div className="add-new-address">
                                <button
                                    className="btn-add-new"
                                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                                >
                                    + Add New Address
                                </button>

                                {isAddingNewAddress && (
                                    <div className="new-address-form">
                                        <div className="form-row">
                                            <select
                                                value={selectedProvince || ''}
                                                onChange={(e) => handleProvinceChange(Number(e.target.value))}
                                                className="form-select"
                                            >
                                                <option value="">Select Province</option>
                                                {provinces.map(province => (
                                                    <option key={province.PK_Province} value={province.PK_Province}>
                                                        {province.Name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-row">
                                            <select
                                                value={selectedDistrict || ''}
                                                onChange={(e) => handleDistrictChange(Number(e.target.value))}
                                                className="form-select"
                                                disabled={!selectedProvince}
                                            >
                                                <option value="">Select District</option>
                                                {districts.map(district => (
                                                    <option key={district.PK_District} value={district.PK_District}>
                                                        {district.Name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-row">
                                            <select
                                                value={selectedWard || ''}
                                                onChange={(e) => setSelectedWard(Number(e.target.value))}
                                                className="form-select"
                                                disabled={!selectedDistrict}
                                            >
                                                <option value="">Select Ward</option>
                                                {wards.map(ward => (
                                                    <option key={ward.PK_Ward} value={ward.PK_Ward}>
                                                        {ward.Name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-row">
                                            <input
                                                type="text"
                                                placeholder="Street Address"
                                                value={streetAddress}
                                                onChange={(e) => setStreetAddress(e.target.value)}
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-actions">
                                            <button
                                                className="btn-save-address"
                                                onClick={async () => {
                                                    if (!selectedProvince || !selectedDistrict || !selectedWard || !streetAddress.trim()) {
                                                        alert('Please fill in all address fields');
                                                        return;
                                                    }

                                                    try {
                                                        const newAddress = await addressService.createAddress({
                                                            ProvinceID: selectedProvince,
                                                            DistrictID: selectedDistrict,
                                                            WardID: selectedWard,
                                                            StreetAddress: streetAddress.trim(),
                                                            IsDefault: addresses.length === 0 ? 1 : 0, // Set as default if first address
                                                        });

                                                        setAddresses(prev => [...prev, newAddress]);
                                                        setSelectedAddressId(newAddress.PK_Address);
                                                        setIsAddingNewAddress(false);
                                                        setSelectedProvince(null);
                                                        setSelectedDistrict(null);
                                                        setSelectedWard(null);
                                                        setStreetAddress('');
                                                        setShowAddressModal(false);
                                                    } catch (error) {
                                                        alert('Failed to save address');
                                                    }
                                                }}
                                            >
                                                Save Address
                                            </button>
                                            <button
                                                className="btn-cancel"
                                                onClick={() => {
                                                    setIsAddingNewAddress(false);
                                                    setSelectedProvince(null);
                                                    setSelectedDistrict(null);
                                                    setSelectedWard(null);
                                                    setStreetAddress('');
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}