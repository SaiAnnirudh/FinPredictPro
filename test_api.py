import requests

base_url = "http://localhost:8000/api/v1"

# 1. Register a user (or ignore if exists)
try:
    requests.post(f"{base_url}/auth/register", json={"email": "test2@predict.com", "password": "password123"})
except Exception as e:
    print("Register error:", e)

# 2. Login
res = requests.post(f"{base_url}/auth/token", data={"username": "test2@predict.com", "password": "password123"})
print("Login status:", res.status_code)
if res.status_code == 200:
    token = res.json()["access_token"]
    print("Got token")
    
    # 3. Get Watchlist
    headers = {"Authorization": f"Bearer {token}"}
    res_w = requests.get(f"{base_url}/watchlist", headers=headers)
    print("Watchlist status:", res_w.status_code)
    print("Watchlist response:", res_w.text)
else:
    print("Login response:", res.text)
