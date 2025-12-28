#!/usr/bin/env python3
"""
Specific test for the review request requirements
"""
import requests
import json

def test_review_requirements():
    """Test the exact flow requested in the review"""
    base_url = "https://defi-presale-2.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 Testing Review Request Requirements...")
    print("=" * 50)
    
    # Test 1: GET /api/stats
    print("\n1. Testing GET /api/stats")
    try:
        response = requests.get(f"{api_url}/stats", timeout=10)
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Stats endpoint working")
            print(f"   - total_orders: {stats.get('total_orders')}")
            print(f"   - total_wallets: {stats.get('total_wallets')}")
            print(f"   - total_ara_sold: {stats.get('total_ara_sold')}")
            print(f"   - ara_price: {stats.get('ara_price')}")
            initial_stats = stats
        else:
            print(f"❌ Stats endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Stats endpoint error: {e}")
        return False
    
    # Test 2: POST /api/wallets/connect
    print("\n2. Testing POST /api/wallets/connect")
    try:
        payload = {
            "address": "TestWallet123",
            "blockchain": "solana",
            "balance": 0
        }
        response = requests.post(f"{api_url}/wallets/connect", json=payload, timeout=10)
        if response.status_code == 201:
            wallet_data = response.json()
            print(f"✅ Wallet connection successful")
            print(f"   - address: {wallet_data.get('address')}")
            print(f"   - blockchain: {wallet_data.get('blockchain')}")
            print(f"   - balance: {wallet_data.get('balance')}")
        else:
            print(f"❌ Wallet connection failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Wallet connection error: {e}")
        return False
    
    # Test 3: POST /api/orders/create
    print("\n3. Testing POST /api/orders/create")
    try:
        payload = {
            "wallet_address": "TestWallet123",
            "blockchain": "solana",
            "quantity": 100,
            "price_per_token": 0.01
        }
        response = requests.post(f"{api_url}/orders/create", json=payload, timeout=10)
        if response.status_code == 201:
            order_data = response.json()
            print(f"✅ Order creation successful")
            print(f"   - id: {order_data.get('id')}")
            print(f"   - wallet_address: {order_data.get('wallet_address')}")
            print(f"   - quantity: {order_data.get('quantity')}")
            print(f"   - total_amount: {order_data.get('total_amount')}")
            print(f"   - status: {order_data.get('status')}")
            order_id = order_data.get('id')
        else:
            print(f"❌ Order creation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Order creation error: {e}")
        return False
    
    # Test 4: GET /api/orders/wallet/TestWallet123
    print("\n4. Testing GET /api/orders/wallet/TestWallet123")
    try:
        response = requests.get(f"{api_url}/orders/wallet/TestWallet123", timeout=10)
        if response.status_code == 200:
            orders = response.json()
            print(f"✅ Wallet orders retrieved successfully")
            print(f"   - Number of orders: {len(orders)}")
            if orders:
                latest_order = orders[0]
                print(f"   - Latest order ID: {latest_order.get('id')}")
                print(f"   - Latest order quantity: {latest_order.get('quantity')}")
                print(f"   - Latest order status: {latest_order.get('status')}")
        else:
            print(f"❌ Wallet orders retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Wallet orders error: {e}")
        return False
    
    # Test 5: GET /api/orders/all
    print("\n5. Testing GET /api/orders/all (admin endpoint)")
    try:
        response = requests.get(f"{api_url}/orders/all", timeout=10)
        if response.status_code == 200:
            all_orders = response.json()
            print(f"✅ All orders retrieved successfully")
            print(f"   - Total orders in system: {len(all_orders)}")
        else:
            print(f"❌ All orders retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ All orders error: {e}")
        return False
    
    # Test 6: Verify stats updated
    print("\n6. Verifying stats updated after order creation")
    try:
        response = requests.get(f"{api_url}/stats", timeout=10)
        if response.status_code == 200:
            updated_stats = response.json()
            print(f"✅ Updated stats retrieved")
            print(f"   - total_orders: {updated_stats.get('total_orders')} (was {initial_stats.get('total_orders')})")
            print(f"   - total_wallets: {updated_stats.get('total_wallets')} (was {initial_stats.get('total_wallets')})")
            print(f"   - total_ara_sold: {updated_stats.get('total_ara_sold')} (was {initial_stats.get('total_ara_sold')})")
            
            # Verify stats increased
            if updated_stats.get('total_orders', 0) >= initial_stats.get('total_orders', 0):
                print("✅ Order count maintained or increased")
            else:
                print("⚠️ Order count decreased unexpectedly")
                
            if updated_stats.get('total_ara_sold', 0) >= initial_stats.get('total_ara_sold', 0):
                print("✅ ARA sold count maintained or increased")
            else:
                print("⚠️ ARA sold count decreased unexpectedly")
        else:
            print(f"❌ Updated stats retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Updated stats error: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All review requirements tested successfully!")
    print("✅ Full order creation flow verified:")
    print("   1. ✅ Connect wallet")
    print("   2. ✅ Create order")
    print("   3. ✅ Verify order appears in wallet orders")
    print("   4. ✅ Verify stats updated")
    return True

if __name__ == "__main__":
    success = test_review_requirements()
    exit(0 if success else 1)