from fastapi import FastAPI, APIRouter, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
wallets_collection = db.wallets
orders_collection = db.orders

# Create the main app
app = FastAPI(title="Auralis Token Sale API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class BlockchainType(str, Enum):
    ETHEREUM = "ethereum"
    APTOS = "aptos"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FAILED = "failed"

# Models
class WalletConnectionRequest(BaseModel):
    address: str
    blockchain: BlockchainType
    balance: float = Field(ge=0)

class WalletResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    address: str
    blockchain: str
    balance: float
    connected_at: datetime
    last_activity: datetime

class OrderCreationRequest(BaseModel):
    wallet_address: str
    blockchain: BlockchainType
    quantity: float = Field(gt=0)
    price_per_token: float = Field(default=0.01)  # Fixed price 0.01 USD

class OrderResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    wallet_address: str
    blockchain: str
    quantity: float
    price_per_token: float
    total_amount: float
    status: OrderStatus
    created_at: datetime
    updated_at: datetime

# Routes
@api_router.get("/")
async def root():
    return {"message": "Auralis Token Sale API", "token": "ARA", "price": 0.01}

@api_router.post("/wallets/connect", response_model=WalletResponse, status_code=status.HTTP_201_CREATED)
async def connect_wallet(request: WalletConnectionRequest):
    """Connect a wallet by storing connection information"""
    try:
        existing = await wallets_collection.find_one({"address": request.address})
        
        now = datetime.now(timezone.utc)
        
        if existing:
            # Update last activity
            await wallets_collection.update_one(
                {"address": request.address},
                {
                    "$set": {
                        "last_activity": now.isoformat(),
                        "balance": request.balance
                    }
                }
            )
            return WalletResponse(
                address=existing["address"],
                blockchain=existing["blockchain"],
                balance=request.balance,
                connected_at=datetime.fromisoformat(existing["connected_at"]),
                last_activity=now
            )
        
        # Create new wallet record
        wallet_data = {
            "address": request.address,
            "blockchain": request.blockchain.value,
            "balance": request.balance,
            "connected_at": now.isoformat(),
            "last_activity": now.isoformat()
        }
        
        await wallets_collection.insert_one(wallet_data)
        
        return WalletResponse(
            address=request.address,
            blockchain=request.blockchain.value,
            balance=request.balance,
            connected_at=now,
            last_activity=now
        )
    
    except Exception as e:
        logging.error(f"Failed to connect wallet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to connect wallet: {str(e)}"
        )

@api_router.get("/wallets/{address}", response_model=WalletResponse)
async def get_wallet(address: str):
    """Retrieve wallet information by address"""
    try:
        wallet = await wallets_collection.find_one({"address": address})
        
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wallet not found"
            )
        
        return WalletResponse(
            address=wallet["address"],
            blockchain=wallet["blockchain"],
            balance=wallet["balance"],
            connected_at=datetime.fromisoformat(wallet["connected_at"]),
            last_activity=datetime.fromisoformat(wallet["last_activity"])
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to retrieve wallet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve wallet: {str(e)}"
        )

@api_router.post("/orders/create", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(request: OrderCreationRequest):
    """Create a new ARA token purchase order"""
    try:
        # Verify wallet exists
        wallet = await wallets_collection.find_one({"address": request.wallet_address})
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wallet not found. Please connect wallet first."
            )
        
        # Calculate total amount
        total_amount = request.quantity * request.price_per_token
        
        now = datetime.now(timezone.utc)
        
        # Create order
        order_data = {
            "wallet_address": request.wallet_address,
            "blockchain": request.blockchain.value,
            "quantity": request.quantity,
            "price_per_token": request.price_per_token,
            "total_amount": total_amount,
            "status": OrderStatus.PENDING.value,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        
        result = await orders_collection.insert_one(order_data)
        
        return OrderResponse(
            id=str(result.inserted_id),
            wallet_address=request.wallet_address,
            blockchain=request.blockchain.value,
            quantity=request.quantity,
            price_per_token=request.price_per_token,
            total_amount=total_amount,
            status=OrderStatus.PENDING,
            created_at=now,
            updated_at=now
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to create order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )

@api_router.get("/orders/wallet/{wallet_address}", response_model=List[OrderResponse])
async def get_wallet_orders(wallet_address: str):
    """Retrieve all orders for a specific wallet"""
    try:
        orders = await orders_collection.find(
            {"wallet_address": wallet_address}
        ).sort("created_at", -1).to_list(length=100)
        
        return [
            OrderResponse(
                id=str(order["_id"]),
                wallet_address=order["wallet_address"],
                blockchain=order["blockchain"],
                quantity=order["quantity"],
                price_per_token=order["price_per_token"],
                total_amount=order["total_amount"],
                status=OrderStatus(order["status"]),
                created_at=datetime.fromisoformat(order["created_at"]),
                updated_at=datetime.fromisoformat(order["updated_at"])
            )
            for order in orders
        ]
    
    except Exception as e:
        logging.error(f"Failed to retrieve orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve orders: {str(e)}"
        )

@api_router.get("/stats")
async def get_stats():
    """Get platform statistics"""
    try:
        total_orders = await orders_collection.count_documents({})
        total_wallets = await wallets_collection.count_documents({})
        
        # Calculate total ARA sold
        pipeline = [
            {"$group": {"_id": None, "total_ara": {"$sum": "$quantity"}}}
        ]
        result = await orders_collection.aggregate(pipeline).to_list(length=1)
        total_ara_sold = result[0]["total_ara"] if result else 0
        
        return {
            "total_orders": total_orders,
            "total_wallets": total_wallets,
            "total_ara_sold": total_ara_sold,
            "ara_price": 0.01
        }
    except Exception as e:
        logging.error(f"Failed to get stats: {str(e)}")
        return {
            "total_orders": 0,
            "total_wallets": 0,
            "total_ara_sold": 0,
            "ara_price": 0.01
        }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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
