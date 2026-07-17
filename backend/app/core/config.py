from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Groq API Configuration
    GROQ_API_KEY: str
    
    # Database Configuration
    DB_URL: str = "sqlite:///./paper_pipeline.db"
    
    # Upload Configuration
    UPLOAD_DIR: str = "./uploads"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
