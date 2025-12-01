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
    const [filters, setFilters] = useState({
        name: '',
        phone: '',
        status: '',
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        try {
            const data = await customerService.getAll({
                skip: 0,
                limit: 100,
                name: filters.name || undefined,
                phone: filters.phone || undefined,
                status: filters.status || undefined,
            });
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

    const handleDeactivate = async (id: number) => {
        if (!confirm('Are you sure you want to deactivate this customer?')) return;
        try {
            await customerService.deactivate(id);
            loadData();
        } catch (error) {
            alert('Failed to deactivate customer');
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

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({ name: '', phone: '', status: '' });
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

            {/* Filter Section */}
            <div className="filter-section">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Search by Name:</label>
                        <input
                            type="text"
                            value={filters.name}
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                            placeholder="Enter customer name..."
                        />
                    </div>
                    <div className="filter-group">
                        <label>Phone:</label>
                        <input
                            type="text"
                            value={filters.phone}
                            onChange={(e) => handleFilterChange('phone', e.target.value)}
                            placeholder="Enter phone number..."
                        />
                    </div>
                    <div className="filter-group">
                        <label>Status:</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
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
                                            onClick={() => handleDeactivate(customer.PK_Customer)}
                                            className="btn-delete"
                                        >
                                            Deactivate
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
                                <label>Status</label>
                                <select
                                    value={formData.Status}
                                    onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
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
