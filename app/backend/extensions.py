from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000 per day", "200 per hour", "50 per minute"]
)

def init_extensions(app):
    """Initialize all Flask extensions"""
    db.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
