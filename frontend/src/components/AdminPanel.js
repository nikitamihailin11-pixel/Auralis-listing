import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Clock, RefreshCw, Shield } from 'lucide-react';
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
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
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
      toast.success(`Status updated: ${newStatus}`);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'pending': return 'text-[#d4a853] bg-[#d4a853]/10 border-[#d4a853]/20';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
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
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#162234] py-20 px-4">
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
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4a853] to-[#c87840] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#0d1117]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
                <p className="text-gray-400">Orders management and statistics</p>
              </div>
            </div>
            <Button
              onClick={() => { fetchOrders(); fetchStats(); }}
              className="bg-gradient-to-r from-[#d4a853] to-[#c87840] hover:from-[#e5b964] hover:to-[#d98950] text-[#0d1117]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-[#d4a853]/10 to-[#c87840]/10 border-[#d4a853]/20 p-6">
              <div className="text-sm text-gray-400 mb-1">Total Orders</div>
              <div className="text-3xl font-bold text-white">{stats.total_orders}</div>
            </Card>
            <Card className="bg-gradient-to-br from-[#4dd4e8]/10 to-[#87e8f5]/10 border-[#4dd4e8]/20 p-6">
              <div className="text-sm text-gray-400 mb-1">ARA Sold</div>
              <div className="text-3xl font-bold text-white">{stats.total_ara_sold.toLocaleString()}</div>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-6">
              <div className="text-sm text-gray-400 mb-1">Wallets Connected</div>
              <div className="text-3xl font-bold text-white">{stats.total_wallets}</div>
            </Card>
            <Card className="bg-gradient-to-br from-[#c87840]/10 to-[#d4a853]/10 border-[#c87840]/20 p-6">
              <div className="text-sm text-gray-400 mb-1">ARA Price</div>
              <div className="text-3xl font-bold text-gradient-gold">${stats.ara_price}</div>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
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
                ? 'bg-gradient-to-r from-[#d4a853] to-[#c87840] text-[#0d1117]'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="glass-effect border border-white/10 p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4a853] mx-auto" />
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
                        <code className="text-xs text-[#4dd4e8]">{order.id?.substring(0, 8)}...</code>
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-xs text-gray-300">
                          {order.wallet_address.substring(0, 8)}...{order.wallet_address.substring(order.wallet_address.length - 6)}
                        </code>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-300 capitalize flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                            <span className="text-white font-bold text-[8px]">SOL</span>
                          </div>
                          {order.blockchain}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-white">{order.quantity.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-[#d4a853]">${order.total_amount}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
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
