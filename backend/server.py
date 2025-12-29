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
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
wallets_collection = db.wallets
orders_collection = db.orders
settings_collection = db.settings

# Ethereum config
ETH_PAYMENT_ADDRESS = '0x0825d5461abffd07860f28b1b78448cc7ac00239'.lower()
ETH_USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'.lower()

# Create the main app
app = FastAPI(title="Auralis Token Sale API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class BlockchainType(str, Enum):
    ETHEREUM = "ethereum"
    SOLANA = "solana"

class OrderStatus(str, Enum):
    PENDING = "pending"
    AWAITING_PAYMENT = "awaiting_payment"
    PAYMENT_SENT = "payment_sent"
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
    tx_hash: Optional[str] = None
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
        # Auto-create wallet if not exists
        wallet = await wallets_collection.find_one({"address": request.wallet_address})
        if not wallet:
            now = datetime.now(timezone.utc)
            wallet_data = {
                "address": request.wallet_address,
                "blockchain": request.blockchain.value,
                "balance": 0,
                "connected_at": now.isoformat(),
                "last_activity": now.isoformat()
            }
            await wallets_collection.insert_one(wallet_data)
        
        # Calculate total amount
        total_amount = request.quantity * request.price_per_token
        
        now = datetime.now(timezone.utc)
        
        # Create order with awaiting_payment status
        order_data = {
            "wallet_address": request.wallet_address,
            "blockchain": request.blockchain.value,
            "quantity": request.quantity,
            "price_per_token": request.price_per_token,
            "total_amount": total_amount,
            "status": OrderStatus.AWAITING_PAYMENT.value,
            "tx_hash": None,
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
            status=OrderStatus.AWAITING_PAYMENT,
            tx_hash=None,
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

@api_router.put("/orders/{order_id}/submit-payment")
async def submit_payment(order_id: str, request: dict):
    """Submit transaction hash for payment verification"""
    try:
        from bson import ObjectId
        
        tx_hash = request.get("tx_hash")
        if not tx_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction hash required"
            )
        
        now = datetime.now(timezone.utc)
        
        result = await orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "tx_hash": tx_hash,
                    "status": OrderStatus.PAYMENT_SENT.value,
                    "updated_at": now.isoformat()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return {"message": "Payment submitted for verification", "tx_hash": tx_hash, "status": "payment_sent"}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to submit payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@api_router.post("/orders/{order_id}/verify-payment")
async def verify_payment(order_id: str):
    """Verify payment transaction on blockchain"""
    try:
        from bson import ObjectId
        
        order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        tx_hash = order.get("tx_hash")
        if not tx_hash:
            return {"verified": False, "error": "No transaction hash", "status": order.get("status")}
        
        # Verify transaction using public Ethereum RPC
        try:
            async with httpx.AsyncClient() as client:
                # Get transaction receipt
                response = await client.post(
                    "https://eth.llamarpc.com",
                    json={
                        "jsonrpc": "2.0",
                        "method": "eth_getTransactionReceipt",
                        "params": [tx_hash],
                        "id": 1
                    },
                    timeout=30.0
                )
                
                data = response.json()
                receipt = data.get("result")
                
                if not receipt:
                    return {"verified": False, "error": "Transaction not found or pending", "status": order.get("status")}
                
                # Check if transaction was successful
                tx_status = int(receipt.get("status", "0x0"), 16)
                if tx_status != 1:
                    # Transaction failed
                    now = datetime.now(timezone.utc)
                    await orders_collection.update_one(
                        {"_id": ObjectId(order_id)},
                        {"$set": {"status": OrderStatus.FAILED.value, "updated_at": now.isoformat()}}
                    )
                    return {"verified": False, "error": "Transaction failed on blockchain", "status": "failed"}
                
                # Check if it's a USDT transfer to our address
                to_address = receipt.get("to", "").lower()
                
                # For USDT transfers, 'to' should be the USDT contract
                if to_address == ETH_USDT_CONTRACT:
                    # Parse logs to verify the transfer
                    logs = receipt.get("logs", [])
                    transfer_verified = False
                    
                    for log in logs:
                        # Transfer event topic
                        if len(log.get("topics", [])) >= 3:
                            # Check if recipient matches our payment address
                            recipient = "0x" + log["topics"][2][-40:].lower()
                            if recipient == ETH_PAYMENT_ADDRESS:
                                transfer_verified = True
                                break
                    
                    if transfer_verified:
                        now = datetime.now(timezone.utc)
                        await orders_collection.update_one(
                            {"_id": ObjectId(order_id)},
                            {"$set": {"status": OrderStatus.CONFIRMED.value, "updated_at": now.isoformat()}}
                        )
                        return {"verified": True, "status": "confirmed", "tx_hash": tx_hash}
                    else:
                        return {"verified": False, "error": "Transfer not to correct address", "status": order.get("status")}
                else:
                    return {"verified": False, "error": "Not a USDT contract transaction", "status": order.get("status")}
                    
        except httpx.TimeoutException:
            return {"verified": False, "error": "Blockchain request timeout", "status": order.get("status")}
        except Exception as e:
            logging.error(f"Blockchain verification error: {str(e)}")
            return {"verified": False, "error": f"Verification error: {str(e)}", "status": order.get("status")}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to verify payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
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
                status=OrderStatus(order["status"]) if order["status"] in [s.value for s in OrderStatus] else OrderStatus.PENDING,
                tx_hash=order.get("tx_hash"),
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

@api_router.get("/orders/all", response_model=List[OrderResponse])
async def get_all_orders():
    """Retrieve all orders (admin only - add authentication in production)"""
    try:
        orders = await orders_collection.find().sort("created_at", -1).to_list(length=1000)
        
        return [
            OrderResponse(
                id=str(order["_id"]),
                wallet_address=order["wallet_address"],
                blockchain=order["blockchain"],
                quantity=order["quantity"],
                price_per_token=order["price_per_token"],
                total_amount=order["total_amount"],
                status=OrderStatus(order["status"]) if order["status"] in [s.value for s in OrderStatus] else OrderStatus.PENDING,
                tx_hash=order.get("tx_hash"),
                created_at=datetime.fromisoformat(order["created_at"]),
                updated_at=datetime.fromisoformat(order["updated_at"])
            )
            for order in orders
        ]
    
    except Exception as e:
        logging.error(f"Failed to retrieve all orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve orders: {str(e)}"
        )

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, request: dict):
    """Update order status (admin only - add authentication in production)"""
    try:
        from bson import ObjectId
        
        new_status = request.get("status")
        if not new_status or new_status not in [s.value for s in OrderStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status"
            )
        
        now = datetime.now(timezone.utc)
        
        result = await orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": now.isoformat()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return {"message": "Order status updated successfully", "status": new_status}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to update order status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order status: {str(e)}"
        )

