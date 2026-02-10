from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    DEALER = "DEALER"
    DRIVER = "DRIVER"
    CUSTOMER = "CUSTOMER"

class VehicleType(str, Enum):
    SEDAN = "SEDAN"
    SUV = "SUV"
    HATCHBACK = "HATCHBACK"
    LUXURY = "LUXURY"

class TripStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class BookingStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class PaymentMethod(str, Enum):
    CARD = "CARD"
    UPI = "UPI"
    WALLET = "WALLET"
    BANK_TRANSFER = "BANK_TRANSFER"

class PayoutStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSED = "PROCESSED"
    FAILED = "FAILED"

class BaseDBModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

class User(BaseDBModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    password_hash: str
    role: UserRole
    email_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseDBModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    role: UserRole
    email_verified: bool

class Dealer(BaseDBModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    company_registration: Optional[str] = None
    tax_id: Optional[str] = None
    bank_account: Optional[str] = None
    bank_ifsc: Optional[str] = None
    commission_percent: float = 15.0
    total_earnings: float = 0.0
    total_payouts: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DealerCreate(BaseModel):
    user_id: str
    company_name: str
    company_registration: Optional[str] = None
    tax_id: Optional[str] = None
    bank_account: Optional[str] = None
    bank_ifsc: Optional[str] = None

class Driver(BaseDBModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    dealer_id: Optional[str] = None
    license_number: str
    license_expiry: str
    vehicle_number: str
    vehicle_type: VehicleType
    total_earnings: float = 0.0
    total_payouts: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DriverCreate(BaseModel):
    user_id: str
    dealer_id: Optional[str] = None
    license_number: str
    license_expiry: str
    vehicle_number: str
    vehicle_type: VehicleType

class Trip(BaseDBModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    city: str
    base_location: str
    start_date: str
    end_date: str
    purpose: Optional[str] = None
    notes: Optional[str] = None
    status: TripStatus = TripStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TripCreate(BaseModel):
    city: str
    base_location: str
    start_date: str
    end_date: str
    purpose: Optional[str] = None
    notes: Optional[str] = None

class Booking(BaseDBModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    trip_id: str
    user_id: str
    driver_id: Optional[str] = None
    dealer_id: Optional[str] = None
    base_fare: float = 50.0
    estimated_km: float = 10.0
    per_km_rate: float = 5.0
    per_day_rate: float = 200.0
    total_days: int = 1
    final_price: float = 0.0
    pickup_location: str
    dropoff_location: str
    booking_date: str
    status: BookingStatus = BookingStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BookingCreate(BaseModel):
    trip_id: str
    estimated_km: float
    pickup_location: str
    dropoff_location: str
    booking_date: str
    total_days: int = 1

class Payment(BaseDBModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    booking_id: str
    user_id: str
    amount: float
    method: PaymentMethod
    transaction_id: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentCreate(BaseModel):
    booking_id: str
    amount: float
    method: PaymentMethod
    transaction_id: Optional[str] = None

class Payout(BaseDBModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    booking_id: str
    booking_price: float
    admin_commission: float
    dealer_amount: float = 0.0
    dealer_commission: float = 0.0
    driver_amount: float = 0.0
    dealer_id: Optional[str] = None
    driver_id: Optional[str] = None
    admin_id: Optional[str] = None
    status: PayoutStatus = PayoutStatus.PENDING
    processed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DashboardStats(BaseModel):
    total_bookings: int = 0
    active_trips: int = 0
    total_earnings: float = 0.0
    pending_payouts: float = 0.0