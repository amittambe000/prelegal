# Prelegal - Legal Document Generator

SaaS application for generating legal agreements based on CommonPaper templates.

## Features

- **Mutual NDA Generator** - Manual form-based document creation
- **User Authentication** - JWT-based auth with signup/signin
- **Document Persistence** - Save and manage user documents
- **PDF Export** - Client-side PDF generation

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: FastAPI (Python 3.12), SQLAlchemy, SQLite
- **Deployment**: Docker multi-stage build

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Running Locally

**Mac/Linux:**
```bash
./scripts/start-mac.sh  # or start-linux.sh
```

**Windows:**
```powershell
.\scripts\start-windows.ps1
```

Application will be available at: **http://localhost:8000**

### Stopping

**Mac/Linux:**
```bash
./scripts/stop-mac.sh  # or stop-linux.sh
```

**Windows:**
```powershell
.\scripts\stop-windows.ps1
```

## Project Structure

```
prelegal/
├── backend/           # FastAPI backend
│   ├── main.py       # API routes and app configuration
│   ├── models.py     # SQLAlchemy ORM models
│   ├── auth.py       # JWT authentication utilities
│   ├── database.py   # Database connection management
│   └── schemas.py    # Pydantic validation schemas
├── frontend/          # Next.js static export
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities (API client, template parser)
│   └── types/        # TypeScript type definitions
├── templates/         # CommonPaper legal document templates
├── scripts/          # Start/stop scripts for all platforms
├── Dockerfile        # Multi-stage Docker build
└── docker-compose.yml
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signout` - Clear auth cookie
- `GET /api/auth/me` - Get current user info

### Documents
- `GET /api/documents` - List user's documents
- `POST /api/documents` - Create new document
- `GET /api/documents/{id}` - Get specific document
- `PUT /api/documents/{id}` - Update document
- `DELETE /api/documents/{id}` - Delete document

### Health
- `GET /api/health` - Health check

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
JWT_SECRET_KEY=your-secret-key-at-least-32-characters-long
ALLOWED_ORIGINS=http://localhost:8000
DATABASE_URL=sqlite:///./prelegal.db
```

**⚠️ Important:** Generate a strong JWT secret key for production:
```bash
openssl rand -hex 32
```

## Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

### Backend Development
```bash
cd backend
uv sync
uv run uvicorn backend.main:app --reload  # Runs on http://localhost:8000
```

### Running Tests
```bash
cd frontend
npm test
```

## Security Notes

- JWT tokens stored in HttpOnly cookies (7-day expiry)
- Passwords hashed with bcrypt
- CORS configured for localhost origins
- **TODO for Production:**
  - Set `secure=True` on cookies (requires HTTPS)
  - Use strong JWT_SECRET_KEY from secrets manager
  - Configure production CORS origins
  - Enable rate limiting
  - Add CSRF protection

## License

Uses CommonPaper templates licensed under CC BY 4.0.

## Current Implementation Status

✅ **Completed (KAN-6):**
- FastAPI backend with SQLite
- JWT authentication system
- Document CRUD endpoints
- Docker multi-stage build
- Start/stop scripts (Mac/Linux/Windows)
- Static Next.js export served by FastAPI

⏳ **Not Yet Implemented:**
- AI chat interface (PL-5)
- Other 10 document types (PL-6)
- Frontend auth UI integration
- Document save/load UI

See `CLAUDE.md` for full project requirements and roadmap.

---

_Last updated: March 23, 2026_
