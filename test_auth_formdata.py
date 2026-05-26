import requests

BASE_URL = "http://localhost:8000/api/v1"

def test_auth_flow_formdata():
    print("Logging in with multipart/form-data...")
    # Using files= to force multipart/form-data in requests
    files = {
        "username": (None, "test@predict.com"),
        "password": (None, "password123")
    }
    
    res = requests.post(f"{BASE_URL}/auth/token", files=files)
    
    if res.status_code != 200:
        print("Login failed:", res.status_code, res.text)
        return
        
    token = res.json().get("access_token")
    print(f"Login success! Token: {token[:20] if token else str(token)}")
    
    print("\nFetching Watchlist...")
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    res2 = requests.get(f"{BASE_URL}/watchlist", headers=headers)
    print(f"Watchlist response status: {res2.status_code}")
    print(f"Watchlist response body: {res2.text}")

if __name__ == "__main__":
    test_auth_flow_formdata()
