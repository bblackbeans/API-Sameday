# SameDay API - AdonisJS Application

This is a fullstack application built with AdonisJS, featuring:

1. Bodyparser
2. Session management
3. Authentication (JWT)
4. Web security middleware (Shield)
5. CORS support
6. Edge template engine
7. Lucid ORM with MySQL
8. Database migrations and seeds
9. WebSocket support
10. Payment integration (IUGU)
11. SMS service (Twilio)
12. Push notifications (OneSignal)
13. File upload (Cloudinary)

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MySQL database
- Redis (for sessions)

### Local Development

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd sameday-api-main
npm install
```

2. **Environment setup:**
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Database setup:**
```bash
npm run migration
```

4. **Start development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3004`

### Health Check

The application includes a health check endpoint:
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

## Docker

### Build and Run

```bash
# Build the image
docker build -t sameday-api .

# Run the container
docker run -p 3004:3004 --env-file .env sameday-api
```

### Docker Compose

Add this service to your `docker-compose.yml`:

```yaml
services:
  api:
    build: .
    ports:
      - "${API_PORT:-3004}:3004"
    environment:
      - NODE_ENV=production
      - PORT=3004
    env_file:
      - .env
    depends_on:
      - mysql
      - redis
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3004/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run server` - Start server without environment variables
- `npm run test` - Run tests
- `npm run migration` - Run database migrations
- `npm run migration:rollback` - Rollback last migration
- `npm run migration:reset` - Reset all migrations
- `npm run seed` - Run database seeds
- `npm run ace` - Run AdonisJS commands

## Environment Variables

Copy `env.example` to `.env` and configure:

- `PORT` - Server port (default: 3004)
- `NODE_ENV` - Environment (development/production)
- `APP_KEY` - Application encryption key
- Database configuration (MySQL)
- Redis configuration
- External service API keys

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database and Redis
3. Set all required API keys
4. Use Docker for containerized deployment
5. Ensure health check endpoint is accessible
