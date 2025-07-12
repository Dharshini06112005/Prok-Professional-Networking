from flask import Flask, request
from config import Config
from extensions import init_extensions, db
from api import auth, feed, jobs, messaging, posts, profile

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    init_extensions(app)
    
    # Register blueprints
    app.register_blueprint(auth.auth_bp, url_prefix='/api/auth')
    app.register_blueprint(feed.feed_bp, url_prefix='/api/feed')
    app.register_blueprint(jobs.jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(messaging.messaging_bp, url_prefix='/api/messaging')
    app.register_blueprint(posts.posts_bp, url_prefix='/api/posts')
    app.register_blueprint(profile.profile_bp, url_prefix='/api/profile')
    
    # Create database tables
    with app.app_context():
        db.create_all()

    @app.before_request
    def log_request_info():
        print(f"Request: {request.method} {request.url}")
        print(f"Headers: {dict(request.headers)}")

    return app

if __name__ == "__main__":
    app = create_app()
    print("Backend running at http://localhost:5000")
    app.run(debug=True)
