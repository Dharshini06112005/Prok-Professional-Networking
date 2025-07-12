#!/bin/bash

echo "🚀 Prok Professional Networking - Deployment Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "app/backend/requirements.txt" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Generate secure keys
echo "🔑 Generating secure keys..."
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

echo "Generated SECRET_KEY: $SECRET_KEY"
echo "Generated JWT_SECRET_KEY: $JWT_SECRET_KEY"

echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo ""
echo "1. 🗄️  PostgreSQL Database Setup:"
echo "   - Go to Render Dashboard → New + → PostgreSQL"
echo "   - Name: prok-database"
echo "   - Copy the External Database URL"
echo ""
echo "2. 🔧 Backend Deployment:"
echo "   - Go to Render Dashboard → New + → Web Service"
echo "   - Connect your GitHub repository"
echo "   - Build Command: pip install -r app/backend/requirements.txt"
echo "   - Start Command: cd app/backend && gunicorn --config gunicorn.conf.py main:app"
echo "   - Environment Variables:"
echo "     DATABASE_URL = [Your PostgreSQL URL]"
echo "     SECRET_KEY = $SECRET_KEY"
echo "     JWT_SECRET_KEY = $JWT_SECRET_KEY"
echo "     ALLOWED_ORIGINS = https://your-frontend-url.onrender.com,http://localhost:5173"
echo "     FLASK_ENV = production"
echo ""
echo "3. 🎨 Frontend Deployment:"
echo "   - Go to Render Dashboard → New + → Web Service"
echo "   - Connect your GitHub repository"
echo "   - Build Command: cd app/frontend && npm install && npm run build"
echo "   - Start Command: cd app/frontend && npm start"
echo "   - Environment Variables:"
echo "     VITE_API_URL = https://your-backend-url.onrender.com"
echo ""
echo "4. 🔄 Database Initialization:"
echo "   - After backend deployment, go to your backend service"
echo "   - Click 'Shell' tab"
echo "   - Run: cd app/backend && python -c \"from app.backend.app import create_app; from app.backend.extensions import db; app = create_app(); app.app_context().push(); db.create_all()\""
echo ""
echo "5. 🌐 Update CORS:"
echo "   - After getting frontend URL, update backend ALLOWED_ORIGINS"
echo ""
echo "✅ Deployment files are ready!"
echo "📝 Copy the generated keys above for your environment variables" 