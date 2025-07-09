#!/usr/bin/env python3

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the Flask app
from app.backend.app import create_app

if __name__ == '__main__':
    app = create_app()
    print("🚀 Starting backend server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000) 