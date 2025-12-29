# Auralis MongoDB Database Access

## Connection Information

**MongoDB Connection String:**
```
mongodb://localhost:27017
```

**Database Name:**
```
auralis_db
```

**Full Connection String (from .env):**
Check `/app/backend/.env` file for the MONGO_URL value.

## Collections

### 1. **wallets**
Stores connected wallet information
- `address` (string): Wallet address
- `blockchain` (string): "aptos" or "ethereum"  
- `balance` (float): Wallet balance
- `connected_at` (ISO datetime string)
- `last_activity` (ISO datetime string)

### 2. **orders**
Stores token purchase orders
- `_id` (ObjectId): Unique order ID
- `wallet_address` (string): Customer's wallet address
- `blockchain` (string): "aptos"
- `quantity` (float): Number of ARA tokens purchased
- `price_per_token` (float): 0.01 (USD per token)
- `total_amount` (float): Total cost in USD
- `status` (string): "pending", "confirmed", or "failed"
- `created_at` (ISO datetime string)
- `updated_at` (ISO datetime string)

## How to Access

### Option 1: Using MongoDB Compass (GUI)
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect using connection string: `mongodb://localhost:27017`
3. Navigate to database: `auralis_db`
4. Browse collections: `wallets` and `orders`

### Option 2: Using mongo shell (CLI)
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017

# Switch to database
use auralis_db

# View all orders
db.orders.find().pretty()

# View all wallets
db.wallets.find().pretty()

# Count orders
db.orders.countDocuments()

# Find orders by status
db.orders.find({ status: "pending" })

# Find orders by wallet
db.orders.find({ wallet_address: "YOUR_WALLET_ADDRESS" })
```

### Option 3: Using Python (from backend)
```python
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

# Get all orders
orders = await db.orders.find().to_list(length=100)

# Get statistics
total_ara_sold = await db.orders.aggregate([
    {"$group": {"_id": None, "total": {"$sum": "$quantity"}}}
]).to_list(length=1)
```

## Admin Panel Access

Access the built-in admin panel at:
- URL: https://eth-wallet-autopay.preview.emergentagent.com
- Click the Settings icon (⚙️) in the bottom-left corner
- No authentication required (add authentication in production!)

## API Endpoints for Database Access

### Get All Orders
```bash
curl -X GET https://eth-wallet-autopay.preview.emergentagent.com/api/orders/all
```

### Get Wallet Orders
```bash
curl -X GET https://eth-wallet-autopay.preview.emergentagent.com/api/orders/wallet/{wallet_address}
```

### Update Order Status
```bash
curl -X PUT https://eth-wallet-autopay.preview.emergentagent.com/api/orders/{order_id}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

### Get Statistics
```bash
curl -X GET https://eth-wallet-autopay.preview.emergentagent.com/api/stats
```

## Export Data

### Export orders to JSON
```bash
mongoexport --db=auralis_db --collection=orders --out=orders.json
```

### Export orders to CSV
```bash
mongoexport --db=auralis_db --collection=orders --type=csv --fields=wallet_address,quantity,total_amount,status,created_at --out=orders.csv
```

## Important Notes

⚠️ **Security Warning**: The current database has no authentication. In production:
1. Enable MongoDB authentication
2. Create admin user with strong password
3. Create read-only user for analytics
4. Enable SSL/TLS encryption
5. Use firewall to restrict access

⚠️ **Backup**: Regular backups are recommended:
```bash
mongodump --db=auralis_db --out=/backup/$(date +%Y%m%d)
```

⚠️ **Admin Panel**: Currently has no authentication. Add JWT or OAuth before production deployment.
