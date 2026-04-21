# 🚦 FlowSync AI - Advanced Traffic Management Dashboard

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue.svg" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC.svg" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-5.4.19-646CFF.svg" alt="Vite" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB.svg" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.104.1-009688.svg" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791.svg" alt="PostgreSQL" />
</div>

<br />

<div align="center">
  <h3>🌟 Intelligent Traffic Control | Real-time Monitoring | AI-Powered Optimization</h3>
  <p>A cutting-edge traffic management system featuring advanced AI algorithms, real-time data visualization, and an immersive cyberpunk-inspired interface.</p>
  <p><strong>👋 New to the project?</strong> Check out our <a href="BEGINNER_GUIDE.md">Beginner Guide</a> for a simple overview and easy setup!</p>
</div>

## ✅ **IMPLEMENTATION STATUS**

### **🎯 Completed Features**
- ✅ **Frontend**: React dashboard with advanced visual effects (glassmorphism, particle animations, neon glows)
- ✅ **Backend**: Complete Python/FastAPI backend with real-time WebSocket support
- ✅ **Database**: PostgreSQL models for traffic data, users, intersections, and AI predictions
- ✅ **Authentication**: JWT-based auth with role-based access control
- ✅ **API**: RESTful endpoints for all traffic management operations
- ✅ **Real-time**: WebSocket connections for live traffic updates and alerts
- ✅ **AI Services**: Machine learning pipeline for traffic prediction and optimization
- ✅ **Documentation**: Comprehensive API docs and setup instructions

