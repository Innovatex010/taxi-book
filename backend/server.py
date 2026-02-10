from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from models import (
    User, UserCreate, UserLogin, UserResponse, UserRole,
    Dealer, DealerCreate, Driver, DriverCreate, VehicleType,
    Trip, TripCreate, TripStatus,
    Booking, BookingCreate, BookingStatus, PaymentStatus,
    Payment, PaymentCreate, PaymentMethod,
    Payout, PayoutStatus, DashboardStats
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_role, security
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pricing constants
BASE_FARE = 50.0
PER_KM_RATE = 5.0
PER_DAY_RATE = 200.0
ADMIN_COMMISSION_PERCENT = 10.0
DEALER_COMMISSION_PERCENT = 15.0

def calculate_booking_price(estimated_km: float, total_days: int) -> float:
    return BASE_FARE + (estimated_km * PER_KM_RATE) + (total_days * PER_DAY_RATE)

def generate_payout(booking_price: float, dealer_id: Optional[str] = None) -> dict:
    admin_commission = booking_price * (ADMIN_COMMISSION_PERCENT / 100)
    remaining = booking_price - admin_commission
    
    if dealer_id:
        dealer_total = remaining * 0.22  # Dealer gets 22% of remaining
        dealer_commission = dealer_total * (DEALER_COMMISSION_PERCENT / 100)
        driver_amount = remaining - dealer_total
        dealer_amount = dealer_total
    else:
        dealer_amount = 0.0
        dealer_commission = 0.0
        driver_amount = remaining
    
    return {
        "booking_price": booking_price,
        "admin_commission": admin_commission,
        "dealer_amount": dealer_amount,
        "dealer_commission": dealer_commission,
        "driver_amount": driver_amount
    }

# ============= AUTH ROUTES =============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = user_data.model_dump()
    password = user_dict.pop("password")
    user_dict["password_hash"] = hash_password(password)
    
    user = User(**user_dict)
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['updated_at'] = user_doc['updated_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    # Create role-specific profile
    if user.role == UserRole.DEALER:
        dealer = Dealer(
            user_id=user.id,
            company_name=f"{user.name}'s Fleet"
        )
        dealer_doc = dealer.model_dump()
        dealer_doc['created_at'] = dealer_doc['created_at'].isoformat()
        await db.dealers.insert_one(dealer_doc)
    elif user.role == UserRole.DRIVER:
        # Driver profile will be created separately with vehicle info
        pass
    
    token = create_access_token(user.id, user.email, user.role.value)
    
    return {
        "token": token,
        "user": UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            role=user.role,
            email_verified=user.email_verified
        )
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(user["id"], user["email"], user["role"])
    
    return {
        "token": token,
        "user": UserResponse(**user)
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

# ============= TRIP ROUTES =============

@api_router.post("/trips", response_model=Trip)
async def create_trip(trip_data: TripCreate, current_user: dict = Depends(get_current_user)):
    trip = Trip(user_id=current_user["user_id"], **trip_data.model_dump())
    trip_doc = trip.model_dump()
    trip_doc['created_at'] = trip_doc['created_at'].isoformat()
    
    await db.trips.insert_one(trip_doc)
    return trip

@api_router.get("/trips", response_model=List[Trip])
async def get_trips(current_user: dict = Depends(get_current_user)):
    trips = await db.trips.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    for trip in trips:
        if isinstance(trip['created_at'], str):
            trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    return trips

@api_router.get("/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str, current_user: dict = Depends(get_current_user)):
    trip = await db.trips.find_one({"id": trip_id, "user_id": current_user["user_id"]}, {"_id": 0})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if isinstance(trip['created_at'], str):
        trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    return Trip(**trip)

@api_router.patch("/trips/{trip_id}", response_model=Trip)
async def update_trip(trip_id: str, status: TripStatus, current_user: dict = Depends(get_current_user)):
    result = await db.trips.update_one(
        {"id": trip_id, "user_id": current_user["user_id"]},
        {"$set": {"status": status.value}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if isinstance(trip['created_at'], str):
        trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    return Trip(**trip)

# ============= DRIVER ROUTES =============

@api_router.post("/drivers", response_model=Driver)
async def create_driver_profile(driver_data: DriverCreate, current_user: dict = Depends(get_current_user)):
    driver = Driver(**driver_data.model_dump())
    driver_doc = driver.model_dump()
    driver_doc['created_at'] = driver_doc['created_at'].isoformat()
    
    await db.drivers.insert_one(driver_doc)
    return driver

@api_router.get("/drivers/available", response_model=List[Driver])
async def get_available_drivers(vehicle_type: Optional[VehicleType] = None):
    query = {"is_active": True}
    if vehicle_type:
        query["vehicle_type"] = vehicle_type.value
    
    drivers = await db.drivers.find(query, {"_id": 0}).to_list(100)
    for driver in drivers:
        if isinstance(driver['created_at'], str):
            driver['created_at'] = datetime.fromisoformat(driver['created_at'])
    return drivers

@api_router.get("/drivers/profile")
async def get_driver_profile(current_user: dict = Depends(get_current_user)):
    driver = await db.drivers.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    if isinstance(driver['created_at'], str):
        driver['created_at'] = datetime.fromisoformat(driver['created_at'])
    return driver

@api_router.get("/drivers/stats")
async def get_driver_stats(current_user: dict = Depends(get_current_user)):
    driver = await db.drivers.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    bookings = await db.bookings.find({"driver_id": driver["id"]}, {"_id": 0}).to_list(1000)
    
    total_bookings = len(bookings)
    completed = len([b for b in bookings if b["status"] == BookingStatus.COMPLETED.value])
    active = len([b for b in bookings if b["status"] in [BookingStatus.ACCEPTED.value, BookingStatus.IN_PROGRESS.value]])
    
    return DashboardStats(
        total_bookings=total_bookings,
        active_trips=active,
        total_earnings=driver["total_earnings"],
        pending_payouts=driver["total_earnings"] - driver["total_payouts"]
    )

# ============= BOOKING ROUTES =============

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    # Calculate price
    final_price = calculate_booking_price(booking_data.estimated_km, booking_data.total_days)
    
    booking = Booking(
        user_id=current_user["user_id"],
        final_price=final_price,
        **booking_data.model_dump()
    )
    booking_doc = booking.model_dump()
    booking_doc['created_at'] = booking_doc['created_at'].isoformat()
    
    await db.bookings.insert_one(booking_doc)
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["user_id"]}
    
    if current_user["role"] == UserRole.DRIVER.value:
        driver = await db.drivers.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
        if driver:
            query = {"driver_id": driver["id"]}
    elif current_user["role"] == UserRole.DEALER.value:
        dealer = await db.dealers.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
        if dealer:
            query = {"dealer_id": dealer["id"]}
    elif current_user["role"] == UserRole.ADMIN.value:
        query = {}
    
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for booking in bookings:
        if isinstance(booking['created_at'], str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if isinstance(booking['created_at'], str):
        booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return Booking(**booking)

@api_router.patch("/bookings/{booking_id}/assign")
async def assign_driver(
    booking_id: str,
    driver_id: str,
    current_user: dict = Depends(require_role([UserRole.DEALER, UserRole.ADMIN]))
):
    # Get driver info
    driver = await db.drivers.find_one({"id": driver_id}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Update booking
    result = await db.bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "driver_id": driver_id,
                "dealer_id": driver.get("dealer_id"),
                "status": BookingStatus.ACCEPTED.value
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if isinstance(booking['created_at'], str):
        booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return Booking(**booking)

@api_router.patch("/bookings/{booking_id}/accept")
async def accept_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    driver = await db.drivers.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    result = await db.bookings.update_one(
        {"id": booking_id, "status": BookingStatus.PENDING.value},
        {
            "$set": {
                "driver_id": driver["id"],
                "dealer_id": driver.get("dealer_id"),
                "status": BookingStatus.ACCEPTED.value
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found or already assigned")
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if isinstance(booking['created_at'], str):
        booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return Booking(**booking)

@api_router.patch("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    status: BookingStatus,
    current_user: dict = Depends(get_current_user)
):
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": status.value}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    
    # If completed, generate payout
    if status == BookingStatus.COMPLETED and booking["payment_status"] == PaymentStatus.COMPLETED.value:
        existing_payout = await db.payouts.find_one({"booking_id": booking_id}, {"_id": 0})
        if not existing_payout:
            payout_data = generate_payout(booking["final_price"], booking.get("dealer_id"))
            payout = Payout(
                booking_id=booking_id,
                driver_id=booking.get("driver_id"),
                dealer_id=booking.get("dealer_id"),
                **payout_data
            )
            payout_doc = payout.model_dump()
            payout_doc['created_at'] = payout_doc['created_at'].isoformat()
            await db.payouts.insert_one(payout_doc)
    
    if isinstance(booking['created_at'], str):
        booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return Booking(**booking)

# ============= PAYMENT ROUTES =============

@api_router.post("/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate, current_user: dict = Depends(get_current_user)):
    payment = Payment(user_id=current_user["user_id"], **payment_data.model_dump())
    payment_doc = payment.model_dump()
    payment_doc['created_at'] = payment_doc['created_at'].isoformat()
    
    await db.payments.insert_one(payment_doc)
    
    # Update booking payment status
    await db.bookings.update_one(
        {"id": payment.booking_id},
        {"$set": {"payment_status": PaymentStatus.COMPLETED.value}}
    )
    
    return payment

@api_router.get("/payments", response_model=List[Payment])
async def get_payments(current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["user_id"]}
    
    if current_user["role"] == UserRole.ADMIN.value:
        query = {}
    
    payments = await db.payments.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for payment in payments:
        if isinstance(payment['created_at'], str):
            payment['created_at'] = datetime.fromisoformat(payment['created_at'])
    return payments

# ============= PAYOUT ROUTES (ADMIN) =============

@api_router.get("/payouts", response_model=List[Payout])
async def get_payouts(current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.DEALER, UserRole.DRIVER]))):
    query = {}
    
    if current_user["role"] == UserRole.DEALER.value:
        dealer = await db.dealers.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
        if dealer:
            query = {"dealer_id": dealer["id"]}
    elif current_user["role"] == UserRole.DRIVER.value:
        driver = await db.drivers.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
        if driver:
            query = {"driver_id": driver["id"]}
    
    payouts = await db.payouts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for payout in payouts:
        if isinstance(payout['created_at'], str):
            payout['created_at'] = datetime.fromisoformat(payout['created_at'])
    return payouts

@api_router.patch("/payouts/{payout_id}/process")
async def process_payout(
    payout_id: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    result = await db.payouts.update_one(
        {"id": payout_id},
        {
            "$set": {
                "status": PayoutStatus.PROCESSED.value,
                "processed_at": datetime.now(timezone.utc).isoformat(),
                "admin_id": current_user["user_id"]
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payout not found")
    
    # Update driver/dealer payout totals
    payout = await db.payouts.find_one({"id": payout_id}, {"_id": 0})
    
    if payout.get("driver_id"):
        await db.drivers.update_one(
            {"id": payout["driver_id"]},
            {"$inc": {"total_payouts": payout["driver_amount"]}}
        )
    
    if payout.get("dealer_id"):
        await db.dealers.update_one(
            {"id": payout["dealer_id"]},
            {"$inc": {"total_payouts": payout["dealer_amount"]}}
        )
    
    return {"message": "Payout processed successfully"}

# ============= DEALER ROUTES =============

@api_router.get("/dealers/drivers", response_model=List[Driver])
async def get_dealer_drivers(current_user: dict = Depends(require_role([UserRole.DEALER]))):
    dealer = await db.dealers.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not dealer:
        raise HTTPException(status_code=404, detail="Dealer profile not found")
    
    drivers = await db.drivers.find({"dealer_id": dealer["id"]}, {"_id": 0}).to_list(100)
    for driver in drivers:
        if isinstance(driver['created_at'], str):
            driver['created_at'] = datetime.fromisoformat(driver['created_at'])
    return drivers

@api_router.get("/dealers/stats")
async def get_dealer_stats(current_user: dict = Depends(require_role([UserRole.DEALER]))):
    dealer = await db.dealers.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not dealer:
        raise HTTPException(status_code=404, detail="Dealer profile not found")
    
    drivers = await db.drivers.find({"dealer_id": dealer["id"]}, {"_id": 0}).to_list(1000)
    bookings = await db.bookings.find({"dealer_id": dealer["id"]}, {"_id": 0}).to_list(1000)
    
    active_bookings = len([b for b in bookings if b["status"] in [BookingStatus.ACCEPTED.value, BookingStatus.IN_PROGRESS.value]])
    
    return DashboardStats(
        total_bookings=len(bookings),
        active_trips=active_bookings,
        total_earnings=dealer["total_earnings"],
        pending_payouts=dealer["total_earnings"] - dealer["total_payouts"]
    )

# ============= ADMIN ROUTES =============

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    bookings = await db.bookings.find({}, {"_id": 0}).to_list(10000)
    users = await db.users.find({}, {"_id": 0}).to_list(10000)
    payouts = await db.payouts.find({}, {"_id": 0}).to_list(10000)
    
    total_revenue = sum(b["final_price"] for b in bookings if b["payment_status"] == PaymentStatus.COMPLETED.value)
    admin_earnings = sum(p["admin_commission"] for p in payouts)
    pending_payouts = len([p for p in payouts if p["status"] == PayoutStatus.PENDING.value])
    
    return {
        "total_users": len(users),
        "total_bookings": len(bookings),
        "total_revenue": total_revenue,
        "admin_earnings": admin_earnings,
        "pending_payouts": pending_payouts,
        "active_bookings": len([b for b in bookings if b["status"] in [BookingStatus.ACCEPTED.value, BookingStatus.IN_PROGRESS.value]])
    }

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

# ============= CUSTOMER DASHBOARD =============

@api_router.get("/customer/stats")
async def get_customer_stats(current_user: dict = Depends(get_current_user)):
    trips = await db.trips.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(1000)
    bookings = await db.bookings.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(1000)
    payments = await db.payments.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(1000)
    
    active_trips = len([t for t in trips if t["status"] == TripStatus.ACTIVE.value])
    total_spent = sum(p["amount"] for p in payments if p["status"] == PaymentStatus.COMPLETED.value)
    
    return DashboardStats(
        total_bookings=len(bookings),
        active_trips=active_trips,
        total_earnings=0.0,
        pending_payouts=total_spent
    )

# Health check
@api_router.get("/")
async def root():
    return {"message": "UrbanCab API is running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    # allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
