import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { managerApi, Product, InventoryBatch } from '@/api/manager';
import { useToastNotification } from '@/components/Toast';
import { LoadingOverlay } from '@/components/LoadingSpinner';
import { Package, Boxes, Bell, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManagerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToastNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, batchesData, alertsData] = await Promise.all([
        managerApi.getProducts(),
        managerApi.getBatches(),
        managerApi.getAlerts(),
      ]);
      setProducts(productsData);
      setBatches(batchesData);
      setAlerts(alertsData);
    } catch (error) {
      showToast('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const criticalAlerts = alerts.filter((a) => a.alert_level === 'critical').length;
  const emergencyAlerts = alerts.filter((a) => a.alert_level === 'emergency').length;
  const attentionAlerts = alerts.filter((a) => a.alert_level === 'attention').length;

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      link: '/manager/products',
    },
    {
      label: 'Inventory Batches',
      value: batches.length,
      icon: Boxes,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/manager/inventory',
    },
    {
      label: 'Active Alerts',
      value: alerts.length,
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/alerts',
    },
    {
      label: 'Total Quantity',
      value: batches.reduce((sum, b) => sum + b.quantity, 0),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <LoadingOverlay />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your inventory</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <div className="card-elevated p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );

            return stat.link ? (
              <Link key={stat.label} to={stat.link}>
                {content}
              </Link>
            ) : (
              <div key={stat.label}>{content}</div>
            );
          })}
        </div>

        {/* Alert Summary */}
        {alerts.length > 0 && (
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Alert Summary</h2>
              <Link to="/alerts" className="text-sm text-primary hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-alert-attention-bg border-l-4 border-l-alert-attention">
                <p className="text-2xl font-bold text-foreground">{attentionAlerts}</p>
                <p className="text-sm text-muted-foreground">Attention</p>
              </div>
              <div className="p-4 rounded-lg bg-alert-emergency-bg border-l-4 border-l-alert-emergency">
                <p className="text-2xl font-bold text-foreground">{emergencyAlerts}</p>
                <p className="text-sm text-muted-foreground">Emergency</p>
              </div>
              <div className="p-4 rounded-lg bg-alert-critical-bg border-l-4 border-l-alert-critical">
                <p className="text-2xl font-bold text-foreground">{criticalAlerts}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Products */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Products</h2>
            <Link to="/manager/products" className="text-sm text-primary hover:underline">
              Manage products →
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="text-muted-foreground">No products yet. Add your first product!</p>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.type} • {product.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;