### **🏗️ Current Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  ✅ React 18 + TypeScript + Tailwind CSS + Vite            │
│  • Real-time dashboard with WebSocket connections          │
│  • Interactive map with traffic visualization              │
│  • Admin panels for traffic management                     │
│  • Advanced animations and glassmorphism effects           │
└─────────────────────────────────────────────────────────────┘
                                   │ HTTP/WebSocket
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   🚀 FASTAPI BACKEND (IMPLEMENTED)          │
├─────────────────────────────────────────────────────────────┤
│  ✅ Python 3.11 + FastAPI + Uvicorn + SQLAlchemy           │
│  • Async REST API endpoints (/api/v1/*)                    │
│  • WebSocket server for real-time updates                  │
│  • JWT authentication & authorization                      │
│  • Background task processing                              │
│  • Comprehensive error handling and logging               │
└─────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                🤖 AI/ML SERVICES (IMPLEMENTED)              │
├─────────────────────────────────────────────────────────────┤
│  ✅ TrafficPredictor | SignalOptimizer | Analytics         │
│  • Scikit-learn models for prediction                      │
│  • Real-time signal timing optimization                    │
│  • Traffic pattern analysis and forecasting                │
│  • ML model training and evaluation                        │
└─────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                   💾 DATA LAYER (IMPLEMENTED)               │
├─────────────────────────────────────────────────────────────┤
│  ✅ PostgreSQL + SQLAlchemy ORM                            │
│  • Traffic data with time-series optimization              │
│  • User management and authentication                       │
│  • Intersection and signal configuration                   │
│  • AI prediction storage and model metadata                │
## 📁 **Project Structure**

```
flowsync-ai/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand state management
│   │   ├── lib/             # Utilities and configurations
│   │   └── hooks/           # Custom React hooks
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                  # Python FastAPI application
│   ├── api/v1/endpoints/    # API route handlers
│   ├── core/                # Core functionality (config, database, security)
│   ├── models/              # SQLAlchemy database models
│   ├── schemas/             # Pydantic data validation schemas
│   ├── services/            # Business logic services
│   └── requirements.txt     # Python dependencies
├── BEGINNER_GUIDE.md        # Simple setup guide for beginners
├── TECH_STACK.md            # Detailed technology stack reference
└── README.md               # This file
```

## ✨ **Key Features**

### **🎨 Advanced UI/UX**
- **Glassmorphism Effects**: Modern frosted glass design with backdrop blur
- **Particle Animations**: Dynamic background particles for visual appeal
- **Neon Glow Effects**: Cyberpunk-inspired lighting and animations
- **Responsive Design**: Optimized for all screen sizes and devices

### **🤖 AI-Powered Intelligence**
- **Real-time Traffic Prediction**: ML models forecasting congestion patterns
- **Adaptive Signal Control**: AI-optimized traffic light timing
- **Anomaly Detection**: Automatic identification of traffic irregularities
- **Predictive Analytics**: Historical data analysis for trend prediction

### **⚡ Real-time Operations**
- **WebSocket Communication**: Live data streaming between frontend and backend
- **Instant Updates**: Real-time traffic status and signal changes
- **Live Monitoring**: Continuous system health and performance tracking
- **Alert System**: Automated notifications for traffic events

### **🔒 Enterprise-Grade Security**
- **JWT Authentication**: Secure token-based user authentication
- **Role-Based Access**: Admin and user permission levels
- **Data Validation**: Comprehensive input validation with Pydantic
- **SQL Injection Protection**: Parameterized queries and ORM security

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 15+
- Git

### **1. Clone and Setup Frontend**
```bash
git clone https://github.com/your-username/flowsync-ai.git
cd flowsync-ai

# Install frontend dependencies
npm install

# Start development server
npm run dev
```
Frontend will be available at `http://localhost:5173`

### **2. Setup Backend**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# The backend will connect to your configured database
# Make sure PostgreSQL is running and database is created
```

### **3. Database Setup**
```bash
# Create PostgreSQL database
createdb flowsync_ai

# Run database initialization (models will auto-create tables)
# Tables are created automatically when the app starts
```

### **4. Seed Mock Data (Optional)**
For development and testing, populate the database with sample data:
```bash
# From the backend directory
cd backend
python scripts/seed_mock_data.py
```

This creates sample users, intersections, traffic data, and AI models for immediate testing.

**Default login credentials:**
- Admin: `admin@flowsync.ai` / `admin123`
- Operator: `operator@flowsync.ai` / `operator123`
- Viewer: `viewer@flowsync.ai` / `viewer123`

### **5. Start Backend Server**
```bash
# Start FastAPI server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be available at `http://localhost:8000`

### **6. Access the Application**
- **Frontend Dashboard**: `http://localhost:5173`
- **API Documentation**: `http://localhost:8000/docs`
- **Alternative API Docs**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/api/health`

## 📚 **API Documentation**

Once both servers are running, you can access comprehensive API documentation:

### **Interactive API Explorer**
Visit `http://localhost:8000/docs` for the Swagger UI, where you can:
- Explore all available endpoints
- Test API calls directly from the browser
- View request/response schemas
- Authenticate with JWT tokens

### **Alternative Documentation**
Visit `http://localhost:8000/redoc` for the ReDoc interface with a cleaner, more readable format.

### **Key API Endpoints**
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/intersections/` - List traffic intersections
- `POST /api/v1/traffic/` - Submit traffic data
- `GET /api/v1/predictions/forecast/{id}` - Get AI predictions
- `WS /api/v1/ws/traffic/{intersection_id}` - Real-time traffic updates

## 📡 **API Endpoints Overview**

### **Authentication**
```http
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User login
POST /api/v1/auth/refresh      # Refresh tokens
```

### **Traffic Management**
```http
GET  /api/v1/intersections/    # List intersections
POST /api/v1/intersections/    # Create intersection
GET  /api/v1/traffic/          # Get traffic data
POST /api/v1/traffic/          # Submit traffic data
GET  /api/v1/signals/          # Get signal status
POST /api/v1/signals/{id}/control # Control signals
```

### **AI Predictions**
```http
GET  /api/v1/predictions/forecast/{id}  # Traffic forecast
GET  /api/v1/predictions/optimize/{id}  # Signal optimization
POST /api/v1/predictions/               # Store prediction
```

### **Real-time WebSockets**
```javascript
// Traffic updates
ws://localhost:8000/api/v1/ws/traffic/{intersection_id}

// System alerts
ws://localhost:8000/api/v1/ws/alerts

// Control operations
ws://localhost:8000/api/v1/ws/control
```

## 🧠 **AI/ML Features**

### **Traffic Prediction**
- Real-time congestion forecasting
- Historical pattern analysis
- Machine learning model training
- Confidence scoring for predictions

### **Signal Optimization**
- AI-powered green light timing
- Traffic flow optimization
- Emergency vehicle priority
- Adaptive signal control

### **Analytics**
- Peak hour identification
- Traffic trend analysis
- Performance metrics
- Historical data processing

## 🗄️ **Database Schema**

```sql
-- Core Tables
users (id, email, username, role, hashed_password, ...)
intersections (id, name, location, latitude, longitude, ...)
traffic_data (id, intersection_id, vehicle_count, density, speed, ...)
signals (id, intersection_id, direction, current_state, cycle_time, ...)
predictions (id, intersection_id, prediction_type, predicted_density, ...)
system_logs (id, level, message, timestamp, ...)
```

## 🔧 **Development Commands**

### **Frontend**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **Backend**
```bash
uvicorn main:app --reload                    # Start with auto-reload
uvicorn main:app --host 0.0.0.0 --port 8000  # Production start
pytest                                       # Run tests
black .                                     # Format code
flake8                                     # Lint code
```

## 🐳 **Docker Deployment**

### **Build and Run**
```bash
# Build images
docker build -t flowsync-frontend ./frontend
docker build -t flowsync-backend ./backend

# Run with docker-compose
docker-compose up -d
```

## 📊 **Monitoring & Logging**

- **Health Checks**: `GET /api/health`
- **API Metrics**: Request/response times, error rates
- **WebSocket Stats**: Active connections, message rates
- **AI Performance**: Model accuracy, prediction latency
- **System Logs**: Structured JSON logging

## 🔒 **Security Features**

- JWT authentication with refresh tokens
- Role-based access control (admin/user)
- Password hashing with bcrypt
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention
- Rate limiting (configurable)

## 📈 **Performance Optimizations**

- **Async/Await**: Full async backend operations
- **Connection Pooling**: Database connection reuse
- **WebSocket Compression**: Efficient real-time data
- **Caching**: Redis integration ready
- **Background Tasks**: Non-blocking ML processing
- **Pagination**: Large dataset handling

## 🧪 **Testing**

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd ..
npm test

# Integration tests
npm run test:e2e
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ using React, FastAPI, and cutting-edge AI technology</p>
  <p>Transforming urban traffic management for the future</p>
</div>

---

<div align="center">
  <p>Built with ❤️ using React, FastAPI, and cutting-edge AI technology</p>
  <p>Transforming urban traffic management for the future</p>
</div>
