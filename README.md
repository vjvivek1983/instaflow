# InstaFlow - Instagram Automation Platform

InstaFlow is a powerful Instagram automation platform that helps businesses and creators automate their Instagram interactions, marketing, and customer service.

## Project Structure
```
instaflow/
├── backend/              # FastAPI backend application
│   ├── app/             # Application code
│   ├── alembic/         # Database migrations
│   └── tests/           # Backend tests
├── frontend/            # React frontend application
│   ├── src/             # Source code
│   └── public/          # Public assets
└── docker/              # Docker configuration files
```

## Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Docker & Docker Compose

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/instaflow.git
cd instaflow
```

2. Start the development environment:
```bash
docker-compose up -d
```

3. Initialize the database:
```bash
docker-compose exec backend alembic upgrade head
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Development Setup

### Backend
1. Create a Python virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run migrations:
```bash
alembic upgrade head
```

5. Start the development server:
```bash
uvicorn app.main:app --reload
```

### Frontend
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. Start the development server:
```bash
npm run dev
```

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: JWT secret key
- `INSTAGRAM_APP_ID`: Instagram App ID
- `INSTAGRAM_APP_SECRET`: Instagram App Secret
- `FRONTEND_URL`: Frontend application URL
- `BACKEND_URL`: Backend API URL

## Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Deployment
1. Update environment variables in `docker-compose.prod.yml`
2. Build and start containers:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## License
[MIT License](LICENSE) 