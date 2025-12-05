/* --- START OF FILE OrderList.tsx --- */

import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { customerService } from '../../services/customerService';
import type { Order, Customer } from '../../types';
import type { OrderDetail, OrderLine } from '../../types/order';
import './Common.css';

export default function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        customer_id: '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        try {
            const [ordersData, customersData] = await Promise.all([
                orderService.getAll({
                    skip: 0,
                    limit: 100,
                    status: filters.status || undefined,
                    customer_id: filters.customer_id ? parseInt(filters.customer_id) : undefined,
                    start_date: filters.start_date || undefined,
                    end_date: filters.end_date || undefined,
                }),
                customerService.getAll({ skip: 0, limit: 100 }),
            ]);
            // Sắp xếp đơn hàng mới nhất lên đầu
            setOrders(ordersData.sort((a: Order, b: Order) => b.PK_POSOrder - a.PK_POSOrder));
            setCustomers(customersData);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            await orderService.cancel(id);
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to cancel order');
        }
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        const order = orders.find(o => o.PK_POSOrder === orderId);
        if (!order) return;
        if (order.Status === 'CANCELLED' || order.Status === 'COMPLETED') {
            alert('Cannot change status of cancelled or completed orders!');
            return;
        }
        const irreversible = ["CANCELLED", "COMPLETED"];
        if (irreversible.includes(newStatus.toUpperCase())) {
            const confirmMsg =
                "Khi chuyển trạng thái sang '" +
                (newStatus.toUpperCase() === "CANCELLED" ? "Đã hủy" : "Hoàn thành") +
                "', bạn sẽ không thể đổi lại trạng thái khác nữa. Bạn có chắc chắn muốn thực hiện?";
            if (!window.confirm(confirmMsg)) return;
        }
        try {
            await orderService.update(orderId, { Status: newStatus });
            alert('Trạng thái đơn hàng đã được cập nhật thành công!');
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to update status');
        }
    };

    const handleShowDetail = async (orderId: number) => {
        setDetailLoading(true);
        setSelectedOrder({ PK_POSOrder: orderId } as any); // Temporary placeholder
        try {
            const detail = await orderService.getDetail(orderId);
            setSelectedOrder(detail);
        } catch (error) {
            alert('Failed to load order details');
            setSelectedOrder(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetail = () => {
        setSelectedOrder(null);
    };

    const getCustomerName = (id?: number) => {
        if (!id) return 'Guest';
        return customers.find((c) => c.PK_Customer === id)?.Name || 'N/A';
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({ status: '', customer_id: '', start_date: '', end_date: '' });
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Orders Management</h1>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Status:</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Customer:</label>
                        <select
                            value={filters.customer_id}
                            onChange={(e) => handleFilterChange('customer_id', e.target.value)}
                        >
                            <option value="">All Customers</option>
                            {customers.map((customer) => (
                                <option key={customer.PK_Customer} value={customer.PK_Customer}>
                                    {customer.Name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Start Date:</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>End Date:</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                        />
                    </div>
                    <div className="filter-actions">
                        <button onClick={clearFilters} className="btn-secondary">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Total Amount</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.PK_POSOrder}>
                                <td><b>#{order.PK_POSOrder}</b></td>
                                <td>{getCustomerName(order.CustomerID)}</td>
                                <td style={{ color: '#059669', fontWeight: 600 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.Total_Amount))}</td>
                                <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.Total_Payment))}</td>
                                <td>
                                    <span className={`status-badge status-${order.Status.toLowerCase()}`}>
                                        {order.Status}
                                    </span>
                                </td>
                                <td>{order.Type_Order}</td>
                                <td style={{ fontSize: '13px', color: '#6b7280' }}>
                                    {order.Order_Date ? new Date(order.Order_Date as string).toLocaleDateString() : 'N/A'}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleShowDetail(order.PK_POSOrder)}
                                            className="btn-detail"
                                            title="View Detail"
                                        >
                                            Detail
                                        </button>
                                        {(order.Status !== 'CANCELLED' && order.Status !== 'COMPLETED') && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(order.PK_POSOrder, 'processing')}
                                                    className="btn-edit"
                                                    title="Mark as Processing"
                                                >
                                                    Process
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(order.PK_POSOrder, 'COMPLETED')}
                                                    style={{ backgroundColor: '#ecfdf5', color: '#059669', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                                                    title="Mark as Completed"
                                                >
                                                    Complete
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(order.PK_POSOrder)}
                                                    className="btn-delete"
                                                    title="Cancel Order"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder !== null && (
                <div className="modal-overlay" onClick={handleCloseDetail}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <h2>Order Detail #{selectedOrder.PK_POSOrder}</h2>

                        {!selectedOrder.order_lines && detailLoading ? (
                            <div className="loading">Loading details...</div>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                                    <div>
                                        <small style={{ color: '#6b7280', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>Customer</small>
                                        <div style={{ fontWeight: 500 }}>{getCustomerName(selectedOrder.CustomerID)}</div>
                                    </div>
                                    <div>
                                        <small style={{ color: '#6b7280', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>Date</small>
                                        <div>{selectedOrder.Order_Date ? new Date(selectedOrder.Order_Date as string).toLocaleString() : 'N/A'}</div>
                                    </div>
                                    <div>
                                        <small style={{ color: '#6b7280', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>Status</small>
                                        <div>
                                            <span className={`status-badge status-${(selectedOrder.Status || '').toLowerCase()}`}>
                                                {selectedOrder.Status}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <small style={{ color: '#6b7280', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>Total Amount</small>
                                        <div style={{ color: '#059669', fontWeight: 700, fontSize: '18px' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(selectedOrder.Total_Amount))}</div>
                                    </div>
                                    {selectedOrder.ShippingAddress && (
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <small style={{ color: '#6b7280', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>Shipping Address</small>
                                            <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5', marginTop: '4px' }}>
                                                {selectedOrder.ShippingAddress}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Order Items</h3>
                                {(!selectedOrder.order_lines || selectedOrder.order_lines.length === 0) ? (
                                    <div style={{ color: '#6b7280', fontStyle: 'italic' }}>No products in this order.</div>
                                ) : (
                                    <div className="table-container" style={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Item</th>
                                                    <th style={{ textAlign: 'center' }}>Qty</th>
                                                    <th style={{ textAlign: 'right' }}>Price</th>
                                                    <th style={{ textAlign: 'right' }}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.order_lines.map((line: OrderLine) => (
                                                    <tr key={line.PK_OrderLine}>
                                                        <td>
                                                            <div style={{ fontWeight: 600 }}>{line.VariationName || `Var #${line.VariationID}`}</div>
                                                            <small style={{ color: '#6b7280' }}>ID: {line.PK_OrderLine}</small>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>{line.Quantity}</td>
                                                        <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(line.Unit_Price))}</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(line.Price))}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="modal-actions">
                            <button onClick={handleCloseDetail} className="btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}