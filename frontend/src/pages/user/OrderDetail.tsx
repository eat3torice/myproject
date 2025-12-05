/* --- START OF FILE OrderDetail.tsx --- */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { imagesService } from '../../services/imagesService';
import { API_BASE_URL } from '../../config/api';
import type { Order } from '../../types';
import type { OrderLine } from '../../types/order';
import './OrderDetail.css';
// Lưu ý: File này cũng sử dụng biến CSS từ Orders.css, 
// nên đảm bảo import Orders.css hoặc khai báo biến ở file gốc (App.css/index.css)

export default function OrderDetail() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderLine[]>([]);
    const [productImages, setProductImages] = useState<{ [key: number]: any[] }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDetail();
    }, [orderId]);

    const loadDetail = async () => {
        setLoading(true);
        try {
            const orderData = await userService.getOrderDetail(Number(orderId));
            const itemsData = await userService.getOrderItems(Number(orderId));
            setOrder(orderData);
            setItems(itemsData);
            await loadImages(itemsData);
        } catch (error) {
            alert('Failed to load order detail');
        } finally {
            setLoading(false);
        }
    };

    const loadImages = async (orderItems: OrderLine[]) => {
        const imagesMap: { [key: number]: any[] } = {};
        const variationIds = [...new Set(orderItems.map(item => item.VariationID).filter(id => id))];

        for (const variationId of variationIds) {
            if (variationId) {
                try {
                    const images = await imagesService.getImagesByVariation(variationId);
                    imagesMap[variationId] = images;
                } catch (error) {
                    console.error(`Error loading images for variation ${variationId}:`, error);
                    imagesMap[variationId] = [];
                }
            }
        }
        setProductImages(imagesMap);
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            await userService.cancelOrder(Number(orderId));
            await loadDetail();
            alert('Order cancelled');
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to cancel order');
        }
    };

    const handleConfirmReceived = async () => {
        if (!confirm('Are you sure you have received this order? This action cannot be undone.')) return;
        try {
            await userService.confirmOrderReceived(Number(orderId));
            await loadDetail();
            alert('Order confirmed as received');
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to confirm order receipt');
        }
    };

    if (loading) return <div className="loading-container">Loading details...</div>;
    if (!order) return <div className="loading-container">Order not found</div>;

    return (
        <div className="orders-container">
            <header className="orders-header">
                <Link to="/orders" className="back-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Orders
                </Link>
                <h1>Order Details #{order.PK_POSOrder}</h1>
            </header>

            <main className="orders-main">
                <div className="order-detail-card">
                    {/* Header Info Section */}
                    <div className="order-detail-header-section">
                        <div className="order-header-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                            <span className={`order-status status-${order.Status.toLowerCase()}`}>
                                {order.Status}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '14px' }}>
                                Placed on {new Date(order.Order_Date || '').toLocaleString()}
                            </span>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Order Type</label>
                                <div>{order.Type_Order}</div>
                            </div>
                            <div className="detail-item">
                                <label>Items Count</label>
                                <div>{items.length} items</div>
                            </div>
                            <div className="detail-item">
                                <label>Total Amount</label>
                                <div className="detail-amount">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.Total_Amount))}</div>
                            </div>
                        </div>

                        {/* Shipping Address Section */}
                        {order.ShippingAddress && (
                            <div className="detail-item" style={{ marginTop: '16px' }}>
                                <label>Shipping Address</label>
                                <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>
                                    {order.ShippingAddress}
                                </div>
                            </div>
                        )}

                        {/* Cancel Action specifically for Detail View */}
                        <div className="action-bar">
                            {(order.Status.toUpperCase() !== 'CANCELLED' && order.Status.toUpperCase() !== 'COMPLETED') && (
                                <button className="btn-cancel" onClick={handleCancel}>Cancel Order</button>
                            )}
                            {order.Status.toLowerCase() === 'processing' && (
                                <button className="btn-confirm" onClick={handleConfirmReceived}>Confirm Received</button>
                            )}
                        </div>
                    </div>

                    {/* Products Table Section */}
                    <div className="order-products-section">
                        <h3 className="section-title">Items Ordered</h3>
                        {items.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#6b7280' }}>No products in this order.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="order-lines-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Product / Variation</th>
                                            <th className="text-right">Unit Price</th>
                                            <th className="text-right">Qty</th>
                                            <th className="text-right">Total</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((line) => {
                                            const images = productImages[line.VariationID || 0] || [];
                                            const defaultImage = images.find(img => img.Set_Default) || images[0];
                                            const imageUrl = defaultImage ?
                                                (defaultImage.Id_Image.startsWith('/static/') ?
                                                    `${API_BASE_URL}${defaultImage.Id_Image}` :
                                                    `${API_BASE_URL}/static/images/${defaultImage.Id_Image}`) :
                                                '';

                                            return (
                                                <tr key={line.PK_OrderLine}>
                                                    <td>
                                                        {defaultImage ? (
                                                            <img
                                                                src={imageUrl}
                                                                alt={line.VariationName || `Variation #${line.VariationID}`}
                                                                style={{
                                                                    width: '60px',
                                                                    height: '60px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                        ) : (
                                                            <div style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                background: '#f3f4f6',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#9ca3af',
                                                                fontSize: '10px'
                                                            }}>
                                                                No Image
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>{line.VariationName || `Variation #${line.VariationID}`}</div>
                                                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>ID: {line.PK_OrderLine}</div>
                                                    </td>
                                                    <td className="text-right">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(line.Unit_Price))}</td>
                                                    <td className="text-right">x{line.Quantity}</td>
                                                    <td className="text-right" style={{ fontWeight: 600 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(line.Price))}</td>
                                                    <td>
                                                        <span style={{ fontSize: '12px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                                                            {line.Status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}