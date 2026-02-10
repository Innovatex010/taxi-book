import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, LogOut, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { getBookings, acceptBooking, updateBookingStatus, getDriverStats, getDriverProfile } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { toast } from 'sonner';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, statsData, profileData] = await Promise.all([
        getBookings(),
        getDriverStats(),
        getDriverProfile()
      ]);
      setBookings(bookingsData);
      setStats(statsData);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await acceptBooking(bookingId);
      toast.success('Booking accepted!');
      loadData();
    } catch (error) {
      toast.error('Failed to accept booking');
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      toast.success('Status updated!');
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
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
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="driver-dashboard">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-xl text-[#0F172A]">UrbanCab</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium text-sm">{user?.name}</div>
              <div className="text-xs text-slate-600">Driver</div>
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
            <Card className="p-6 border-slate-100" data-testid="stat-card-pending">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Payouts</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{formatCurrency(stats.pending_payouts)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-status-info/20" />
              </div>
            </Card>
          </div>
        )}

        {profile && (
          <Card className="mb-8 border-slate-100" data-testid="driver-profile">
            <div className="p-6 border-b border-slate-200">
              <h2 className="font-heading font-semibold text-xl">Driver Profile</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600">License Number</p>
                <p className="font-medium">{profile.license_number}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Vehicle Number</p>
                <p className="font-medium">{profile.vehicle_number}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Vehicle Type</p>
                <p className="font-medium">{profile.vehicle_type}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="border-slate-100" data-testid="bookings-section">
          <div className="p-6 border-b border-slate-200">
            <h2 className="font-heading font-semibold text-xl">Bookings</h2>
          </div>
          <div className="p-6">
            {bookings.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No bookings available.</p>
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
                        {booking.status === 'PENDING' && !booking.driver_id && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptBooking(booking.id)}
                            data-testid={`accept-booking-btn-${booking.id}`}
                          >
                            Accept
                          </Button>
                        )}
                        {booking.status === 'ACCEPTED' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(booking.id, 'IN_PROGRESS')}
                            data-testid={`start-trip-btn-${booking.id}`}
                          >
                            Start Trip
                          </Button>
                        )}
                        {booking.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                            data-testid={`complete-trip-btn-${booking.id}`}
                          >
                            Complete
                          </Button>
                        )}
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

export default DriverDashboard;