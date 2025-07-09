# Prok Professional Networking - Troubleshooting Guide

This document contains all the errors encountered during development and their solutions.

## 1. Skills Data Serialization Issues

### Error Description
Skills data was displaying as a messy string with backslashes and quotes instead of a clean array format.

### Root Cause
- Backend stored skills as a comma-separated string
- Frontend expected skills as an array
- Double encoding issues occurred during serialization

### Solution
**Backend Fix** (`app/backend/api/profile.py`):
```python
# In update_profile endpoint
if 'skills' in data:
    # Handle skills as array from frontend
    if isinstance(data['skills'], list):
        skills_str = ','.join(data['skills'])
    else:
        skills_str = data['skills']
    profile.skills = skills_str

# Always return skills as array
profile_data = {
    # ... other fields
    'skills': profile.skills.split(',') if profile.skills else []
}
```

**Frontend Confirmation**:
- Frontend correctly sends skills as an array
- No changes needed on frontend side

## 2. Port 5000 Already in Use Error

### Error Description
```
Error: Port 5000 is already in use
```

### Root Cause
Another Flask application or process was already running on port 5000.

### Solution
**Find and kill the process using port 5000:**
```bash
# Find the process
sudo lsof -i :5000

# Kill the process (replace PID with actual process ID)
sudo kill -9 <PID>

# Alternative: kill all processes on port 5000
sudo fuser -k 5000/tcp
```

**Restart the backend:**
```bash
cd app/backend
source venv/bin/activate
flask run
```

## 3. Flask App Instance Not Found Error

### Error Description
```
Error: Could not locate a Flask application. You did not provide the "FLASK_APP" environment variable...
```

### Root Cause
The Flask app uses a factory pattern (`create_app()` function) but the environment variable wasn't set correctly.

### Solution
**Set the correct FLASK_APP environment variable:**
```bash
export FLASK_APP=app.backend.app:create_app
export FLASK_ENV=development
flask run
```

**Or run with the environment variable inline:**
```bash
FLASK_APP=app.backend.app:create_app flask run
```

## 4. CORS (Cross-Origin Resource Sharing) Errors

### Error Description
```
Access to fetch at 'http://localhost:5000/api/profile' from origin 'http://localhost:5175' has been blocked by CORS policy
```

### Root Cause
Backend CORS configuration didn't allow requests from the frontend port (5175).

### Solution
**Update CORS configuration** (`app/backend/app.py`):
```python
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Configure CORS to allow frontend requests
    CORS(app, origins=[
        'http://localhost:5173',
        'http://localhost:5174', 
        'http://localhost:5175'
    ], supports_credentials=True)
    
    # ... rest of app configuration
```

**Restart the backend after making changes.**

## 5. Profile Images Not Displaying (401 Unauthorized)

### Error Description
Profile images uploaded successfully but displayed as broken images with 401 Unauthorized errors in browser console.

### Root Cause
The image serving endpoint required authentication, but browsers cannot provide authentication headers for `<img>` tags.

### Solution
**Remove authentication requirement from image serving endpoint** (`app/backend/api/profile.py`):
```python
@app.route('/uploads/profile_images/<filename>')
def serve_profile_image(filename):
    # Remove @jwt_required() decorator
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
```

**Restart the backend after making changes.**

## 6. Missing Education and Experience Features

### Error Description
Profile system lacked editing and display functionality for education and experience sections.

### Solution
**Frontend - ProfileEdit Component** (`app/frontend/src/components/profile/ProfileEdit.tsx`):
- Added education editing with fields: degree, field, school, start_date, end_date, description
- Added experience editing with fields: job_title, company, start_date, end_date, description
- Implemented add/remove functionality for multiple entries
- Added proper form validation and state management

**Frontend - ProfileInfo Component** (`app/frontend/src/components/profile/ProfileInfo.tsx`):
- Added education display section with professional styling
- Added experience display section with timeline layout
- Implemented smooth animations and responsive design

**CSS Styling**:
- Added comprehensive styles for education and experience sections
- Implemented hover effects and transitions
- Ensured mobile responsiveness

## Environment Setup Commands

### Backend Setup
```bash
cd app/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
export FLASK_APP=app.backend.app:create_app
export FLASK_ENV=development
flask run
```

### Frontend Setup
```bash
cd app/frontend
npm install
npm run dev
```

## Common Debugging Commands

### Check Port Usage
```bash
sudo lsof -i :5000  # Check what's using port 5000
sudo lsof -i :5175  # Check what's using frontend port
```

### Kill Processes
```bash
sudo kill -9 <PID>  # Kill specific process
sudo fuser -k 5000/tcp  # Kill all processes on port 5000
```

### Check Flask Environment
```bash
echo $FLASK_APP  # Check if FLASK_APP is set
flask routes  # List all available routes
```

### Database Migrations
```bash
cd app/backend
flask db upgrade  # Apply pending migrations
flask db migrate -m "description"  # Create new migration
```

## Prevention Tips

1. **Always check port availability** before starting services
2. **Set environment variables** correctly for Flask factory pattern
3. **Configure CORS** to include all frontend development ports
4. **Remove authentication** from static file serving endpoints
5. **Test image uploads** and ensure they display correctly
6. **Use proper data serialization** for complex fields like arrays

## File Structure Reference

```
app/
├── backend/
│   ├── api/
│   │   └── profile.py          # Profile API endpoints
│   ├── app.py                  # Flask app factory
│   └── requirements.txt        # Python dependencies
└── frontend/
    └── src/
        └── components/
            └── profile/
                ├── ProfileEdit.tsx    # Profile editing component
                ├── ProfileInfo.tsx    # Profile display component
                └── ProfileEdit.css    # Styling for edit component
```

This troubleshooting guide should help resolve similar issues in the future and serve as a reference for common development problems. 