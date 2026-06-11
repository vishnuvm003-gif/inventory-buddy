import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { managerApi, Product, CreateProductRequest } from '@/api/manager';
import { useToastNotification } from '@/components/Toast';
import { LoadingOverlay } from '@/components/LoadingSpinner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Plus, Pencil, Trash2, X, Check, Package } from 'lucide-react';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToastNotification();

  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    type: '',
    category: '',
  });

  const [editData, setEditData] = useState<CreateProductRequest>({
    name: '',
    type: '',
    category: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await managerApi.getProducts();
      setProducts(data);
    } catch (error) {
      showToast('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.type.trim() || !formData.category.trim()) {
      showToast('All fields are required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const newProduct = await managerApi.createProduct(formData);
      setProducts([...products, newProduct]);
      setFormData({ name: '', type: '', category: '' });
      setShowForm(false);
      showToast('Product created successfully', 'success');
    } catch (error) {
      showToast('Failed to create product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditData({
      name: product.name,
      type: product.type,
      category: product.category,
    });
  };

  const handleUpdate = async (id: number) => {
    if (!editData.name.trim() || !editData.type.trim() || !editData.category.trim()) {
      showToast('All fields are required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const updatedProduct = await managerApi.updateProduct(id, editData);
      setProducts(products.map((p) => (p.id === id ? updatedProduct : p)));
      setEditingId(null);
      showToast('Product updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update product', 'error');
      console.log(error)
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await managerApi.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      showToast('Product deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete product', 'error');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Package className="w-7 h-7 text-primary" />
              Products
            </h1>
            <p className="text-muted-foreground mt-1">Manage your product catalog</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Type *
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Dairy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Perishable"
                />
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? <LoadingSpinner size="sm" /> : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="card-elevated overflow-hidden">
          {loading ? (
            <LoadingOverlay />
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No products found. Add your first product to get started.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product, index) => (
                  <tr key={product.id ?? index} className="hover:bg-muted/30 transition-colors">
                    {editingId === product.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="input-field"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editData.type}
                            onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                            className="input-field"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editData.category}
                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                            className="input-field"
                          />
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleUpdate(product.id)}
                            disabled={saving}
                            className="btn-ghost text-green-600"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn-ghost text-muted-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-medium text-foreground">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{product.type}</td>
                        <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => startEdit(product)}
                            className="btn-ghost text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="btn-ghost text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Products;
