# 🚀 AV Master Game - Deployment Guide

This guide will help you deploy the AV Master Game to production.

## 📋 Prerequisites

Before deploying, ensure you have:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Node.js** (version 18 or higher) - for local development
- **Git** - for version control

## 🔧 Environment Setup

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Database Configuration
DATABASE_URL=your_database_url

# Server Configuration
NODE_ENV=production
PORT=3001
```

### 2. Database Setup

Run the database migration scripts in your Supabase SQL editor:

1. **Schema Setup**: Run `database/schema.sql`
2. **Authentication Functions**: Run `database/create_auth_functions.sql`
3. **Password Hash Column**: Run `database/add_password_hash.sql`
4. **RLS Policies**: Run `database/fix_rls_policies.sql`

## 🐳 Docker Deployment

### Quick Deployment

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Manual Deployment

```bash
# 1. Create static directory
mkdir -p static

# 2. Copy frontend files
cp index.html static/
cp styles.css static/
cp -r js static/
cp -r database static/

# 3. Build and start containers
docker-compose up --build -d

# 4. Check status
docker-compose ps
```

## 🌐 Production Deployment Options

### Option 1: Railway.com

1. **Connect Repository**:
   - Push your code to GitHub
   - Connect your repository to Railway
   - Set environment variables in Railway dashboard

2. **Deploy**:
   - Railway will automatically detect the Dockerfile
   - Deploy using the Dockerfile

3. **Environment Variables**:
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   PORT=3001
   ```

### Option 2: Heroku

1. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   ```

2. **Set Environment Variables**:
   ```bash
   heroku config:set SUPABASE_URL=your_supabase_url
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   heroku config:set OPENAI_API_KEY=your_openai_key
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

### Option 3: DigitalOcean App Platform

1. **Create App**:
   - Connect your GitHub repository
   - Select the Dockerfile as the source
   - Set environment variables

2. **Configure**:
   - Set build command: `npm install && cd backend && npm install`
   - Set run command: `npm start`
   - Configure environment variables

### Option 4: AWS ECS

1. **Create ECR Repository**:
   ```bash
   aws ecr create-repository --repository-name av-master-game
   ```

2. **Build and Push Image**:
   ```bash
   docker build -t av-master-game .
   docker tag av-master-game:latest your-account.dkr.ecr.region.amazonaws.com/av-master-game:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/av-master-game:latest
   ```

3. **Create ECS Service**:
   - Use the pushed image
   - Configure environment variables
   - Set up load balancer

## 🔍 Health Checks

### Backend Health Check
```bash
curl http://your-domain.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-19T00:00:00.000Z",
  "service": "av-master-backend"
}
```

### Frontend Check
```bash
curl http://your-domain.com
```

Should return the HTML page.

## 📊 Monitoring

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f av-master-backend
docker-compose logs -f nginx
```

### Metrics
- **Backend**: Monitor API response times and error rates
- **Database**: Monitor Supabase connection and query performance
- **Frontend**: Monitor page load times and user interactions

## 🔒 Security Considerations

### Environment Variables
- ✅ Never commit `.env` files to version control
- ✅ Use strong, unique JWT secrets
- ✅ Rotate API keys regularly
- ✅ Use environment-specific configurations

### Network Security
- ✅ Enable HTTPS in production
- ✅ Configure CORS properly
- ✅ Implement rate limiting
- ✅ Use security headers

### Database Security
- ✅ Enable Row Level Security (RLS)
- ✅ Use service role keys only for backend operations
- ✅ Regularly backup your database
- ✅ Monitor for suspicious activity

## 🚨 Troubleshooting

### Common Issues

1. **Backend Not Starting**:
   ```bash
   # Check logs
   docker-compose logs av-master-backend
   
   # Check environment variables
   docker-compose exec av-master-backend env
   ```

2. **Database Connection Issues**:
   - Verify Supabase URL and keys
   - Check network connectivity
   - Ensure database is accessible

3. **Frontend Not Loading**:
   ```bash
   # Check nginx logs
   docker-compose logs nginx
   
   # Check if static files are copied
   ls -la static/
   ```

4. **API Calls Failing**:
   - Check CORS configuration
   - Verify API endpoints
   - Check authentication tokens

### Performance Issues

1. **Slow Loading**:
   - Enable gzip compression
   - Optimize images
   - Use CDN for static assets

2. **High Memory Usage**:
   - Monitor container resources
   - Optimize Node.js memory settings
   - Consider scaling horizontally

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend service
docker-compose up --scale av-master-backend=3 -d

# Use load balancer for multiple instances
```

### Vertical Scaling
- Increase container memory and CPU limits
- Optimize database queries
- Use caching strategies

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

### Database Migrations
1. Create new migration scripts
2. Test in development environment
3. Apply to production database
4. Update application code

### Backup Strategy
- Regular database backups
- Configuration backups
- Code repository backups

## 📞 Support

For deployment issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Test locally first
4. Check the troubleshooting section above

## 🎉 Success!

Once deployed, your AV Master Game will be available at:
- **Frontend**: `http://your-domain.com`
- **Backend API**: `http://your-domain.com/api`
- **Health Check**: `http://your-domain.com/health`

The game includes:
- ✅ Interactive audio-visual equipment learning
- ✅ AI tutor with voice capabilities
- ✅ User authentication and progress tracking
- ✅ Multiple difficulty levels
- ✅ Real-time feedback and scoring
- ✅ Mobile-responsive design

Happy deploying! 🚀
