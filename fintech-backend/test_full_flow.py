import requests

def test_full_flow():
    BASE_URL = "http://localhost:8000/api/v1"
    
    print("1️⃣ Testing real stock data...")
    try:
        resp = requests.get(f"{BASE_URL}/stocks/RELIANCE.NS")
        resp.raise_for_status()
        stock = resp.json()
        print(f"✅ Got stock: ₹{stock.get('price', 'N/A')}")
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print("\n2️⃣ Testing real historical data...")
    try:
        resp = requests.get(f"{BASE_URL}/stocks/RELIANCE.NS/historical?days=60")
        resp.raise_for_status()
        historical = resp.json()
        print(f"✅ Got {len(historical.get('data', []))} days of historical data")
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print("\n3️⃣ Testing ML prediction...")
    try:
        resp = requests.post(f"{BASE_URL}/real-predictions/RELIANCE.NS")
        resp.raise_for_status()
        prediction = resp.json()
        print(f"✅ Got prediction from {prediction.get('model')}: ₹{prediction.get('prediction', 'N/A')} (confidence: {prediction.get('confidence', 'N/A')})")
    except Exception as e:
        print(f"❌ Failed: {e}")
        
    print("\n4️⃣ Testing DYNAMIC prediction (new stock INFY.NS)...")
    try:
        resp = requests.post(f"{BASE_URL}/real-predictions/INFY.NS")
        resp.raise_for_status()
        prediction = resp.json()
        print(f"✅ Got dynamic prediction from {prediction.get('model')}: ₹{prediction.get('prediction', 'N/A')} (confidence: {prediction.get('confidence', 'N/A')})")
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print("\n✨ Full-stack flow test completed!")

if __name__ == "__main__":
    test_full_flow()
