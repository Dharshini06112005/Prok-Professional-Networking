import os
from app import create_app

# Create the app instance for Gunicorn
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"Backend running at http://{host}:{port}")
    app.run(host=host, port=port, debug=debug) 