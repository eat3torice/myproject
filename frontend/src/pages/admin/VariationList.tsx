import { useState, useEffect } from 'react';
import { variationService } from '../../services/variationService';
import { productService } from '../../services/productService';
import { imagesService } from '../../services/imagesService';
import api, { API_BASE_URL } from '../../config/api';
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
    const [imageUrl, setImageUrl] = useState('');
    const [setDefault, setSetDefault] = useState(false);
    const [productImages, setProductImages] = useState<{ [key: number]: Image[] }>({});
    const [showImageGallery, setShowImageGallery] = useState(false);
    const [selectedVariationImages, setSelectedVariationImages] = useState<Image[]>([]);
    const [selectedVariationName, setSelectedVariationName] = useState('');
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

        // Trim and validate
        const trimmedSKU = formData.SKU.trim();
        const trimmedName = formData.Name.trim();
        const trimmedColor = formData.Color.trim();
        const trimmedMaterial = formData.Material.trim();
        const trimmedSize = formData.Size.trim();
        const trimmedDescription = formData.Description.trim();

        // Validate Product
        if (!formData.ProductID || formData.ProductID === 0) {
            alert('Please select a product.');
            return;
        }

        // Validate SKU
        if (!trimmedSKU) {
            alert('SKU is required.');
            return;
        }
        if (trimmedSKU.length < 2) {
            alert('SKU must be at least 2 characters.');
            return;
        }
        if (trimmedSKU.length > 50) {
            alert('SKU must not exceed 50 characters.');
            return;
        }

        // Validate Name
        if (trimmedName && trimmedName.length > 200) {
            alert('Name must not exceed 200 characters.');
            return;
        }

        // Validate Price
        if (formData.Price < 0) {
            alert('Price cannot be negative.');
            return;
        }
        if (formData.Price > 999999999) {
            alert('Price is too large.');
            return;
        }

        // Validate Quantity
        if (formData.Quantity < 0) {
            alert('Quantity cannot be negative.');
            return;
        }
        if (!Number.isInteger(formData.Quantity)) {
            alert('Quantity must be a whole number.');
            return;
        }

        // Validate optional fields
        if (trimmedColor && trimmedColor.length > 50) {
            alert('Color must not exceed 50 characters.');
            return;
        }
        if (trimmedMaterial && trimmedMaterial.length > 50) {
            alert('Material must not exceed 50 characters.');
            return;
        }
        if (trimmedSize && trimmedSize.length > 50) {
            alert('Size must not exceed 50 characters.');
            return;
        }
        if (trimmedDescription && trimmedDescription.length > 1000) {
            alert('Description must not exceed 1000 characters.');
            return;
        }

        const dataToSubmit = {
            ProductID: formData.ProductID,
            SKU: trimmedSKU,
            Name: trimmedName,
            Price: formData.Price,
            Quantity: formData.Quantity,
            Color: trimmedColor,
            Material: trimmedMaterial,
            Size: trimmedSize,
            Description: trimmedDescription,
            Status: formData.Status,
        };

        try {
            if (editingVariation) {
                await variationService.update(editingVariation.PK_Variation, dataToSubmit);
            } else {
                await variationService.create(dataToSubmit);
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
        // Kiểm tra số lượng ảnh hiện tại
        const currentImages = productImages[variation.PK_Variation] || [];
        if (currentImages.length >= 3) {
            alert('Maximum 3 images per variation');
            return;
        }

        setUploadingVariation(variation);
        setImageUrl('');
        setSetDefault(false);
        setShowUploadModal(true);
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Trim and validate image URL
        const trimmedImageUrl = imageUrl.trim();

        if (!trimmedImageUrl) {
            alert('Please enter image URL');
            return;
        }

        // Validate URL format
        try {
            const url = new URL(trimmedImageUrl);
            if (!url.protocol.startsWith('http')) {
                alert('Image URL must start with http:// or https://');
                return;
            }
        } catch {
            alert('Invalid URL format');
            return;
        }

        if (trimmedImageUrl.length > 500) {
            alert('Image URL must not exceed 500 characters.');
            return;
        }

        if (!uploadingVariation) {
            alert('No variation selected');
            return;
        }

        try {
            const response = await api.post(`/admin/variations/${uploadingVariation.PK_Variation}/add-image-url`, null, {
                params: {
                    image_url: trimmedImageUrl,
                    set_default: setDefault
                }
            });

            if (response.status === 200) {
                alert('Image added successfully');
                setShowUploadModal(false);
                setImageUrl('');
                loadData(); // Reload to show updated images
            } else {
                alert('Failed to add image');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMsg = error.response?.data?.detail || 'Failed to add image';
            alert(errorMsg);
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

    const handleViewImages = (variation: Variation) => {
        const images = productImages[variation.PK_Variation] || [];
        setSelectedVariationImages(images);
        setSelectedVariationName(variation.Name);
        setShowImageGallery(true);
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

                            // Fix image URL handling
                            let imageUrl = '';
                            if (defaultImage) {
                                const imagePath = defaultImage.Id_Image;
                                if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                                    // External URL - use as is
                                    imageUrl = imagePath;
                                } else if (imagePath.startsWith('/static/')) {
                                    // Local path starting with /static/
                                    imageUrl = `${API_BASE_URL}${imagePath}`;
                                } else {
                                    // Local path without /static/
                                    imageUrl = `${API_BASE_URL}/static/images/${imagePath}`;
                                }
                            }
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
                                            <button
                                                onClick={() => handleViewImages(variation)}
                                                className="btn-info"
                                                disabled={(productImages[variation.PK_Variation] || []).length === 0}
                                                title={(productImages[variation.PK_Variation] || []).length === 0 ? "No images" : "View Images"}
                                            >
                                                View Images ({(productImages[variation.PK_Variation] || []).length})
                                            </button>
                                            <button
                                                onClick={() => handleUploadImage(variation)}
                                                className="btn-secondary"
                                                disabled={(productImages[variation.PK_Variation] || []).length >= 3}
                                                title={(productImages[variation.PK_Variation] || []).length >= 3 ? "Maximum 3 images" : "Add Image URL"}
                                            >
                                                Add Image ({(productImages[variation.PK_Variation] || []).length}/3)
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
                                    minLength={2}
                                    maxLength={50}
                                />
                            </div>
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={formData.Name}
                                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                                    required
                                    maxLength={200}
                                />
                            </div>
                            <div className="form-group">
                                <label>Price *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="999999999"
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
                                    min="0"
                                    step="1"
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
                                    maxLength={50}
                                />
                            </div>
                            <div className="form-group">
                                <label>Material</label>
                                <input
                                    type="text"
                                    value={formData.Material}
                                    onChange={(e) => setFormData({ ...formData, Material: e.target.value })}
                                    maxLength={50}
                                />
                            </div>
                            <div className="form-group">
                                <label>Size</label>
                                <input
                                    type="text"
                                    value={formData.Size}
                                    onChange={(e) => setFormData({ ...formData, Size: e.target.value })}
                                    maxLength={50}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.Description}
                                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                    rows={3}
                                    maxLength={1000}
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
                        <h2>Add Image URL for {uploadingVariation.Name}</h2>
                        <form onSubmit={handleUploadSubmit}>
                            <div className="form-group">
                                <label>Image URL *</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://cdn.jsdelivr.net/gh/..."
                                    required
                                    maxLength={500}
                                    pattern="https?://.+"
                                    title="Must be a valid HTTP or HTTPS URL"
                                />
                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                    Example: https://cdn.jsdelivr.net/gh/eat4torice/my_image@hash/image.png
                                </small>
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
                                    Add Image
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

            {showImageGallery && selectedVariationImages.length > 0 && (
                <div className="modal-overlay" onClick={() => setShowImageGallery(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <h2>Images: {selectedVariationName}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                            {selectedVariationImages.map((image) => {
                                const imageUrl = image.Id_Image.startsWith('http')
                                    ? image.Id_Image
                                    : image.Id_Image.startsWith('/static/')
                                        ? `${API_BASE_URL}${image.Id_Image}`
                                        : `${API_BASE_URL}/static/images/${image.Id_Image}`;

                                return (
                                    <div key={image.PK_Images} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                        <img
                                            src={imageUrl}
                                            alt='Variation image'
                                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                        />
                                        <div style={{ padding: '10px' }}>
                                            <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', wordBreak: 'break-all' }}>
                                                {image.Id_Image}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    const variation = variations.find(v =>
                                                        (productImages[v.PK_Variation] || []).some(img => img.PK_Images === image.PK_Images)
                                                    );
                                                    if (variation) {
                                                        handleDeleteImage(image.PK_Images, variation.PK_Variation);
                                                    }
                                                }}
                                                className="btn-delete"
                                                style={{ width: '100%' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button
                                type="button"
                                onClick={() => setShowImageGallery(false)}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
