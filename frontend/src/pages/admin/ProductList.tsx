import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { brandService } from '../../services/brandService';
import type { Product, Category, Brand } from '../../types';
import './Common.css';

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        Name: '',
        Images: '',
        CategoryID: 0,
        BrandID: 0,
    });
    const [filters, setFilters] = useState({
        name: '',
        category_id: '',
        brand_id: '',
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        try {
            const [productsData, categoriesData, brandsData] = await Promise.all([
                productService.getAll({
                    skip: 0,
                    limit: 100,
                    name: filters.name || undefined,
                    category_id: filters.category_id ? parseInt(filters.category_id) : undefined,
                    brand_id: filters.brand_id ? parseInt(filters.brand_id) : undefined,
                }),
                categoryService.getAll(),
                brandService.getAll(),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setBrands(brandsData);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Trim and validate
        const trimmedName = formData.Name.trim();
        const trimmedImages = formData.Images.trim();

        if (!trimmedName) {
            alert('Product name is required.');
            return;
        }
        if (trimmedName.length < 2) {
            alert('Product name must be at least 2 characters.');
            return;
        }
        if (trimmedName.length > 200) {
            alert('Product name must not exceed 200 characters.');
            return;
        }
        if (!formData.CategoryID || formData.CategoryID === 0) {
            alert('Please select a category.');
            return;
        }
        if (!formData.BrandID || formData.BrandID === 0) {
            alert('Please select a brand.');
            return;
        }
        if (trimmedImages && trimmedImages.length > 500) {
            alert('Images URL must not exceed 500 characters.');
            return;
        }

        const dataToSubmit = {
            Name: trimmedName,
            Images: trimmedImages,
            CategoryID: formData.CategoryID,
            BrandID: formData.BrandID,
        };

        try {
            if (editingProduct) {
                await productService.update(editingProduct.PK_Product, dataToSubmit);
            } else {
                await productService.create(dataToSubmit);
            }
            setShowModal(false);
            setEditingProduct(null);
            resetForm();
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to save product');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            Name: product.Name,
            Images: product.Images,
            CategoryID: product.CategoryID,
            BrandID: product.BrandID,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await productService.delete(id);
            loadData();
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData({
            Name: '',
            Images: '',
            CategoryID: 0,
            BrandID: 0,
        });
    };

    const getCategoryName = (id: number) => {
        return categories.find((c) => c.PK_Category === id)?.Name || 'N/A';
    };

    const getBrandName = (id: number) => {
        return brands.find((b) => b.PK_Brand === id)?.Name || 'N/A';
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({ name: '', category_id: '', brand_id: '' });
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Products</h1>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn-primary"
                >
                    + Add Product
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
                            placeholder="Enter product name..."
                        />
                    </div>
                    <div className="filter-group">
                        <label>Category:</label>
                        <select
                            value={filters.category_id}
                            onChange={(e) => handleFilterChange('category_id', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.PK_Category} value={cat.PK_Category}>
                                    {cat.Name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Brand:</label>
                        <select
                            value={filters.brand_id}
                            onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                        >
                            <option value="">All Brands</option>
                            {brands.map((brand) => (
                                <option key={brand.PK_Brand} value={brand.PK_Brand}>
                                    {brand.Name}
                                </option>
                            ))}
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
                            <th>Category</th>
                            <th>Brand</th>
                            <th>Images</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.PK_Product}>
                                <td>{product.PK_Product}</td>
                                <td>{product.Name}</td>
                                <td>{getCategoryName(product.CategoryID)}</td>
                                <td>{getBrandName(product.BrandID)}</td>
                                <td>{product.Images || 'No image'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="btn-edit"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.PK_Product)}
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

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={formData.Name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, Name: e.target.value })
                                    }
                                    required
                                    minLength={2}
                                    maxLength={200}
                                />
                            </div>
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={formData.CategoryID}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            CategoryID: parseInt(e.target.value),
                                        })
                                    }
                                    required
                                >
                                    <option value={0}>Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.PK_Category} value={cat.PK_Category}>
                                            {cat.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Brand *</label>
                                <select
                                    value={formData.BrandID}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            BrandID: parseInt(e.target.value),
                                        })
                                    }
                                    required
                                >
                                    <option value={0}>Select Brand</option>
                                    {brands.map((brand) => (
                                        <option key={brand.PK_Brand} value={brand.PK_Brand}>
                                            {brand.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Images</label>
                                <input
                                    type="text"
                                    value={formData.Images}
                                    onChange={(e) =>
                                        setFormData({ ...formData, Images: e.target.value })
                                    }
                                    placeholder="image.jpg"
                                    maxLength={500}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    {editingProduct ? 'Update' : 'Create'}
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
