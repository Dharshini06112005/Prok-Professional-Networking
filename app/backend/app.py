from flask import Flask, request, jsonify
from app.backend.config import Config
from app.backend.extensions import init_extensions, db
from app.backend.api import auth, feed, jobs, messaging, posts, profile
from flask_cors import CORS

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Apply CORS globally for the deployed frontend
    CORS(app, origins=["https://prok-frontend-aeh5.onrender.com"], supports_credentials=True)
    
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

    @app.route('/', methods=['GET'])
    def index():
        """Root endpoint - health check"""
        return jsonify({
            'status': 'healthy',
            'message': 'Prok Professional Networking Backend is running',
            'version': '1.0.0'
        }), 200

    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'message': 'Backend is running properly',
            'timestamp': request.environ.get('REQUEST_TIME', 'unknown')
        }), 200

    @app.before_request
    def log_request_info():
        print(f"Request: {request.method} {request.url}")
        print(f"Headers: {dict(request.headers)}")

    # Error handlers to ensure JSON responses
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad Request', 'message': str(error)}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized', 'message': 'Authentication required'}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden', 'message': 'Access denied'}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not Found', 'message': 'Resource not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'error': 'Method Not Allowed', 'message': 'HTTP method not supported'}), 405

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal Server Error', 'message': 'Something went wrong'}), 500

    @app.errorhandler(Exception)
    def handle_exception(error):
        return jsonify({'error': 'Server Error', 'message': str(error)}), 500

    return app

# Expose app for Gunicorn
app = create_app()

if __name__ == "__main__":
    print("Backend running at http://localhost:5000")
    app.run(debug=True)