@api_router.get("/stats")
async def get_stats():
    """Get platform statistics"""
    try:
        total_orders = await orders_collection.count_documents({})
        total_wallets = await wallets_collection.count_documents({})
        
        # Calculate total ARA sold (only confirmed orders)
        pipeline = [
            {"$match": {"status": "confirmed"}},
            {"$group": {"_id": None, "total_ara": {"$sum": "$quantity"}}}
        ]
        result = await orders_collection.aggregate(pipeline).to_list(length=1)
        total_ara_sold = result[0]["total_ara"] if result else 0
        
        # Get tokens for sale from settings
        settings = await settings_collection.find_one({"key": "tokens_for_sale"})
        tokens_for_sale = settings["value"] if settings else 400000000
        
        return {
            "total_orders": total_orders,
            "total_wallets": total_wallets,
            "total_ara_sold": total_ara_sold,
            "tokens_for_sale": tokens_for_sale,
            "ara_price": 0.01
        }
    except Exception as e:
        logging.error(f"Failed to get stats: {str(e)}")
        return {
            "total_orders": 0,
            "total_wallets": 0,
            "total_ara_sold": 0,
            "tokens_for_sale": 400000000,
            "ara_price": 0.01
        }

# ===================== ADMIN ENDPOINTS =====================

@api_router.put("/admin/settings/tokens-for-sale")
async def update_tokens_for_sale(request: dict):
    """Update total tokens for sale"""
    try:
        new_value = request.get("tokens_for_sale")
        if new_value is None or new_value < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tokens_for_sale value"
            )
        
        await settings_collection.update_one(
            {"key": "tokens_for_sale"},
            {"$set": {"value": new_value}},
            upsert=True
        )
        
        return {"message": "Tokens for sale updated", "tokens_for_sale": new_value}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to update tokens for sale: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@api_router.get("/admin/settings/tokens-for-sale")
