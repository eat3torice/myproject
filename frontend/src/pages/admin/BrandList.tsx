import { useState, useEffect } from 'react';
import { brandService } from '../../services/brandService';
import type { Brand } from '../../types';
import './Common.css';

export default function BrandList() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({
        Name: '',
        Note: '',
        Status: 'ACTIVE',
    });
    const [filters, setFilters] = useState({
        name: '',
        status: '',
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        try {
            const data = await brandService.getAll({
                skip: 0,
                limit: 100,
                name: filters.name || undefined,
                status: filters.status || undefined,
            });
            setBrands(data);
        } catch (error) {
            console.error('Error loading brands:', error);
            alert('Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBrand) {
                await brandService.update(editingBrand.PK_Brand, formData);
            } else {
                await brandService.create(formData);
            }
            setShowModal(false);
            setEditingBrand(null);
            resetForm();
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to save brand');
        }
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData({
            Name: brand.Name,
            Note: brand.Note || '',
            Status: brand.Status || 'ACTIVE',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this brand?')) return;
        try {
            await brandService.delete(id);
            loadData();
        } catch (error) {
            alert('Failed to delete brand');
        }
    };

    const resetForm = () => {
        setFormData({
            Name: '',
            Note: '',
            Status: 'ACTIVE',
        });
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({ name: '', status: '' });
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Brands</h1>
                <button
                    onClick={() => {
                        setEditingBrand(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn-primary"
                >
                    + Add Brand
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
                            placeholder="Enter brand name..."
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
                            <th>Note</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.map((brand) => (
                            <tr key={brand.PK_Brand}>
                                <td>{brand.PK_Brand}</td>
                                <td>{brand.Name}</td>
                                <td>{brand.Note || 'N/A'}</td>
                                <td>{brand.Status}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleEdit(brand)} className="btn-edit">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(brand.PK_Brand)} className="btn-delete">
                                            Delete
                                        </button>
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
                        <h2>{editingBrand ? 'Edit Brand' : 'Add Brand'}</h2>
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
                                    {editingBrand ? 'Update' : 'Create'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
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
