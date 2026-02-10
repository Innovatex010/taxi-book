import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Car, Plus, MapPin, Calendar, TrendingUp, Clock, LogOut } from 'lucide-react';
import { getTrips, createTrip, getBookings, createBooking, getCustomerStats, getAvailableDrivers } from '../lib/api';
import { formatCurrency, formatDate, calculateDays } from '../lib/utils';
import { toast } from 'sonner';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [showTripDialog, setShowTripDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tripForm, setTripForm] = useState({
    city: '',
    base_location: '',
    start_date: '',
    end_date: '',
    purpose: '',
    notes: ''
  });

  const [bookingForm, setBookingForm] = useState({
    estimated_km: 10,
    pickup_location: '',
    dropoff_location: '',
    booking_date: '',
    total_days: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tripsData, bookingsData, statsData, driversData] = await Promise.all([
        getTrips(),
        getBookings(),
        getCustomerStats(),
        getAvailableDrivers()
      ]);
      setTrips(tripsData);
      setBookings(bookingsData);
      setStats(statsData);
      setDrivers(driversData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      await createTrip(tripForm);
      toast.success('Trip created successfully!');
      setShowTripDialog(false);
      setTripForm({ city: '', base_location: '', start_date: '', end_date: '', purpose: '', notes: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to create trip');
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;

    const days = calculateDays(bookingForm.booking_date, selectedTrip.end_date);
    const bookingData = {
      trip_id: selectedTrip.id,
      ...bookingForm,
      total_days: days
    };

    try {
      await createBooking(bookingData);
      toast.success('Booking created successfully!');
      setShowBookingDialog(false);
      setBookingForm({ estimated_km: 10, pickup_location: '', dropoff_location: '', booking_date: '', total_days: 1 });
      loadData();
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  const calculatePrice = () => {
    const baseFare = 50;
    const perKm = 5;
    const perDay = 200;
    const days = selectedTrip ? calculateDays(bookingForm.booking_date, selectedTrip.end_date) : bookingForm.total_days;
    return baseFare + (bookingForm.estimated_km * perKm) + (days * perDay);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      ACTIVE: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="customer-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-xl text-[#0F172A]">UrbanCab</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium text-sm">{user?.name}</div>
              <div className="text-xs text-slate-600">Customer</div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 border-slate-100" data-testid="stat-card-trips">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Trips</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{stats.active_trips}</p>
                </div>
                <MapPin className="h-8 w-8 text-primary/20" />
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
            <Card className="p-6 border-slate-100" data-testid="stat-card-spent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Spent</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{formatCurrency(stats.pending_payouts)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-status-success/20" />
              </div>
            </Card>
            <Card className="p-6 border-slate-100" data-testid="stat-card-drivers">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Available Drivers</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{drivers.length}</p>
                </div>
                <Clock className="h-8 w-8 text-status-info/20" />
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Dialog open={showTripDialog} onOpenChange={setShowTripDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-primary/90" data-testid="create-trip-btn">
                <Plus className="h-4 w-4 mr-2" />
                Create Trip
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Trip</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTrip} className="space-y-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={tripForm.city}
                    onChange={(e) => setTripForm({ ...tripForm, city: e.target.value })}
                    required
                    data-testid="trip-city-input"
                  />
                </div>
                <div>
                  <Label htmlFor="base_location">Base Location</Label>
                  <Input
                    id="base_location"
                    value={tripForm.base_location}
                    onChange={(e) => setTripForm({ ...tripForm, base_location: e.target.value })}
                    required
                    data-testid="trip-location-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={tripForm.start_date}
                      onChange={(e) => setTripForm({ ...tripForm, start_date: e.target.value })}
                      required
                      data-testid="trip-start-date-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={tripForm.end_date}
                      onChange={(e) => setTripForm({ ...tripForm, end_date: e.target.value })}
                      required
                      data-testid="trip-end-date-input"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose (Optional)</Label>
                  <Input
                    id="purpose"
                    value={tripForm.purpose}
                    onChange={(e) => setTripForm({ ...tripForm, purpose: e.target.value })}
                    data-testid="trip-purpose-input"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={tripForm.notes}
                    onChange={(e) => setTripForm({ ...tripForm, notes: e.target.value })}
                    data-testid="trip-notes-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="trip-submit-btn">Create Trip</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Trips */}
        <Card className="mb-8 border-slate-100" data-testid="trips-section">
          <div className="p-6 border-b border-slate-200">
            <h2 className="font-heading font-semibold text-xl">My Trips</h2>
          </div>
          <div className="p-6">
            {trips.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No trips yet. Create your first trip to get started!</p>
            ) : (
              <div className="grid gap-4">
                {trips.map((trip) => (
                  <Card key={trip.id} className="p-4 border-slate-200" data-testid={`trip-card-${trip.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{trip.city}</h3>
                          <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{trip.base_location}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                          <span>•</span>
                          <span>{calculateDays(trip.start_date, trip.end_date)} days</span>
                        </div>
                      </div>
                      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedTrip(trip)}
                            data-testid={`book-taxi-btn-${trip.id}`}
                          >
                            Book Taxi
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Book a Taxi</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateBooking} className="space-y-4">
                            <div>
                              <Label htmlFor="pickup">Pickup Location</Label>
                              <Input
                                id="pickup"
                                value={bookingForm.pickup_location}
                                onChange={(e) => setBookingForm({ ...bookingForm, pickup_location: e.target.value })}
                                required
                                data-testid="booking-pickup-input"
                              />
                            </div>
                            <div>
                              <Label htmlFor="dropoff">Dropoff Location</Label>
                              <Input
                                id="dropoff"
                                value={bookingForm.dropoff_location}
                                onChange={(e) => setBookingForm({ ...bookingForm, dropoff_location: e.target.value })}
                                required
                                data-testid="booking-dropoff-input"
                              />
                            </div>
                            <div>
                              <Label htmlFor="booking_date">Booking Date</Label>
                              <Input
                                id="booking_date"
                                type="date"
                                value={bookingForm.booking_date}
                                onChange={(e) => setBookingForm({ ...bookingForm, booking_date: e.target.value })}
                                required
                                data-testid="booking-date-input"
                              />
                            </div>
                            <div>
                              <Label htmlFor="estimated_km">Estimated Distance (km)</Label>
                              <Input
                                id="estimated_km"
                                type="number"
                                value={bookingForm.estimated_km}
                                onChange={(e) => setBookingForm({ ...bookingForm, estimated_km: parseFloat(e.target.value) })}
                                required
                                data-testid="booking-distance-input"
                              />
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                              <div className="text-sm text-slate-600 mb-2">Price Breakdown</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Base Fare:</span>
                                  <span>$50</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Distance ({bookingForm.estimated_km} km):</span>
                                  <span>${(bookingForm.estimated_km * 5).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Duration ({selectedTrip ? calculateDays(bookingForm.booking_date || selectedTrip.start_date, selectedTrip.end_date) : bookingForm.total_days} days):</span>
                                  <span>${((selectedTrip ? calculateDays(bookingForm.booking_date || selectedTrip.start_date, selectedTrip.end_date) : bookingForm.total_days) * 200).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-primary pt-2 border-t">
                                  <span>Total:</span>
                                  <span>{formatCurrency(calculatePrice())}</span>
                                </div>
                              </div>
                            </div>
                            <Button type="submit" className="w-full" data-testid="booking-submit-btn">Create Booking</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Bookings */}
        <Card className="border-slate-100" data-testid="bookings-section">
          <div className="p-6 border-b border-slate-200">
            <h2 className="font-heading font-semibold text-xl">My Bookings</h2>
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
                        {booking.driver_id && <p className="text-xs text-slate-500 mt-1">Driver Assigned</p>}
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

export default CustomerDashboard;