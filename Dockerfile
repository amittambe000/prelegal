# Multi-stage build: Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Multi-stage build: Backend
FROM python:3.12-slim
WORKDIR /app

# Install uv
RUN pip install uv

# Copy backend files
COPY backend/ ./backend/
RUN cd backend && uv pip install --system --no-cache -r pyproject.toml

# Copy frontend build
COPY --from=frontend-builder /app/frontend/out ./static

# Expose port
EXPOSE 8000

# Run uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
