import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, LogOut, Users, TrendingUp, Clock } from 'lucide-react';
import { getDealerDrivers, getBookings, assignDriver, getDealerStats } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { toast } from 'sonner';

const DealerDashboard = () => {
  const { user, logout } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [driversData, bookingsData, statsData] = await Promise.all([
        getDealerDrivers(),
        getBookings(),
        getDealerStats()
      ]);
      setDrivers(driversData);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (bookingId, driverId) => {
    try {
      await assignDriver(bookingId, driverId);
      toast.success('Driver assigned successfully!');
      loadData();
    } catch (error) {
      toast.error('Failed to assign driver');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="dealer-dashboard">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-xl text-[#0F172A]">UrbanCab</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium text-sm">{user?.name}</div>
              <div className="text-xs text-slate-600">Fleet Owner</div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} data-testid="logout-btn">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 border-slate-100" data-testid="stat-card-bookings">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{stats.total_bookings}</p>
                </div>
                <Car className="h-8 w-8 text-primary/20" />
              </div>
            </Card>
            <Card className="p-6 border-slate-100" data-testid="stat-card-active">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Trips</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{stats.active_trips}</p>
                </div>
                <Clock className="h-8 w-8 text-secondary/20" />
              </div>
            </Card>
            <Card className="p-6 border-slate-100" data-testid="stat-card-earnings">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{formatCurrency(stats.total_earnings)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-status-success/20" />
              </div>
            </Card>
            <Card className="p-6 border-slate-100" data-testid="stat-card-drivers">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Drivers</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{drivers.filter(d => d.is_active).length}</p>
                </div>
                <Users className="h-8 w-8 text-status-info/20" />
              </div>
            </Card>
          </div>
        )}

        <Card className="mb-8 border-slate-100" data-testid="drivers-section">
          <div className="p-6 border-b border-slate-200">
            <h2 className="font-heading font-semibold text-xl">My Drivers</h2>
          </div>
          <div className="p-6">
            {drivers.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No drivers registered yet.</p>
            ) : (
              <div className="grid gap-4">
                {drivers.map((driver) => (
                  <Card key={driver.id} className="p-4 border-slate-200" data-testid={`driver-card-${driver.id}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{driver.vehicle_number}</h3>
                          <Badge variant="outline">{driver.vehicle_type}</Badge>
                          {driver.is_active && <Badge className="bg-green-100 text-green-800">Active</Badge>}
                        </div>
                        <p className="text-sm text-slate-600">License: {driver.license_number}</p>
                        <p className="text-sm text-slate-500">Earnings: {formatCurrency(driver.total_earnings)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="border-slate-100" data-testid="bookings-section">
          <div className="p-6 border-b border-slate-200">
            <h2 className="font-heading font-semibold text-xl">Fleet Bookings</h2>
          </div>
          <div className="p-6">
            {bookings.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No bookings yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-4 border-slate-200" data-testid={`booking-card-${booking.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          {booking.pickup_location} → {booking.dropoff_location}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDate(booking.booking_date)} • {booking.estimated_km} km • {booking.total_days} days
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="font-bold text-lg text-primary">{formatCurrency(booking.final_price)}</div>
                        {booking.status === 'PENDING' && !booking.driver_id && drivers.length > 0 && (
                          <Select onValueChange={(driverId) => handleAssignDriver(booking.id, driverId)}>
                            <SelectTrigger className="w-40" data-testid={`assign-driver-select-${booking.id}`}>
                              <SelectValue placeholder="Assign Driver" />
                            </SelectTrigger>
                            <SelectContent>
                              {drivers.filter(d => d.is_active).map((driver) => (
                                <SelectItem key={driver.id} value={driver.id}>
                                  {driver.vehicle_number}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {booking.driver_id && <p className="text-xs text-slate-500">Driver Assigned</p>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DealerDashboard;