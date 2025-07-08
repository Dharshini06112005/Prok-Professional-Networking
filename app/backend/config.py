import os
from datetime import timedelta
from urllib.parse import quote_plus

class Config:
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    
    # Database
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = quote_plus(os.environ.get('DB_PASSWORD', 'Dharshu$123'))
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_NAME = os.environ.get('DB_NAME', 'prok_db')
    SQLALCHEMY_DATABASE_URI = f"mysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)
    
    # CORS
    CORS_HEADERS = 'Content-Type' 