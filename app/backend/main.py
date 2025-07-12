import os
from app import create_app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"Backend running at http://{host}:{port}")
    app.run(host=host, port=port, debug=debug) 