# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

**Current Status:** Backend infrastructure complete (KAN-6). Frontend has manual form for Mutual NDA only. AI chat integration and multi-document support are planned for future releases.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### ✅ Completed (KAN-5) - Frontend Foundation
- Next.js 16 with React 19, TypeScript, Tailwind CSS 4
- Manual form for Mutual NDA with 10 input fields
- Live preview with markdown rendering
- Client-side PDF generation (jsPDF)
- Comprehensive test suite (Jest + React Testing Library)

### ✅ Completed (KAN-6) - Backend Infrastructure
- **FastAPI backend** with Python 3.12, SQLAlchemy, uv package manager
- **SQLite database** with User and Document models (fresh DB on container restart)
- **JWT authentication** with HttpOnly cookies, bcrypt password hashing
- **Document persistence** - CRUD endpoints with user authorization
- **Docker multi-stage build** (Node frontend + Python backend)
- **Static Next.js export** served by FastAPI at localhost:8000
- **Cross-platform scripts** - start/stop for Mac, Linux, Windows
- **API client library** - frontend/lib/api.ts for backend communication
- **Comprehensive documentation** - README with setup and API docs

### ⏳ Planned (Future Releases)

**AI Chat Integration (PL-5):**
- AI chat interface to replace manual form
- LiteLLM via OpenRouter with Cerebras inference
- Structured outputs for field extraction
- Conversational document creation

**Multi-Document Support (PL-6):**
- Support for all 11 document types from catalog.json
- Document type detection and routing
- Dedicated components for each document type

**Frontend Auth UI (PL-7):**
- Signup/signin modals in frontend
- User menu and session management
- My Documents modal (save/load/delete)
- Auth context integration

### Current API Endpoints (Backend Only - No Frontend Integration Yet)

**Authentication:**
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in and receive JWT cookie
- `POST /api/auth/signout` - Clear auth cookie
- `GET /api/auth/me` - Get current user info

**Documents (auth required):**
- `GET /api/documents` - List user's saved documents
- `POST /api/documents` - Save new document
- `GET /api/documents/{id}` - Get specific document
- `PUT /api/documents/{id}` - Update document
- `DELETE /api/documents/{id}` - Delete document

**Health:**
- `GET /api/health` - Health check

**Planned (Not Yet Implemented):**
- `GET /api/chat/greeting` - Get AI greeting
- `POST /api/chat/message` - Send chat message and get AI response

---

## KAN-6 Implementation Details (March 23, 2026)

### Architecture
- **Backend**: FastAPI with pragmatic flat structure (no over-engineering)
- **Database**: SQLite with User and Document tables, proper indexes
- **Auth**: JWT tokens (7-day expiry) in HttpOnly cookies, bcrypt hashing
- **Frontend**: Next.js static export (output: 'export'), served by FastAPI
- **Container**: Docker multi-stage build, ~35 second startup

### Files Created (23)
```
backend/
├── main.py              # FastAPI app with all routes
├── models.py            # SQLAlchemy User and Document models
├── auth.py              # JWT and password utilities
├── database.py          # SQLite connection and session management
├── schemas.py           # Pydantic request/response validation
├── pyproject.toml       # Python dependencies (uv)
└── .python-version      # Python 3.12

frontend/
├── lib/api.ts           # API client for backend calls
└── types/api.ts         # TypeScript types for API responses

scripts/
├── start-mac.sh         # Start Docker on Mac
├── stop-mac.sh          # Stop Docker on Mac
├── start-linux.sh       # Start Docker on Linux
├── stop-linux.sh        # Stop Docker on Linux
├── start-windows.ps1    # Start Docker on Windows
└── stop-windows.ps1     # Stop Docker on Windows

Dockerfile               # Multi-stage: Node build + Python runtime
docker-compose.yml       # Service orchestration with env vars
.dockerignore            # Exclude node_modules, .next, etc.
.env.example             # Template for environment variables
README.md                # Complete setup and API documentation
```

### Security Implemented
- JWT secret loaded from environment variable (not hardcoded)
- Passwords hashed with bcrypt (cost factor 10)
- HttpOnly cookies prevent XSS attacks
- CORS configured for localhost development
- SQL injection protection via SQLAlchemy ORM
- Pydantic validation on all inputs

### Testing Completed
- ✅ All API endpoints tested with curl
- ✅ User signup/signin flow verified
- ✅ JWT authentication working correctly
- ✅ Document CRUD with authorization verified
- ✅ Static frontend serving confirmed
- ✅ Docker build and container startup successful

### Known Limitations (By Design)
- SQLite won't handle high concurrency → Migrate to PostgreSQL later
- No Alembic migrations → Add when needed
- CORS origins hardcoded → Make configurable for production
- No rate limiting → Add when abuse occurs
- Cookie security flags for development → Enable secure=True for production HTTPS

### Next Steps
1. Build frontend auth UI (signup/signin modals)
2. Connect frontend to backend API endpoints
3. Integrate AI chat (LiteLLM via OpenRouter with Cerebras)
4. Add remaining 10 document types

**PR**: https://github.com/amittambe000/prelegal/pull/5
**Branch**: `feature/kan-6-v1-foundation`