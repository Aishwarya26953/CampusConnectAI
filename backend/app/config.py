from pydantic_settings import BaseSettings
from typing import List
import secrets


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = None  # Must be set in .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    GEMINI_API_KEY: str = ""
    ADMIN_EMAIL: str = "admin@campusconnect.edu"
    ADMIN_PASSWORD: str = None  # Must be set in .env
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://campus-connect-ai-chi.vercel.app"
    
    # Security settings
    PASSWORD_MIN_LENGTH: int = 8
    MAX_LOGIN_ATTEMPTS: int = 5
    LOGIN_ATTEMPT_WINDOW_MINUTES: int = 15

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Validate critical settings
        if not self.SECRET_KEY:
            self.SECRET_KEY = secrets.token_urlsafe(32)
        if not self.ADMIN_PASSWORD:
            self.ADMIN_PASSWORD = "Admin@123"  # Default, should be changed

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()