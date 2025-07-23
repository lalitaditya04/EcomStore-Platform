# Deployment Guide

## Local Development

### Prerequisites
- Node.js (v14+)
- MongoDB
- Git

### Setup
1. Clone the repository
2. Install root dependencies: `npm install`
3. Install all dependencies: `npm run install-all`
4. Create `.env` file in server directory
5. Start development: `npm run dev`

## Environment Variables

### Server (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ecomstore
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

## Production Deployment

### Heroku Deployment
1. Create Heroku app: `heroku create your-app-name`
2. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   ```
3. Deploy: `git push heroku main`

### Other Platforms
- **Vercel**: Use for frontend deployment
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment
- **AWS**: Complete cloud solution

## Database Setup

### MongoDB Atlas (Recommended for production)
1. Create account at MongoDB Atlas
2. Create new cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string

### Local MongoDB
1. Install MongoDB
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/ecomstore`

## Build Process
1. Frontend build: `npm run build`
2. Serves static files from server
3. API routes handle backend logic

## Security Considerations
- Use strong JWT secrets
- Enable CORS properly
- Validate all inputs
- Use HTTPS in production
- Secure file uploads