async def get_tokens_for_sale():
    """Get total tokens for sale"""
    try:
        settings = await settings_collection.find_one({"key": "tokens_for_sale"})
        return {"tokens_for_sale": settings["value"] if settings else 400000000}
    except Exception as e:
        return {"tokens_for_sale": 400000000}

@api_router.put("/admin/orders/{order_id}/quantity")
async def update_order_quantity(order_id: str, request: dict):
    """Update order quantity (admin)"""
    try:
        from bson import ObjectId
        
        new_quantity = request.get("quantity")
        if new_quantity is None or new_quantity < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid quantity"
            )
        
        # Get current order to get price_per_token
        order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        price_per_token = order.get("price_per_token", 0.01)
        new_total = new_quantity * price_per_token
        now = datetime.now(timezone.utc)
        
        await orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "quantity": new_quantity,
                    "total_amount": new_total,
                    "updated_at": now.isoformat()
                }
            }
        )
        
        return {
            "message": "Order quantity updated",
            "order_id": order_id,
            "quantity": new_quantity,
            "total_amount": new_total
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to update order quantity: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@api_router.delete("/admin/orders/{order_id}")
async def delete_order(order_id: str):
    """Delete an order (admin)"""
    try:
        from bson import ObjectId
        
        result = await orders_collection.delete_one({"_id": ObjectId(order_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return {"message": "Order deleted", "order_id": order_id}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to delete order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@api_router.post("/admin/orders/create-manual")
async def create_manual_order(request: dict):
    """Create order manually for a wallet (admin)"""
    try:
        wallet_address = request.get("wallet_address")
        quantity = request.get("quantity", 0)
        status_val = request.get("status", "confirmed")
        
        if not wallet_address or quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid wallet_address or quantity"
            )
        
        price_per_token = 0.01
        total_amount = quantity * price_per_token
        now = datetime.now(timezone.utc)
        
        order_data = {
            "wallet_address": wallet_address,
            "blockchain": "ethereum",
            "quantity": quantity,
            "price_per_token": price_per_token,
            "total_amount": total_amount,
            "status": status_val,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "manual": True
        }
        
        result = await orders_collection.insert_one(order_data)
        
        return {
            "message": "Manual order created",
            "order_id": str(result.inserted_id),
            "wallet_address": wallet_address,
            "quantity": quantity,
            "total_amount": total_amount,
            "status": status_val
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to create manual order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@api_router.get("/admin/orders/by-wallet/{wallet_address}")
async def get_orders_by_wallet_admin(wallet_address: str):
    """Get all orders for a wallet with full details (admin)"""
    try:
        orders = await orders_collection.find(
            {"wallet_address": wallet_address}
        ).sort("created_at", -1).to_list(length=1000)
        
        total_tokens = sum(o.get("quantity", 0) for o in orders if o.get("status") == "confirmed")
        
        return {
            "wallet_address": wallet_address,
            "total_tokens": total_tokens,
            "orders": [
                {
                    "id": str(o["_id"]),
                    "quantity": o.get("quantity", 0),
                    "total_amount": o.get("total_amount", 0),
                    "status": o.get("status"),
                    "created_at": o.get("created_at"),
                    "manual": o.get("manual", False)
                }
                for o in orders
            ]
        }
    except Exception as e:
        logging.error(f"Failed to get orders by wallet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

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
