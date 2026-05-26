from fastapi import FastAPI, APIRouter
from fastapi.testclient import TestClient

app = FastAPI()

watchlist_router = APIRouter(prefix="/watchlist")

@watchlist_router.get("")
def get_watchlist():
    return {"msg": "watchlist"}

@watchlist_router.get("/")
def get_watchlist_slash():
    return {"msg": "watchlist_slash"}

app.include_router(watchlist_router, prefix="/api/v1")

client = TestClient(app)

print("GET /api/v1/watchlist :", client.get("/api/v1/watchlist").json())
print("GET /api/v1/watchlist/ :", client.get("/api/v1/watchlist/").json())
