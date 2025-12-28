import requests
import sys
import json
from datetime import datetime

class AuralisAPITester:
    def __init__(self, base_url="https://defi-presale-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_fields = ["message", "token", "price"]
                has_fields = all(field in data for field in expected_fields)
                if has_fields and data.get("token") == "ARA" and data.get("price") == 0.01:
                    self.log_test("API Root", True)
                    return data
                else:
                    self.log_test("API Root", False, f"Missing fields or incorrect values: {data}")
                    return None
            else:
                self.log_test("API Root", False, f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return None

    def test_wallet_connection(self, address, blockchain):
        """Test wallet connection endpoint"""
        try:
            payload = {
                "address": address,
                "blockchain": blockchain,
                "balance": 1.5
            }
            response = requests.post(f"{self.api_url}/wallets/connect", json=payload, timeout=10)
            success = response.status_code == 201
            
            if success:
                data = response.json()
                required_fields = ["address", "blockchain", "balance", "connected_at", "last_activity"]
                has_fields = all(field in data for field in required_fields)
                if has_fields and data.get("address") == address:
                    self.log_test(f"Wallet Connection ({blockchain})", True)
                    return data
                else:
                    self.log_test(f"Wallet Connection ({blockchain})", False, f"Missing fields: {data}")
                    return None
            else:
                self.log_test(f"Wallet Connection ({blockchain})", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test(f"Wallet Connection ({blockchain})", False, str(e))
            return None

    def test_get_wallet(self, address):
        """Test get wallet endpoint"""
        try:
            response = requests.get(f"{self.api_url}/wallets/{address}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if data.get("address") == address:
                    self.log_test("Get Wallet", True)
                    return data
                else:
                    self.log_test("Get Wallet", False, f"Address mismatch: {data}")
                    return None
            else:
                self.log_test("Get Wallet", False, f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Get Wallet", False, str(e))
            return None

    def test_create_order(self, wallet_address, blockchain, quantity):
        """Test create order endpoint"""
        try:
            payload = {
                "wallet_address": wallet_address,
                "blockchain": blockchain,
                "quantity": quantity,
                "price_per_token": 0.01
            }
            response = requests.post(f"{self.api_url}/orders/create", json=payload, timeout=10)
            success = response.status_code == 201
            
            if success:
                data = response.json()
                required_fields = ["id", "wallet_address", "blockchain", "quantity", "total_amount", "status"]
                has_fields = all(field in data for field in required_fields)
                expected_total = quantity * 0.01
                if has_fields and data.get("total_amount") == expected_total:
                    self.log_test("Create Order", True)
                    return data
                else:
                    self.log_test("Create Order", False, f"Missing fields or incorrect total: {data}")
                    return None
            else:
                self.log_test("Create Order", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Create Order", False, str(e))
            return None

    def test_get_wallet_orders(self, wallet_address):
        """Test get wallet orders endpoint"""
        try:
            response = requests.get(f"{self.api_url}/orders/wallet/{wallet_address}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Wallet Orders", True)
                    return data
                else:
                    self.log_test("Get Wallet Orders", False, f"Expected list, got: {type(data)}")
                    return None
            else:
                self.log_test("Get Wallet Orders", False, f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Get Wallet Orders", False, str(e))
            return None

    def test_stats_endpoint(self):
        """Test stats endpoint"""
        try:
            response = requests.get(f"{self.api_url}/stats", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ["total_orders", "total_wallets", "total_ara_sold", "ara_price"]
                has_fields = all(field in data for field in required_fields)
                if has_fields and data.get("ara_price") == 0.01:
                    self.log_test("Stats Endpoint", True)
                    return data
                else:
                    self.log_test("Stats Endpoint", False, f"Missing fields: {data}")
                    return None
            else:
                self.log_test("Stats Endpoint", False, f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Stats Endpoint", False, str(e))
            return None

    def test_order_without_wallet(self):
        """Test creating order without connected wallet (should fail)"""
        try:
            payload = {
                "wallet_address": "NonexistentWallet123",
                "blockchain": "solana",
                "quantity": 1000,
                "price_per_token": 0.01
            }
            response = requests.post(f"{self.api_url}/orders/create", json=payload, timeout=10)
            success = response.status_code == 404  # Should fail with 404
            
            if success:
                self.log_test("Order Without Wallet (Expected Failure)", True)
                return True
            else:
                self.log_test("Order Without Wallet (Expected Failure)", False, f"Expected 404, got: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Order Without Wallet (Expected Failure)", False, str(e))
            return False

    def test_get_all_orders(self):
        """Test get all orders endpoint (admin)"""
        try:
            response = requests.get(f"{self.api_url}/orders/all", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get All Orders (Admin)", True)
                    return data
                else:
                    self.log_test("Get All Orders (Admin)", False, f"Expected list, got: {type(data)}")
                    return None
            else:
                self.log_test("Get All Orders (Admin)", False, f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Get All Orders (Admin)", False, str(e))
            return None

    def test_update_order_status(self, order_id, new_status):
        """Test update order status endpoint (admin)"""
        try:
            payload = {"status": new_status}
            response = requests.put(f"{self.api_url}/orders/{order_id}/status", json=payload, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if data.get("status") == new_status:
                    self.log_test(f"Update Order Status to {new_status}", True)
                    return data
                else:
                    self.log_test(f"Update Order Status to {new_status}", False, f"Status not updated: {data}")
                    return None
            else:
                self.log_test(f"Update Order Status to {new_status}", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test(f"Update Order Status to {new_status}", False, str(e))
            return None

    def test_update_nonexistent_order(self):
        """Test updating nonexistent order (should fail)"""
        try:
            fake_order_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format but nonexistent
            payload = {"status": "confirmed"}
            response = requests.put(f"{self.api_url}/orders/{fake_order_id}/status", json=payload, timeout=10)
            success = response.status_code == 404  # Should fail with 404
            
            if success:
                self.log_test("Update Nonexistent Order (Expected Failure)", True)
                return True
            else:
                self.log_test("Update Nonexistent Order (Expected Failure)", False, f"Expected 404, got: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Update Nonexistent Order (Expected Failure)", False, str(e))
            return False

def main():
    print("🚀 Starting Auralis API Testing...")
    print("=" * 50)
    
    tester = AuralisAPITester()
    
    # Test 1: API Root
    print("\n📡 Testing API Root...")
    root_data = tester.test_api_root()
    
    # Test 2: Wallet Connections
    print("\n💰 Testing Wallet Connections...")
    test_eth_address = "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
    test_aptos_address = "0x1234567890abcdef1234567890abcdef12345678"
    
    eth_wallet = tester.test_wallet_connection(test_eth_address, "ethereum")
    aptos_wallet = tester.test_wallet_connection(test_aptos_address, "aptos")
    
    # Test 3: Get Wallet
    print("\n🔍 Testing Get Wallet...")
    if eth_wallet:
        tester.test_get_wallet(test_eth_address)
    
    # Test 4: Create Orders
    print("\n📝 Testing Order Creation...")
    order = None
    if eth_wallet:
        order = tester.test_create_order(test_eth_address, "ethereum", 1000)
    
    # Test 5: Get Wallet Orders
    print("\n📋 Testing Get Wallet Orders...")
    if eth_wallet:
        orders = tester.test_get_wallet_orders(test_eth_address)
    
    # Test 6: Stats Endpoint
    print("\n📊 Testing Stats Endpoint...")
    stats = tester.test_stats_endpoint()
    
    # Test 7: Error Handling
    print("\n⚠️ Testing Error Handling...")
    tester.test_order_without_wallet()
    
    # Test 8: Admin Endpoints
    print("\n👑 Testing Admin Endpoints...")
    all_orders = tester.test_get_all_orders()
    
    # Test order status update if we have an order
    if order and order.get("id"):
        print(f"\n🔄 Testing Order Status Updates...")
        tester.test_update_order_status(order["id"], "confirmed")
        tester.test_update_order_status(order["id"], "failed")
        tester.test_update_order_status(order["id"], "pending")  # Reset to pending
    
    # Test updating nonexistent order
    tester.test_update_nonexistent_order()
    
    # Summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        print("\nFailed tests:")
        for result in tester.test_results:
            if not result["success"]:
                print(f"  - {result['test']}: {result['details']}")
        return 1

if __name__ == "__main__":
    sys.exit(main())