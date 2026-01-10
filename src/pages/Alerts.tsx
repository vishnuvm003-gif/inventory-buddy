import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { managerApi, Alert } from '@/api/manager';
import { useToastNotification } from '@/components/Toast';
import { LoadingOverlay } from '@/components/LoadingSpinner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Bell, Pencil, X, Check } from 'lucide-react';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { showToast } = useToastNotification();

  const [editQuantity, setEditQuantity] = useState(0);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await managerApi.getAlerts();
      setAlerts(data);
    } catch (error) {
      showToast('Failed to fetch alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRowClass = (level: string) => {
    switch (level) {
      case 'attention':
        return 'table-row-attention';
      case 'emergency':
        return 'table-row-emergency';
      case 'critical':
        return 'table-row-critical';
      default:
        return '';
    }
  };

  const getBadgeClass = (level: string) => {
    switch (level) {
      case 'attention':
        return 'badge-attention';
      case 'emergency':
        return 'badge-emergency';
      case 'critical':
        return 'badge-critical';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const startEdit = (alert: Alert) => {
    setEditingId(alert.batch_id);
    setEditQuantity(0);
    setEditStatus(alert.status);
  };

  const handleUpdate = async (batchId: number) => {
    setSaving(true);
    try {
      if (editQuantity > 0) {
        await managerApi.updateBatchQuantity(batchId, editQuantity);
      }
      await managerApi.updateBatchStatus(batchId, editStatus);
      
      // Refresh alerts after update
      await fetchAlerts();
      setEditingId(null);
      showToast('Alert updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update alert', 'error');
    } finally {
      setSaving(false);
    }
  };

  const criticalCount = alerts.filter((a) => a.alert_level === 'critical').length;
  const emergencyCount = alerts.filter((a) => a.alert_level === 'emergency').length;
  const attentionCount = alerts.filter((a) => a.alert_level === 'attention').length;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Bell className="w-7 h-7 text-primary" />
            Alerts
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor expiring inventory batches
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-elevated p-4 border-l-4 border-l-alert-attention bg-alert-attention-bg">
            <p className="text-sm font-medium text-foreground">Attention</p>
            <p className="text-2xl font-bold text-foreground">{attentionCount}</p>
          </div>
          <div className="card-elevated p-4 border-l-4 border-l-alert-emergency bg-alert-emergency-bg">
            <p className="text-sm font-medium text-foreground">Emergency</p>
            <p className="text-2xl font-bold text-foreground">{emergencyCount}</p>
          </div>
          <div className="card-elevated p-4 border-l-4 border-l-alert-critical bg-alert-critical-bg">
            <p className="text-sm font-medium text-foreground">Critical</p>
            <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="card-elevated overflow-hidden">
          {loading ? (
            <LoadingOverlay />
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No active alerts. Your inventory is in good shape!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Batch ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Batch Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Product ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Alert Level
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
                {alerts.map((alert) => (
                  <tr
                    key={alert.batch_id}
                    className={`${getRowClass(alert.alert_level)} transition-colors`}
                  >
                    {editingId === alert.batch_id ? (
                      <>
                        <td className="px-6 py-4 font-medium text-foreground">
                          {alert.batch_id}
                        </td>
                        <td className="px-6 py-4 text-foreground">{alert.batch_number}</td>
                        <td className="px-6 py-4 text-foreground">{alert.product_id}</td>
                        <td className="px-6 py-4">
                          <span className={`${getBadgeClass(alert.alert_level)} capitalize`}>
                            {alert.alert_level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                              className="input-field w-20"
                              placeholder="Qty"
                              min="0"
                            />
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="input-field w-28"
                            >
                              <option value="active">Active</option>
                              <option value="sold">Sold</option>
                              <option value="expired">Expired</option>
                              <option value="disposed">Disposed</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleUpdate(alert.batch_id)}
                            disabled={saving}
                            className="btn-ghost text-green-600"
                          >
                            {saving ? <LoadingSpinner size="sm" /> : <Check className="w-4 h-4" />}
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
                          {alert.batch_id}
                        </td>
                        <td className="px-6 py-4 text-foreground">{alert.batch_number}</td>
                        <td className="px-6 py-4 text-foreground">{alert.product_id}</td>
                        <td className="px-6 py-4">
                          <span className={`${getBadgeClass(alert.alert_level)} capitalize`}>
                            {alert.alert_level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-foreground capitalize">
                            {alert.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => startEdit(alert)}
                            className="btn-ghost text-primary"
                          >
                            <Pencil className="w-4 h-4" />
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

export default Alerts;
