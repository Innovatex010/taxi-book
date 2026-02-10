import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Trips
export const createTrip = async (tripData) => {
  const response = await axios.post(`${API}/trips`, tripData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getTrips = async () => {
  const response = await axios.get(`${API}/trips`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getTrip = async (tripId) => {
  const response = await axios.get(`${API}/trips/${tripId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateTrip = async (tripId, status) => {
  const response = await axios.patch(
    `${API}/trips/${tripId}?status=${status}`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Bookings
export const createBooking = async (bookingData) => {
  const response = await axios.post(`${API}/bookings`, bookingData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getBookings = async () => {
  const response = await axios.get(`${API}/bookings`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const acceptBooking = async (bookingId) => {
  const response = await axios.patch(
    `${API}/bookings/${bookingId}/accept`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateBookingStatus = async (bookingId, status) => {
  const response = await axios.patch(
    `${API}/bookings/${bookingId}/status?status=${status}`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const assignDriver = async (bookingId, driverId) => {
  const response = await axios.patch(
    `${API}/bookings/${bookingId}/assign?driver_id=${driverId}`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Drivers
export const getAvailableDrivers = async (vehicleType) => {
  const url = vehicleType
    ? `${API}/drivers/available?vehicle_type=${vehicleType}`
    : `${API}/drivers/available`;
  const response = await axios.get(url);
  return response.data;
};

export const createDriverProfile = async (driverData) => {
  const response = await axios.post(`${API}/drivers`, driverData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getDriverProfile = async () => {
  const response = await axios.get(`${API}/drivers/profile`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getDriverStats = async () => {
  const response = await axios.get(`${API}/drivers/stats`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Payments
export const createPayment = async (paymentData) => {
  const response = await axios.post(`${API}/payments`, paymentData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getPayments = async () => {
  const response = await axios.get(`${API}/payments`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Payouts
export const getPayouts = async () => {
  const response = await axios.get(`${API}/payouts`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const processPayout = async (payoutId) => {
  const response = await axios.patch(
    `${API}/payouts/${payoutId}/process`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Dashboard Stats
export const getCustomerStats = async () => {
  const response = await axios.get(`${API}/customer/stats`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getDealerStats = async () => {
  const response = await axios.get(`${API}/dealers/stats`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getDealerDrivers = async () => {
  const response = await axios.get(`${API}/dealers/drivers`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getAdminStats = async () => {
  const response = await axios.get(`${API}/admin/stats`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axios.get(`${API}/admin/users`, {
    headers: getAuthHeader()
  });
  return response.data;
};