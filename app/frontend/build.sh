#!/bin/bash

# Install dependencies
npm install

# Build the application
npm run build

# Create a simple server to serve the built files
echo "const express = require('express');" > server.js
echo "const path = require('path');" >> server.js
echo "const app = express();" >> server.js
echo "app.use(express.static(path.join(__dirname, 'dist')));" >> server.js
echo "app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'dist', 'index.html')); });" >> server.js
echo "const port = process.env.PORT || 3000;" >> server.js
echo "app.listen(port, () => console.log(\`Server running on port \${port}\`));" >> server.js

# Install express for serving
npm install express 