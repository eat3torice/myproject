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
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading orders...</div>;

    return (
        <div className="orders-container">
            <header className="orders-header">
                <Link to="/shop" className="back-link">
                    ← Back to Shop
                </Link>
                <h1>My Orders</h1>
            </header>

            <main className="orders-main">
                {orders.length === 0 ? (
                    <div className="no-orders">
                        <p>You haven't placed any orders yet</p>
                        <Link to="/shop" className="btn-shop">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.PK_POSOrder} className="order-card">
                                <div className="order-header">
                                    <span className="order-id">Order #{order.PK_POSOrder}</span>
                                    <span
                                        className={`order-status status-${order.Status.toLowerCase()}`}
                                    >
                                        {order.Status}
                                    </span>
                                </div>
                                <div className="order-details">
                                    <div className="detail-row">
                                        <span>Date:</span>
                                        <span>
                                            {order.Order_Date
                                                ? new Date(order.Order_Date).toLocaleDateString()
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Total Amount:</span>
                                        <span className="amount">
                                            ${Number(order.Total_Amount).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Type:</span>
                                        <span>{order.Type_Order}</span>
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
