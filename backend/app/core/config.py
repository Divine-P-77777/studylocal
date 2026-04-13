from typing import List, Union, Any
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "StudyLocal API"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB
    MONGODB_URI: str
    MONGODB_DB_NAME: str = "test"
    
    # Redis (Upstash Serverless)
    UPSTASH_REDIS_REST_URL: str = ""
    UPSTASH_REDIS_REST_TOKEN: str = ""
    
    # Auth0
    AUTH0_DOMAIN: str = ""
    AUTH0_AUDIENCE: str = ""
    
    # CORS
    BACKEND_CORS_ORIGINS: Union[List[Union[AnyHttpUrl, str]], str] = []
    
    # Admin
    ADMIN_EMAILS: Union[List[str], str] = []

    # Email (Gmail SMTP)
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USER: str = ""
    EMAIL_PASS: str = ""  # Gmail App Password (16-char, no spaces)
    SENDER_EMAIL: str = ""

    @validator("BACKEND_CORS_ORIGINS", "ADMIN_EMAILS", pre=True)
    def assemble_list_from_string(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        return v

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
