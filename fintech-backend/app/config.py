import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ALPHA_VANTAGE_KEY: str = "demo"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./finpredict.db"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "dev-secret-key"

    class Config:
        env_file = ".env"

settings = Settings()
