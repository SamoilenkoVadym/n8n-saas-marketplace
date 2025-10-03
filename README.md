# n8n SaaS Marketplace

A comprehensive platform for discovering, purchasing, and deploying n8n workflows. This marketplace enables users to browse pre-built automation workflows, subscribe to workflow packages, and seamlessly integrate them into their n8n instances.

## Features

- **Workflow Marketplace**: Browse and discover pre-built n8n workflows
- **User Authentication**: Secure user registration and login system
- **Subscription Management**: Stripe-powered payment processing for workflow subscriptions
- **AI-Powered Recommendations**: Azure OpenAI integration for personalized workflow suggestions
- **Real-time Updates**: Redis caching for optimal performance
- **Modern UI**: Built with Next.js 15 and React 19

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT with bcrypt
- **Payments**: Stripe
- **AI**: Azure OpenAI

### Frontend
- **Framework**: Next.js 15
- **UI**: React 19 with Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **n8n**: Self-hosted n8n instance
- **Database**: PostgreSQL 16
- **Cache**: Redis 7

## Project Structure

```
n8n-saas-marketplace/
├── backend/                 # Backend API
│   ├── src/                # Source code
│   ├── prisma/             # Database schema and migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   └── lib/           # Utility functions
│   ├── public/            # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── .env.example
├── docker-compose.yml      # Docker services configuration
├── Makefile               # Convenience commands
├── package.json           # Root package.json with workspaces
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd n8n-saas-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   **Docker Compose Override (Required for secrets):**
   ```bash
   cp docker-compose.override.example.yml docker-compose.override.yml
   ```

   Edit `docker-compose.override.yml` and fill in your actual API keys:
   - `AZURE_OPENAI_API_KEY` - Your Azure OpenAI API key
   - `JWT_SECRET` - Generate with: `openssl rand -base64 32`
   - `ENCRYPTION_KEY` - Generate with: `openssl rand -hex 32`
   - `STRIPE_SECRET_KEY` - Your Stripe secret key (if using payments)
   - `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret (if using payments)

   **Backend .env (Optional - for running outside Docker):**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

   **Frontend .env (Optional):**
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

4. **Start Docker services**
   ```bash
   make up
   # or: docker-compose up -d
   ```

   This will start:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - n8n (port 5678)
   - Backend API (port 4000)

   **Note:** Docker Compose automatically merges `docker-compose.yml` with `docker-compose.override.yml`, so your secrets are loaded securely without being committed to git.

5. **Run database migrations**
   ```bash
   make db-migrate
   ```

6. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:4000
   - n8n: http://localhost:5678

## Security Notes

⚠️ **IMPORTANT: Never commit secrets to git!**

- `docker-compose.override.yml` contains your actual API keys and secrets
- This file is gitignored and should NEVER be committed
- Always use `docker-compose.override.example.yml` as a template
- For production, use environment variables or secure secret management services

## Available Commands

### Makefile Commands

- `make up` - Start all Docker services
- `make down` - Stop all Docker services
- `make logs` - View logs from all services
- `make clean` - Stop services and remove volumes
- `make restart` - Restart all services
- `make backend-shell` - Run backend in development mode
- `make db-migrate` - Run database migrations
- `make help` - Show all available commands

### NPM Commands

- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only backend
- `npm run dev:frontend` - Start only frontend
- `npm run build` - Build both applications
- `npm run build:backend` - Build backend
- `npm run build:frontend` - Build frontend

## Development

### Backend Development

```bash
cd backend
npm run dev              # Start development server
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
```

### Frontend Development

```bash
cd frontend
npm run dev              # Start Next.js development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

## Environment Variables

### Backend (.env)

- `PORT` - Backend server port (default: 4000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `REDIS_URL` - Redis connection URL
- `N8N_API_URL` - n8n instance API URL
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI service endpoint

### Frontend (.env)

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## License

ISC