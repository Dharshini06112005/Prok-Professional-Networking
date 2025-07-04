from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from app.backend.config import Config
from flask_jwt_extended import JWTManager
from app.backend.extensions import db, migrate
from app.backend.api import auth_bp, profile_bp, posts_bp, feed_bp, jobs_bp, messaging_bp
from app.backend.api.auth import limiter

_app = None

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    JWTManager(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(profile_bp, url_prefix='/profile')
    app.register_blueprint(posts_bp, url_prefix='/posts')
    app.register_blueprint(feed_bp, url_prefix='/feed')
    app.register_blueprint(jobs_bp, url_prefix='/jobs')
    app.register_blueprint(messaging_bp, url_prefix='/messaging')

    # Import User model inside app context for migration discovery
    with app.app_context():
        from app.backend.models.user import User
        # Import other models as they are implemented

    return app

def get_app():
    global _app
    if _app is None:
        _app = create_app()
    return _app 