import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';
import { isAdmin } from '../../utils/roleUtils';
import type { Employee } from '../../types';
import './Common.css';

export default function EmployeeList() {
    const navigate = useNavigate();

    // Check if user has admin access
    useEffect(() => {
        if (!isAdmin()) {
            alert('Access denied. Admin privileges required.');
            navigate('/admin');
            return;
        }
    }, [navigate]);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        AccountID: 0,
        Name: '',
        Phone: '',
        Email: '',
    });
    const [filters, setFilters] = useState({
        name: '',
        phone: '',
        email: '',
        status: '',
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        try {
            const data = await employeeService.getAll({
                skip: 0,
                limit: 100,
                name: filters.name || undefined,
                phone: filters.phone || undefined,
                email: filters.email || undefined,
                status: filters.status || undefined,
            });
            setEmployees(data);
        } catch (error) {
            console.error('Error loading employees:', error);
            alert('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingEmployee) {
                await employeeService.update(editingEmployee.PK_Employee, formData);
            } else {
                await employeeService.create(formData);
            }
            setShowModal(false);
            setEditingEmployee(null);
            resetForm();
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to save employee');
        }
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            AccountID: employee.AccountID,
            Name: employee.Name,
            Phone: employee.Phone || '',
            Email: employee.Email || '',
        });
        setShowModal(true);
    };

    const handleDeactivate = async (id: number) => {
        if (!confirm('Are you sure you want to deactivate this employee?')) return;
        try {
            await employeeService.deactivate(id);
            loadData();
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to deactivate employee';
            alert(errorMessage);
        }
    };

    const handleReactivate = async (id: number) => {
        if (!confirm('Are you sure you want to reactivate this employee?')) return;
        try {
            await employeeService.reactivate(id);
            loadData();
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to reactivate employee';
            alert(errorMessage);
        }
    };

    const resetForm = () => {
        setFormData({
            AccountID: 0,
            Name: '',
            Phone: '',
            Email: '',
        });
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({ name: '', phone: '', email: '', status: '' });
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Employees</h1>
                <button
                    onClick={() => {
                        setEditingEmployee(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn-primary"
                >
                    + Add Employee
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
                            placeholder="Enter employee name..."
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
                        <label>Email:</label>
                        <input
                            type="email"
                            value={filters.email}
                            onChange={(e) => handleFilterChange('email', e.target.value)}
                            placeholder="Enter email..."
                        />
                    </div>
                    <div className="filter-group">
                        <label>Status:</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    <div className="filter-group">
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
                            <th>Account ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee) => (
                            <tr key={employee.PK_Employee}>
                                <td>{employee.PK_Employee}</td>
                                <td>{employee.AccountID}</td>
                                <td>{employee.Name}</td>
                                <td>{employee.Phone || 'N/A'}</td>
                                <td>{employee.Email || 'N/A'}</td>
                                <td>{employee.Status || 'ACTIVE'}</td>
                                <td>{employee.Creation_date ? new Date(employee.Creation_date).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleEdit(employee)} className="btn-edit">
                                            Edit
                                        </button>
                                        {employee.Status === 'ACTIVE' ? (
                                            <button
                                                onClick={() => handleDeactivate(employee.PK_Employee)}
                                                className="btn-delete"
                                            >
                                                Deactivate
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleReactivate(employee.PK_Employee)}
                                                className="btn-success"
                                            >
                                                Reactivate
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Account ID *</label>
                                <input
                                    type="number"
                                    value={formData.AccountID}
                                    onChange={(e) =>
                                        setFormData({ ...formData, AccountID: parseInt(e.target.value) })
                                    }
                                    required
                                />
                            </div>
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
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.Email}
                                    onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    {editingEmployee ? 'Update' : 'Create'}
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
            )}
        </div>
    );
}
