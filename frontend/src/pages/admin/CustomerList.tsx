import { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import type { Customer } from '../../types';
import './Common.css';

export default function CustomerList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        Name: '',
        Address: '',
        Phone: '',
        Note: '',
        Status: 'ACTIVE',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await customerService.getAll(0, 100);
            setCustomers(data);
        } catch (error) {
            console.error('Error loading customers:', error);
            alert('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await customerService.update(editingCustomer.PK_Customer, formData);
            } else {
                await customerService.create(formData);
            }
            setShowModal(false);
            setEditingCustomer(null);
            resetForm();
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to save customer');
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            Name: customer.Name,
            Address: customer.Address || '',
            Phone: customer.Phone || '',
            Note: customer.Note || '',
            Status: customer.Status || 'ACTIVE',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        try {
            await customerService.delete(id);
            loadData();
        } catch (error) {
            alert('Failed to delete customer');
        }
    };

    const resetForm = () => {
        setFormData({
            Name: '',
            Address: '',
            Phone: '',
            Note: '',
            Status: 'ACTIVE',
        });
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Customers</h1>
                <button
                    onClick={() => {
                        setEditingCustomer(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn-primary"
                >
                    + Add Customer
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.PK_Customer}>
                                <td>{customer.PK_Customer}</td>
                                <td>{customer.Name}</td>
                                <td>{customer.Phone || 'N/A'}</td>
                                <td>{customer.Address || 'N/A'}</td>
                                <td>{customer.Status || 'N/A'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleEdit(customer)} className="btn-edit">
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(customer.PK_Customer)}
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
            </div >

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={formData.Name}
                                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    value={formData.Phone}
                                    onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    value={formData.Address}
                                    onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>Note</label>
                                <textarea
                                    value={formData.Note}
                                    onChange={(e) => setFormData({ ...formData, Note: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={formData.Status}
                                    onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    {editingCustomer ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }
        </div >
    );
}
