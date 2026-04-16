# OpKit

OpKit is a full-stack task management application with real-time updates via WebSockets.

## Project Structure

```
OpKit/
├── op-kit-backend/     # NestJS + Prisma + PostgreSQL + Socket.IO
├── op-kit-frontend/    # React + TypeScript + TailwindCSS + Radix UI
└── docker-compose.yml  # PostgreSQL database service
```

## Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Docker** and **Docker Compose**

## Quick Start

### 1. Start the Database

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432 with the following credentials:
- Database: `opkit_db`
- User: `opkit_user`
- Password: `opkit_password`

### 2. Setup Backend

```bash
cd op-kit-backend

# Install dependencies
npm install

# Create environment file
echo "DATABASE_URL=postgresql://opkit_user:opkit_password@localhost:5432/opkit_db
JWT_SECRET=your-secret-key-here
PORT=8000" > .env

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

Backend will be available at: `http://localhost:8000`

Swagger API docs: `http://localhost:8000/api`

### 3. Setup Frontend

In a new terminal:

```bash
cd op-kit-frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at: `http://localhost:3000`

## Launch Sequence Summary

| Step | Command | Location | Port |
|------|---------|----------|------|
| 1 | `docker-compose up -d` | Root | 5432 |
| 2 | `npm install` | `op-kit-backend/` | - |
| 3 | Create `.env` file | `op-kit-backend/` | - |
| 4 | `npx prisma migrate dev` | `op-kit-backend/` | - |
| 5 | `npm run start:dev` | `op-kit-backend/` | 8000 |
| 6 | `npm install` | `op-kit-frontend/` | - |
| 7 | `npm start` | `op-kit-frontend/` | 3000 |

## Environment Variables

### Backend (`op-kit-backend/.env`)

```env
DATABASE_URL=postgresql://opkit_user:opkit_password@localhost:5432/opkit_db
JWT_SECRET=your-secret-key-change-in-production
PORT=8000
```

### Frontend (`op-kit-frontend/.env`)

```env
DISABLE_ESLINT_PLUGIN=true
REACT_APP_API_URL=http://localhost:8000
```

## Available Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Development mode with hot reload |
| `npm run build` | Production build |
| `npm run start:prod` | Run production build |
| `npm test` | Run tests |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma studio` | Open Prisma database GUI |

### Frontend

| Script | Description |
|--------|-------------|
| `npm start` | Development server |
| `npm run build` | Production build |
| `npm test` | Run tests |

## Tech Stack

### Backend
- **NestJS** - Node.js framework
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Relational database
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication
- **Swagger** - API documentation

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Radix UI** - Accessible UI primitives
- **React Hook Form + Zod** - Form handling and validation
- **Socket.IO Client** - Real-time updates
- **React Router** - Navigation
- **Lucide React** - Icons

## Troubleshooting

### Database connection issues
- Ensure Docker is running: `docker ps`
- Check logs: `docker-compose logs postgres`
- Reset database: `docker-compose down -v && docker-compose up -d`

### Prisma errors
- Regenerate client: `npx prisma generate`
- Run migrations: `npx prisma migrate dev`

### Port conflicts
- Backend uses port 8000 (configurable via `PORT` env var)
- Frontend uses port 3000
- Database uses port 5432
