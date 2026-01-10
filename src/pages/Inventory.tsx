import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { managerApi, Product, InventoryBatch, CreateBatchRequest } from '@/api/manager';
import { useToastNotification } from '@/components/Toast';
import { LoadingOverlay } from '@/components/LoadingSpinner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Plus, Pencil, Trash2, X, Check, Boxes } from 'lucide-react';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToastNotification();

  const [formData, setFormData] = useState<CreateBatchRequest>({
    product_id: 0,
    batch_number: '',
    expiry_date: '',
    quantity: 0,
  });

  const [editQuantity, setEditQuantity] = useState(0);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, batchesData] = await Promise.all([
        managerApi.getProducts(),
        managerApi.getBatches(),
      ]);
      setProducts(productsData);
      setBatches(batchesData);
      if (productsData.length > 0) {
        setFormData((prev) => ({ ...prev, product_id: productsData[0].id }));
      }
    } catch (error) {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || 'Unknown';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batch_number.trim() || !formData.expiry_date || formData.quantity <= 0) {
      showToast('All fields are required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const newBatch = await managerApi.createBatch(formData);
      setBatches([...batches, newBatch]);
      setFormData({
        product_id: products[0]?.id || 0,
        batch_number: '',
        expiry_date: '',
        quantity: 0,
      });
      setShowForm(false);
      showToast('Batch created successfully', 'success');
    } catch (error) {
      showToast('Failed to create batch', 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (batch: InventoryBatch) => {
    setEditingId(batch.id);
    setEditQuantity(batch.quantity);
    setEditStatus(batch.status || 'active');
  };

  const handleUpdate = async (id: number) => {
    setSaving(true);
    try {
      await managerApi.updateBatchQuantity(id, editQuantity);
      await managerApi.updateBatchStatus(id, editStatus);
      setBatches(
        batches.map((b) =>
          b.id === id ? { ...b, quantity: editQuantity, status: editStatus } : b
        )
      );
      setEditingId(null);
      showToast('Batch updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update batch', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;

    try {
      await managerApi.deleteBatch(id);
      setBatches(batches.filter((b) => b.id !== id));
      showToast('Batch deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete batch', 'error');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Boxes className="w-7 h-7 text-primary" />
              Inventory Batches
            </h1>
            <p className="text-muted-foreground mt-1">Track and manage stock batches</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
            disabled={products.length === 0}
          >
            <Plus className="w-4 h-4" />
            Add Batch
          </button>
        </div>

        {products.length === 0 && !loading && (
          <div className="card-elevated p-6 bg-yellow-50 border-yellow-200">
            <p className="text-yellow-800">
              No products available. Please add products first before creating batches.
            </p>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Batch</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Product *
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) =>
                    setFormData({ ...formData, product_id: parseInt(e.target.value) })
                  }
                  className="input-field"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Batch Number *
                </label>
                <input
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  className="input-field"
                  placeholder="e.g., BATCH-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                  }
                  className="input-field"
                  min="1"
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

        {/* Batches Table */}
        <div className="card-elevated overflow-hidden">
          {loading ? (
            <LoadingOverlay />
          ) : batches.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No batches found. Add your first batch to get started.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Batch Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-muted/30 transition-colors">
                    {editingId === batch.id ? (
                      <>
                        <td className="px-6 py-4 font-medium text-foreground">
                          {getProductName(batch.product_id)}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{batch.batch_number}</td>
                        <td className="px-6 py-4 text-muted-foreground">{batch.expiry_date}</td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                            className="input-field w-24"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="input-field w-32"
                          >
                            <option value="active">Active</option>
                            <option value="sold">Sold</option>
                            <option value="expired">Expired</option>
                            <option value="disposed">Disposed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleUpdate(batch.id)}
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
                          {getProductName(batch.product_id)}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{batch.batch_number}</td>
                        <td className="px-6 py-4 text-muted-foreground">{batch.expiry_date}</td>
                        <td className="px-6 py-4 text-muted-foreground">{batch.quantity}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground capitalize">
                            {batch.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => startEdit(batch)}
                            className="btn-ghost text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(batch.id)}
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

export default Inventory;
