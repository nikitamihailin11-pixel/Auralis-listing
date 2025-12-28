import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminPanel = ({ onBack }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, failed

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Fetch all orders (we'll need a new endpoint for admin)
      const response = await axios.get(`${API}/orders/all`);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Статус обновлён: ${newStatus}`);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Ошибка обновления статуса');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-500/10';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'failed': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0E14] to-[#151921] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-4 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Main
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
              <p className="text-gray-400">Orders management and statistics</p>
            </div>
            <Button
              onClick={() => { fetchOrders(); fetchStats(); }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
              <div className="text-sm text-gray-400 mb-1">Total Orders</div>
              <div className="text-3xl font-bold text-white">{stats.total_orders}</div>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-6">
              <div className="text-sm text-gray-400 mb-1">ARA Sold</div>
              <div className="text-3xl font-bold text-white">{stats.total_ara_sold.toLocaleString()}</div>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-6">
              <div className="text-sm text-gray-400 mb-1">Wallets</div>
              <div className="text-3xl font-bold text-white">{stats.total_wallets}</div>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 p-6">
              <div className="text-sm text-gray-400 mb-1">ARA Price</div>
              <div className="text-3xl font-bold text-white">${stats.ara_price}</div>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'failed', label: 'Failed' },
          ].map((tab) => (
            <Button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              variant={filter === tab.value ? 'default' : 'outline'}
              className={filter === tab.value
                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
              <p className="text-gray-400 mt-4">Loading...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Wallet</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Network</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Quantity ARA</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Amount</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <code className="text-xs text-purple-300">{order.id?.substring(0, 8)}...</code>
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-xs text-gray-300">
                          {order.wallet_address.substring(0, 10)}...{order.wallet_address.substring(order.wallet_address.length - 6)}
                        </code>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-300 capitalize">{order.blockchain}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-white">{order.quantity.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-green-400">${order.total_amount}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-center">
                          {order.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                ✓
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'failed')}
                                variant="destructive"
                              >
                                ×
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
