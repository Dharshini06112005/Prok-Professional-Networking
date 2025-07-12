# Deployment Guide

This guide will help you deploy your Prok Professional Networking application to production.

## Prerequisites

- Git repository with your code
- Cloud hosting platform (Render, Heroku, Railway, etc.)
- Database service (PostgreSQL recommended for production)
- Environment variables configured

## Frontend Deployment (Vite/React)

### 1. Environment Setup

Copy the environment example file and configure your API URL:

```bash
cd app/frontend
cp env.example .env
```

Edit `.env` and set your backend URL:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

### 2. Build the Application

```bash
npm install
npm run build
```

### 3. Deploy to Platform

#### Render (Recommended)
1. Connect your GitHub repository
2. Create a new Static Site
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`

#### Vercel
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL`

#### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_URL`

## Backend Deployment (Flask)

### 1. Environment Setup

Copy the environment example file:

```bash
cd app/backend
cp env.example .env
```

Configure your environment variables in `.env`:

```bash
# Flask Configuration
SECRET_KEY=your-secure-secret-key-here
JWT_SECRET_KEY=your-secure-jwt-secret-key-here

# Database Configuration (PostgreSQL for production)
DATABASE_URL=postgresql://username:password@host:port/database_name

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-url.onrender.com,http://localhost:5173
```

### 2. Database Setup

#### PostgreSQL (Recommended for Production)
1. Create a PostgreSQL database on your cloud provider
2. Get the connection string
3. Set `DATABASE_URL` environment variable

#### MySQL (Alternative)
```bash
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_NAME=your_db_name
```

### 3. Deploy to Platform

#### Render (Recommended)
1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python main.py`
5. Add environment variables from your `.env` file

#### Railway
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

#### Heroku
1. Create a new Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy using Git

### 4. Database Migrations

After deployment, run database migrations:

```bash
# If using Flask-Migrate
flask db upgrade

# Or manually create tables
python -c "from app.backend.app import create_app; from app.backend.extensions import db; app = create_app(); app.app_context().push(); db.create_all()"
```

## Environment Variables Reference

### Frontend (.env)
- `VITE_API_URL`: Your backend API URL

### Backend (.env)
- `SECRET_KEY`: Flask secret key
- `JWT_SECRET_KEY`: JWT signing key
- `DATABASE_URL`: Database connection string (PostgreSQL)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

## Security Considerations

1. **Never commit `.env` files** - they contain sensitive information
2. **Use strong secret keys** - generate random strings for production
3. **Enable HTTPS** - always use HTTPS in production
4. **Set up proper CORS** - only allow your frontend domain
5. **Database security** - use connection pooling and SSL

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `ALLOWED_ORIGINS` includes your frontend URL
2. **Database Connection**: Verify `DATABASE_URL` is correct
3. **Build Failures**: Check all dependencies are in `requirements.txt`
4. **Environment Variables**: Ensure all variables are set in your hosting platform

### Debug Mode

For local testing, you can run both servers:

```bash
# Terminal 1 - Backend
cd app/backend
python main.py

# Terminal 2 - Frontend
cd app/frontend
npm run dev
```

## Monitoring

1. Set up logging for your backend
2. Monitor database performance
3. Set up error tracking (Sentry, etc.)
4. Monitor API response times

## Backup Strategy

1. Regular database backups
2. Version control for code
3. Environment variable backups
4. Media file storage (consider using cloud storage)

## Performance Optimization

1. Enable database connection pooling
2. Use CDN for static assets
3. Implement caching strategies
4. Optimize image uploads and storage 