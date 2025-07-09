#!/usr/bin/env python3

import os
import sys
import subprocess
import time

# Add the project root to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

def start_backend():
    print("🚀 Starting backend server automatically...")
    print(f"Project root: {project_root}")
    
    # Set environment variables
    env = os.environ.copy()
    env['PYTHONPATH'] = project_root
    
    # Start the backend server
    try:
        process = subprocess.Popen([
            sys.executable, 
            os.path.join(project_root, 'app', 'backend', 'main.py')
        ], env=env, cwd=project_root)
        
        print("✅ Backend server started successfully!")
        print("📍 Server running at: http://localhost:5000")
        print("🔄 Server will auto-restart on code changes")
        print("⏹️  Press Ctrl+C to stop the server")
        
        # Keep the process running
        process.wait()
        
    except KeyboardInterrupt:
        print("\n🛑 Stopping backend server...")
        process.terminate()
        process.wait()
        print("✅ Backend server stopped")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False
    
    return True

if __name__ == "__main__":
    start_backend() 