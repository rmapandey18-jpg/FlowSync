# FlowSync AI Backend

A comprehensive Python backend for the FlowSync AI traffic management system, built with FastAPI and real-time WebSocket support.

## Features

- **Real-time Traffic Monitoring**: WebSocket-based live traffic data streaming
- **AI-Powered Predictions**: Machine learning models for traffic flow prediction
- **Traffic Signal Control**: REST API for signal timing optimization
- **User Authentication**: JWT-based authentication with role-based access
- **Database Integration**: PostgreSQL with SQLAlchemy ORM
- **Scalable Architecture**: Async operations with connection pooling

## Tech Stack

- **Framework**: FastAPI (async Python web framework)
- **Database**: PostgreSQL with async SQLAlchemy
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time**: WebSockets for live data streaming
- **AI/ML**: Scikit-learn, TensorFlow for traffic predictions
- **Data Validation**: Pydantic models
- **ASGI Server**: Uvicorn

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── api/
│   ├── __init__.py
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── api.py         # API router configuration
│   │   └── endpoints/     # API endpoint modules
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── intersections.py
│   │       ├── traffic_data.py
│   │       ├── predictions.py
│   │       ├── signals.py
│   │       └── websocket.py
├── core/
│   ├── config.py          # Application configuration
│   ├── database.py        # Database models and session
│   ├── websocket.py       # WebSocket connection manager
│   └── security.py        # JWT token handling
├── models/                # SQLAlchemy models
├── schemas/               # Pydantic schemas
├── services/              # Business logic services
│   ├── traffic_service.py
│   └── ai_service.py
├── requirements.txt       # Python dependencies
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL database
- Redis (optional, for caching)

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd flowsync-ai/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secret keys
   ```

5. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Start the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

## Seeding Mock Data

For development and testing, you can populate the database with sample data:

1. **Ensure database is set up and migrations are run**

2. **Run the seeding script:**
   ```bash
   python scripts/seed_mock_data.py
   ```

This will create:
- Sample users (admin, operator, viewer)
- 5 traffic intersections with realistic locations
- 24 hours of historical traffic data (every 5 minutes)
- Sample traffic events (accidents, construction, emergencies)
- AI model metadata

**Default login credentials:**
- Admin: `admin@flowsync.ai` / `admin123`
- Operator: `operator@flowsync.ai` / `operator123`
- Viewer: `viewer@flowsync.ai` / `viewer123`

## API Documentation

Once the server is running, visit:
- **Interactive API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users/` - List users (admin only)
- `GET /api/v1/users/{user_id}` - Get user by ID (admin only)

### Intersections
- `GET /api/v1/intersections/` - List intersections
- `POST /api/v1/intersections/` - Create intersection
- `GET /api/v1/intersections/{id}` - Get intersection details
- `PUT /api/v1/intersections/{id}` - Update intersection
- `DELETE /api/v1/intersections/{id}` - Delete intersection

### Traffic Data
- `GET /api/v1/traffic/` - Get traffic data with filters
- `POST /api/v1/traffic/` - Create traffic data entry
- `POST /api/v1/traffic/bulk` - Bulk insert traffic data
- `GET /api/v1/traffic/latest/{intersection_id}` - Get latest traffic data
- `GET /api/v1/traffic/summary/{intersection_id}` - Get traffic summary

### AI Predictions
- `GET /api/v1/predictions/` - Get predictions
- `POST /api/v1/predictions/` - Create prediction
- `GET /api/v1/predictions/forecast/{intersection_id}` - Get traffic forecast
- `GET /api/v1/predictions/optimize/{intersection_id}` - Get signal optimization

### Traffic Signals
- `GET /api/v1/signals/` - List signals
- `POST /api/v1/signals/` - Create signal
- `PUT /api/v1/signals/{id}` - Update signal
- `POST /api/v1/signals/{id}/control` - Control signal state
- `POST /api/v1/signals/{id}/reset` - Reset signal to automatic

### WebSocket Endpoints
- `WS /api/v1/ws/traffic/{intersection_id}` - Real-time traffic updates
- `WS /api/v1/ws/alerts` - System alerts
- `WS /api/v1/ws/control` - Traffic control operations

## WebSocket Usage

### Traffic Updates
```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/ws/traffic/1?token=YOUR_JWT_TOKEN');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Traffic update:', data);
};
```

### System Alerts
```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/ws/alerts?token=YOUR_JWT_TOKEN');

ws.onmessage = (event) => {
    const alert = JSON.parse(event.data);
    console.log('Alert:', alert);
};
```

## Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/flowsync_ai

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Server
HOST=0.0.0.0
PORT=8000

# AI/ML
MODEL_CACHE_DIR=./models
PREDICTION_INTERVAL_MINUTES=60

# Optional: Redis
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=INFO
```

## Database Schema

The application uses the following main entities:

- **Users**: System users with authentication
- **Intersections**: Traffic intersections with location data
- **TrafficData**: Real-time traffic measurements
- **Predictions**: AI-generated traffic predictions
- **Signals**: Traffic signal configurations and states
- **SystemLogs**: Application logs and events

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
isort .
```

### Linting
```bash
flake8 .
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "migration message"

# Apply migrations
alembic upgrade head

# Downgrade
alembic downgrade -1
```

## Deployment

### Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Server
```bash
# Using gunicorn with uvicorn workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Monitoring

The application includes:
- Health check endpoint: `GET /api/health`
- Structured logging with JSON output
- Performance metrics for API endpoints
- WebSocket connection monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.