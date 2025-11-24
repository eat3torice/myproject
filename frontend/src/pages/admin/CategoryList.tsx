import { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../types';
import './Common.css';

export default function CategoryList() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        Name: '',
        Status: 'ACTIVE',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
            alert('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.PK_Category, formData);
            } else {
                await categoryService.create(formData);
            }
            setShowModal(false);
            setEditingCategory(null);
            resetForm();
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to save category');
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            Name: category.Name,
            Status: category.Status || 'ACTIVE',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await categoryService.delete(id);
            loadData();
        } catch (error) {
            alert('Failed to delete category');
        }
    };

    const resetForm = () => {
        setFormData({
            Name: '',
            Status: 'ACTIVE',
        });
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Categories</h1>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn-primary"
                >
                    + Add Category
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.PK_Category}>
                                <td>{category.PK_Category}</td>
                                <td>{category.Name}</td>
                                <td>{category.Status}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleEdit(category)} className="btn-edit">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(category.PK_Category)} className="btn-delete">
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
                        <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
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
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    {editingCategory ? 'Update' : 'Create'}
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
