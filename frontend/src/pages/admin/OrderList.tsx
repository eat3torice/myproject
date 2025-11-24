import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { customerService } from '../../services/customerService';
import type { Order, Customer } from '../../types';
import './Common.css';

export default function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingStatus, setEditingStatus] = useState<{ orderId: number; status: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [ordersData, customersData] = await Promise.all([
                orderService.getAll(0, 100),
                customerService.getAll(0, 100),
            ]);
            setOrders(ordersData);
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
        try {
            await orderService.update(orderId, { Status: newStatus });
            loadData();
            setEditingStatus(null);
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to update status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        try {
            await orderService.delete(id);
            loadData();
        } catch (error) {
            alert('Failed to delete order');
        }
    };

    const getCustomerName = (id?: number) => {
        if (!id) return 'Guest';
        return customers.find((c) => c.PK_Customer === id)?.Name || 'N/A';
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Orders</h1>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Total Amount</th>
                            <th>Total Payment</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Order Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.PK_POSOrder}>
                                <td>{order.PK_POSOrder}</td>
                                <td>{getCustomerName(order.CustomerID)}</td>
                                <td>${order.Total_Amount}</td>
                                <td>${order.Total_Payment}</td>
                                <td>
                                    {editingStatus?.orderId === order.PK_POSOrder ? (
                                        <select
                                            value={editingStatus.status}
                                            onChange={(e) =>
                                                setEditingStatus({
                                                    orderId: order.PK_POSOrder,
                                                    status: e.target.value,
                                                })
                                            }
                                            onBlur={() =>
                                                handleStatusChange(
                                                    editingStatus.orderId,
                                                    editingStatus.status
                                                )
                                            }
                                            autoFocus
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: '1px solid #ddd',
                                            }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    ) : (
                                        <span
                                            onClick={() =>
                                                setEditingStatus({
                                                    orderId: order.PK_POSOrder,
                                                    status: order.Status,
                                                })
                                            }
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                backgroundColor:
                                                    order.Status === 'COMPLETED'
                                                        ? '#27ae60'
                                                        : order.Status === 'CANCELLED'
                                                            ? '#e74c3c'
                                                            : '#f39c12',
                                                color: 'white',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {order.Status}
                                        </span>
                                    )}
                                </td>
                                <td>{order.Type_Order}</td>
                                <td>{order.Order_Date ? new Date(order.Order_Date).toLocaleString() : 'N/A'}</td>
                                <td>
                                    <div className="action-buttons">
                                        {order.Status !== 'CANCELLED' && (
                                            <button
                                                onClick={() => handleCancel(order.PK_POSOrder)}
                                                className="btn-edit"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(order.PK_POSOrder)}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
