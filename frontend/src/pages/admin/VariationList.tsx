import { useState, useEffect } from 'react';
import { variationService } from '../../services/variationService';
import { productService } from '../../services/productService';
import { imagesService } from '../../services/imagesService';
import { API_BASE_URL } from '../../config/api';
import type { Variation, Product } from '../../types';
import './Common.css';

interface Image {
    PK_Images: number;
    ProductID?: number;
    VariationID?: number;
    Id_Image: string;
    Set_Default: boolean;
}

export default function VariationList() {
    const [variations, setVariations] = useState<Variation[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVariation, setEditingVariation] = useState<Variation | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadingVariation, setUploadingVariation] = useState<Variation | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [setDefault, setSetDefault] = useState(false);
    const [productImages, setProductImages] = useState<{ [key: number]: Image[] }>({});
    const [formData, setFormData] = useState({
        ProductID: 0,
        SKU: '',
        Name: '',
        Price: 0,
        Quantity: 0,
        Color: '',
        Material: '',
        Size: '',
        Description: '',
        Status: 'ACTIVE',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [variationsData, productsData] = await Promise.all([
                variationService.getAll(0, 100),
                productService.getAll({ skip: 0, limit: 100 }),
            ]);
            setVariations(variationsData);
            setProducts(productsData);
            await loadImages(variationsData);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const loadImages = async (variations: Variation[]) => {
        const imagesMap: { [key: number]: Image[] } = {};
        for (const variation of variations) {
            try {
                const images = await imagesService.getImagesByVariationAdmin(variation.PK_Variation);
                imagesMap[variation.PK_Variation] = images;
            } catch (error) {
                console.error(`Error loading images for variation ${variation.PK_Variation}:`, error);
                imagesMap[variation.PK_Variation] = [];
            }
        }
        setProductImages(imagesMap);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingVariation) {
                await variationService.update(editingVariation.PK_Variation, formData);
            } else {
                await variationService.create(formData);
            }
            setShowModal(false);
            setEditingVariation(null);
            resetForm();
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to save variation');
        }
    };

    const handleEdit = (variation: Variation) => {
        setEditingVariation(variation);
        setFormData({
            ProductID: variation.ProductID,
            SKU: variation.SKU,
            Name: variation.Name,
            Price: variation.Price,
            Quantity: variation.Quantity,
            Color: variation.Color || '',
            Material: variation.Material || '',
            Size: variation.Size || '',
            Description: variation.Description || '',
            Status: variation.Status || 'ACTIVE',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this variation?')) return;
        try {
            await variationService.delete(id);
            loadData();
        } catch (error) {
            alert('Failed to delete variation');
        }
    };

    const handleUploadImage = (variation: Variation) => {
        setUploadingVariation(variation);
        setSelectedFile(null);
        setSetDefault(false);
        setShowUploadModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !uploadingVariation) return;

        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedFile);

        try {
            // Note: This assumes variation_router has upload endpoint
            // You may need to adjust the API call based on your backend
            const response = await fetch(`${API_BASE_URL}/admin/variations/${uploadingVariation.PK_Variation}/upload-image`, {
                method: 'POST',
                body: formDataUpload,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                alert('Image uploaded successfully');
                setShowUploadModal(false);
                loadData(); // Reload to show updated images
            } else {
                alert('Failed to upload image');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        }
    };

    const handleDeleteImage = async (imageId: number, variationId: number) => {
        if (!confirm('Are you sure you want to delete this image?')) return;
        try {
            await imagesService.deleteImage(imageId);
            // Update the local state to remove the deleted image
            setProductImages(prev => ({
                ...prev,
                [variationId]: prev[variationId]?.filter(img => img.PK_Images !== imageId) || []
            }));
            alert('Image deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete image');
        }
    };

    const resetForm = () => {
        setFormData({
            ProductID: 0,
            SKU: '',
            Name: '',
            Price: 0,
            Quantity: 0,
            Color: '',
            Material: '',
            Size: '',
            Description: '',
            Status: 'ACTIVE',
        });
    };

    const getProductName = (id: number) => {
        return products.find((p) => p.PK_Product === id)?.Name || 'N/A';
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Variations</h1>
                <button
                    onClick={() => {
                        setEditingVariation(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn-primary"
                >
                    + Add Variation
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product</th>
                            <th>Image</th>
                            <th>SKU</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Color</th>
                            <th>Size</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {variations.map((variation) => {
                            console.log('Variation:', variation);
                            const images = productImages[variation.PK_Variation] || [];
                            console.log('Images for variation', variation.PK_Variation, ':', images);
                            const defaultImage = images.find(img => img.Set_Default) || images[0];
                            console.log('Default image:', defaultImage);
                            const imageUrl = defaultImage ?
                                (defaultImage.Id_Image.startsWith('/static/') ?
                                    `${API_BASE_URL}${defaultImage.Id_Image}` :
                                    `${API_BASE_URL}/static/images/${defaultImage.Id_Image}`) :
                                '';
                            console.log('Image URL:', imageUrl);

                            return (
                                <tr key={variation.PK_Variation}>
                                    <td>{variation.PK_Variation}</td>
                                    <td>{getProductName(variation.ProductID)}</td>
                                    <td>
                                        {defaultImage ? (
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <img
                                                    src={imageUrl}
                                                    alt={variation.Name}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                                                    onError={() => {
                                                        console.error('Image failed to load:', imageUrl);
                                                        // Don't hide the image, let the browser show the broken image icon
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleDeleteImage(defaultImage.PK_Images, variation.PK_Variation)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-5px',
                                                        right: '-5px',
                                                        background: 'red',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '20px',
                                                        height: '20px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="Delete image"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#999' }}>No Image</span>
                                        )}
                                    </td>
                                    <td>{variation.SKU}</td>
                                    <td>{variation.Name}</td>
                                    <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(variation.Price))}</td>
                                    <td>{variation.Quantity}</td>
                                    <td>{variation.Color || 'N/A'}</td>
                                    <td>{variation.Size || 'N/A'}</td>
                                    <td>{variation.Status || 'N/A'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleEdit(variation)} className="btn-edit">
                                                Edit
                                            </button>
                                            <button onClick={() => handleUploadImage(variation)} className="btn-secondary">
                                                Upload Image
                                            </button>
                                            <button
                                                onClick={() => handleDelete(variation.PK_Variation)}
                                                className="btn-delete"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingVariation ? 'Edit Variation' : 'Add Variation'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product *</label>
                                <select
                                    value={formData.ProductID}
                                    onChange={(e) =>
                                        setFormData({ ...formData, ProductID: parseInt(e.target.value) })
                                    }
                                    required
                                >
                                    <option value={0}>Select Product</option>
                                    {products.map((product) => (
                                        <option key={product.PK_Product} value={product.PK_Product}>
                                            {product.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>SKU *</label>
                                <input
                                    type="text"
                                    value={formData.SKU}
                                    onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
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
                                <label>Price *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.Price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, Price: parseFloat(e.target.value) })
                                    }
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Quantity *</label>
                                <input
                                    type="number"
                                    value={formData.Quantity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, Quantity: parseInt(e.target.value) })
                                    }
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <input
                                    type="text"
                                    value={formData.Color}
                                    onChange={(e) => setFormData({ ...formData, Color: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Material</label>
                                <input
                                    type="text"
                                    value={formData.Material}
                                    onChange={(e) => setFormData({ ...formData, Material: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Size</label>
                                <input
                                    type="text"
                                    value={formData.Size}
                                    onChange={(e) => setFormData({ ...formData, Size: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.Description}
                                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
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
                                    {editingVariation ? 'Update' : 'Create'}
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

            {showUploadModal && uploadingVariation && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Upload Image for {uploadingVariation.Name}</h2>
                        <form onSubmit={handleUploadSubmit}>
                            <div className="form-group">
                                <label>Image File *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={setDefault}
                                        onChange={(e) => setSetDefault(e.target.checked)}
                                    />
                                    Set as default image
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
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
