import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, LogOut, Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { getAdminStats, getAllUsers, getBookings, getPayouts, processPayout } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, usersData, bookingsData, payoutsData] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getBookings(),
        getPayouts()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setBookings(bookingsData);
      setPayouts(payoutsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (payoutId) => {
    try {
      await processPayout(payoutId);
      toast.success('Payout processed successfully!');
      loadData();
    } catch (error) {
      toast.error('Failed to process payout');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      PROCESSED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="admin-dashboard">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-xl text-[#0F172A]">UrbanCab Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium text-sm">{user?.name}</div>
              <div className="text-xs text-slate-600">Administrator</div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} data-testid="logout-btn">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="p-6 border-slate-100" data-testid="stat-card-users">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{stats.total_users}</p>
                </div>
                <Users className="h-8 w-8 text-primary/20" />
              </div>
            </Card>
            <Card className="p-6 border-slate-100" data-testid="stat-card-bookings">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{stats.total_bookings}</p>
                </div>
                <Car className="h-8 w-8 text-secondary/20" />
              </div>
            </Card>
            <Card className="p-6 border-slate-100" data-testid="stat-card-revenue">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{formatCurrency(stats.total_revenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-status-success/20" />
              </div>
            </Card>
            <Card className="p-6 border-slate-100" data-testid="stat-card-commission">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Admin Earnings</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{formatCurrency(stats.admin_earnings)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-status-info/20" />
              </div>
            </Card>
            <Card className="p-6 border-slate-100" data-testid="stat-card-active">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{stats.active_bookings}</p>
                </div>
                <Activity className="h-8 w-8 text-primary/20" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-600 hover:text-primary'
            }`}
            data-testid="tab-overview"
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-600 hover:text-primary'
            }`}
            data-testid="tab-users"
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-600 hover:text-primary'
            }`}
            data-testid="tab-bookings"
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'payouts'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-600 hover:text-primary'
            }`}
            data-testid="tab-payouts"
          >
            Payouts
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6">
            <Card className="border-slate-100" data-testid="recent-bookings">
              <div className="p-6 border-b border-slate-200">
                <h2 className="font-heading font-semibold text-xl">Recent Bookings</h2>
              </div>
              <div className="p-6">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{booking.pickup_location} → {booking.dropoff_location}</p>
                      <p className="text-xs text-slate-500">{formatDate(booking.booking_date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      <span className="font-semibold text-primary">{formatCurrency(booking.final_price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className="border-slate-100" data-testid="users-section">
            <div className="p-6 border-b border-slate-200">
              <h2 className="font-heading font-semibold text-xl">All Users</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {users.map((u) => (
                  <Card key={u.id} className="p-4 border-slate-200" data-testid={`user-card-${u.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-slate-600">{u.email}</p>
                      </div>
                      <Badge variant="outline">{u.role}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <Card className="border-slate-100" data-testid="bookings-section">
            <div className="p-6 border-b border-slate-200">
              <h2 className="font-heading font-semibold text-xl">All Bookings</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-4 border-slate-200" data-testid={`booking-card-${booking.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          <Badge variant="outline">{booking.payment_status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          {booking.pickup_location} → {booking.dropoff_location}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDate(booking.booking_date)} • {booking.estimated_km} km • {booking.total_days} days
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-primary">{formatCurrency(booking.final_price)}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <Card className="border-slate-100" data-testid="payouts-section">
            <div className="p-6 border-b border-slate-200">
              <h2 className="font-heading font-semibold text-xl">Payouts Management</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <Card key={payout.id} className="p-4 border-slate-200" data-testid={`payout-card-${payout.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(payout.status)}>{payout.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Booking Price</p>
                            <p className="font-medium">{formatCurrency(payout.booking_price)}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Admin Commission</p>
                            <p className="font-medium text-status-success">{formatCurrency(payout.admin_commission)}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Dealer Amount</p>
                            <p className="font-medium">{formatCurrency(payout.dealer_amount)}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Driver Amount</p>
                            <p className="font-medium">{formatCurrency(payout.driver_amount)}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        {payout.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => handleProcessPayout(payout.id)}
                            data-testid={`process-payout-btn-${payout.id}`}
                          >
                            Process
                          </Button>
                        )}
                        {payout.status === 'PROCESSED' && payout.processed_at && (
                          <p className="text-xs text-slate-500">Processed on {formatDate(payout.processed_at)}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;