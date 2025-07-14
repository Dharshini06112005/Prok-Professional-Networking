# Frontend Deployment on Render (Node.js Web Service)

## Important: Use Node.js Web Service, Not Static Site

To support client-side routing (SPA), you must deploy the frontend as a Node.js web service, not a static site. This ensures that refreshing any route works and does not show a 404 error.

### Render Service Settings
- **Type:** Web Service (Node.js)
- **Start Command:** `node server.js`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### Why?
Static sites on Render do not support SPA routing. The Express server (`server.js`) is required to serve `index.html` for all non-API, non-static routes.

### Troubleshooting
- If you see 404 on refresh, you are likely using a static site. Switch to a Node.js web service.
- Make sure your `server.js` includes the catch-all route for SPA routing.

## Quick Deploy on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Static Site"**
3. **Connect your GitHub repository**
4. **Configure the deployment**:
   - **Name**: `prok-frontend`
   - **Build Command**: `cd app/frontend && npm install && npm run build`
   - **Publish Directory**: `app/frontend/dist`
   - **Environment Variable**:
     - Key: `VITE_API_URL`
     - Value: `https://prok-professional-networking-t19l.onrender.com`

5. **Click "Create Static Site"**

## Alternative: Use render.yaml

If you have the render.yaml file in your repo:
1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and deploy both services

## Environment Variables

Make sure to set:
- `VITE_API_URL`: `https://prok-professional-networking-t19l.onrender.com`

## Your Frontend URL

Once deployed, your frontend will be available at:
`https://your-frontend-name.onrender.com`

## Testing

1. Visit your frontend URL
2. Try to sign up/login
3. Check that it connects to your backend at `https://prok-professional-networking-t19l.onrender.com` 