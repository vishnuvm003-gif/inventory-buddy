import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { adminApi, ExpiryRule, CreateExpiryRuleRequest } from '@/api/admin';
import { useToastNotification } from '@/components/Toast';
import { LoadingOverlay } from '@/components/LoadingSpinner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Plus, Pencil, Trash2, X, Check, Shield } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [rules, setRules] = useState<ExpiryRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToastNotification();

  const [formData, setFormData] = useState<CreateExpiryRuleRequest>({
    product_type: '',
    attention_days: 0,
    emergency_days: 0,
    critical_days: 0,
  });

  const [editData, setEditData] = useState<CreateExpiryRuleRequest>({
    product_type: '',
    attention_days: 0,
    emergency_days: 0,
    critical_days: 0,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await adminApi.getExpiryRules();
      setRules(data);
    } catch (error) {
      showToast('Failed to fetch expiry rules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_type.trim()) {
      showToast('Product type is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const newRule = await adminApi.createExpiryRule(formData);
      setRules([...rules, newRule]);
      setFormData({ product_type: '', attention_days: 0, emergency_days: 0, critical_days: 0 });
      setShowForm(false);
      showToast('Expiry rule created successfully', 'success');
    } catch (error) {
      showToast('Failed to create expiry rule', 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (rule: ExpiryRule) => {
    setEditingId(rule.id);
    setEditData({
      product_type: rule.product_type,
      attention_days: rule.attention_days,
      emergency_days: rule.emergency_days,
      critical_days: rule.critical_days,
    });
  };

  const handleUpdate = async (id: number) => {
    if (!editData.product_type.trim()) {
      showToast('Product type is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const updatedRule = await adminApi.updateExpiryRule(id, editData);
      setRules(rules.map((r) => (r.id === id ? updatedRule : r)));
      setEditingId(null);
      showToast('Expiry rule updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update expiry rule', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await adminApi.deleteExpiryRule(id);
      setRules(rules.filter((r) => r.id !== id));
      showToast('Expiry rule deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete expiry rule', 'error');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-7 h-7 text-primary" />
              Expiry Rules
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage alert thresholds for product expiration
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold mb-4">Create Expiry Rule</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Product Type *
                </label>
                <input
                  type="text"
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Dairy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Attention Days
                </label>
                <input
                  type="number"
                  value={formData.attention_days}
                  onChange={(e) => setFormData({ ...formData, attention_days: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Emergency Days
                </label>
                <input
                  type="number"
                  value={formData.emergency_days}
                  onChange={(e) => setFormData({ ...formData, emergency_days: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Critical Days
                </label>
                <input
                  type="number"
                  value={formData.critical_days}
                  onChange={(e) => setFormData({ ...formData, critical_days: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  min="0"
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

        {/* Rules Table */}
        <div className="card-elevated overflow-hidden">
          {loading ? (
            <LoadingOverlay />
          ) : rules.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No expiry rules found. Create one to get started.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Product Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Attention (days)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Emergency (days)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Critical (days)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-muted/30 transition-colors">
                    {editingId === rule.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editData.product_type}
                            onChange={(e) => setEditData({ ...editData, product_type: e.target.value })}
                            className="input-field"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editData.attention_days}
                            onChange={(e) => setEditData({ ...editData, attention_days: parseInt(e.target.value) || 0 })}
                            className="input-field w-24"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editData.emergency_days}
                            onChange={(e) => setEditData({ ...editData, emergency_days: parseInt(e.target.value) || 0 })}
                            className="input-field w-24"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editData.critical_days}
                            onChange={(e) => setEditData({ ...editData, critical_days: parseInt(e.target.value) || 0 })}
                            className="input-field w-24"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleUpdate(rule.id)}
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
                          {rule.product_type}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <span className="badge-attention">{rule.attention_days}</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <span className="badge-emergency">{rule.emergency_days}</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <span className="badge-critical">{rule.critical_days}</span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => startEdit(rule)}
                            className="btn-ghost text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
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

export default AdminDashboard;
