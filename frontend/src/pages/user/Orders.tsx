/* --- START OF FILE Orders.tsx --- */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import './Orders.css';

interface Order {
    PK_POSOrder: number;
    Total_Amount: number;
    Total_Payment: number;
    Status: string;
    Order_Date?: string;
    Type_Order: string;
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await userService.getOrders();
            // Sắp xếp đơn mới nhất lên đầu
            setOrders(data.sort((a: any, b: any) => b.PK_POSOrder - a.PK_POSOrder));
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (orderId: number) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            await userService.cancelOrder(orderId);
            await loadOrders();
            alert('Order cancelled successfully');
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to cancel order');
        }
    };

    const handleConfirmReceived = async (orderId: number) => {
        if (!confirm('Are you sure you have received this order? This action cannot be undone.')) return;
        try {
            await userService.confirmOrderReceived(orderId);
            await loadOrders();
            alert('Order confirmed as received');
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to confirm order receipt');
        }
    };

    if (loading) return <div className="loading-container">Loading your orders...</div>;

    return (
        <div className="orders-container">
            <header className="orders-header">
                <Link to="/shop" className="back-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Shop
                </Link>
                <h1>My Orders</h1>
            </header>

            <main className="orders-main">
                {orders.length === 0 ? (
                    <div className="no-orders">
                        <div style={{ fontSize: '48px' }}>📦</div>
                        <h3>No orders yet</h3>
                        <p style={{ color: '#6b7280' }}>Looks like you haven't made your choice yet.</p>
                        <Link to="/shop" className="btn-shop">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.PK_POSOrder} className="order-card">
                                {/* Top: ID, Date, Status */}
                                <div className="order-header-row">
                                    <div className="order-id-group">
                                        <span className="order-id">Order #{order.PK_POSOrder}</span>
                                        <span className="order-date">
                                            {order.Order_Date
                                                ? new Date(order.Order_Date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : 'Date N/A'}
                                        </span>
                                    </div>
                                    <span className={`order-status status-${order.Status.toLowerCase()}`}>
                                        {order.Status}
                                    </span>
                                </div>

                                {/* Middle: Details */}
                                <div className="order-body">
                                    <div className="info-group">
                                        <span className="label">Type</span>
                                        <span className="value">{order.Type_Order}</span>
                                    </div>
                                    <div className="info-group">
                                        <span className="label">Total Amount</span>
                                        <span className="value amount">
                                            ${Number(order.Total_Amount).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Bottom: Actions */}
                                    <div className="order-actions">
                                        {(order.Status.toUpperCase() !== 'CANCELLED' && order.Status.toUpperCase() !== 'COMPLETED') && (
                                            <button
                                                className="btn-cancel"
                                                onClick={() => handleCancel(order.PK_POSOrder)}
                                                title="Cancel Order"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {order.Status.toLowerCase() === 'processing' && (
                                            <button
                                                className="btn-confirm"
                                                onClick={() => handleConfirmReceived(order.PK_POSOrder)}
                                                title="Confirm Order Received"
                                            >
                                                Confirm Received
                                            </button>
                                        )}
                                        <Link to={`/orders/${order.PK_POSOrder}`} className="btn-detail">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}