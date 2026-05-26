import requests

BASE_URL = "http://localhost:8000/api/v1"

def test_auth_flow():
    # 1. Login
    print("Logging in...")
    login_data = {
        "username": "test@predict.com",
        "password": "password123"
    }
    # OAuth2PasswordRequestForm expects data as form data, not json
    res = requests.post(f"{BASE_URL}/auth/token", data=login_data)
    
    if res.status_code != 200:
        print("Login failed:", res.status_code, res.text)
        return
        
    token = res.json().get("access_token")
    print(f"Login success! Token: {token[:20]}...")
    
    # 2. Fetch Watchlist
    print("\nFetching Watchlist...")
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Try with exact path
    res2 = requests.get(f"{BASE_URL}/watchlist", headers=headers)
    print(f"Watchlist response status: {res2.status_code}")
    print(f"Watchlist response body: {res2.text}")
    
    if res2.status_code == 401:
        print("Got 401! Trying with trailing slash...")
        res3 = requests.get(f"{BASE_URL}/watchlist/", headers=headers)
        print(f"Watchlist trailing slash response status: {res3.status_code}")

if __name__ == "__main__":
    test_auth_flow()
