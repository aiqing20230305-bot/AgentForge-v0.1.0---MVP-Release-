# AgentForge Backend

Node.js + Express + MongoDB backend for AgentForge v1.1.0

## Features

- ✅ **RESTful API**: Complete CRUD operations for Users, Agents, Tasks, and Teams
- ✅ **JWT Authentication**: Secure access with refresh token support
- ✅ **MongoDB Integration**: Mongoose ODM with schema validation
- ✅ **TypeScript**: 100% type-safe codebase
- ✅ **Error Handling**: Global error middleware with development stack traces
- ✅ **Security**: Helmet, CORS, bcrypt password hashing
- ✅ **Logging**: Morgan HTTP request logging (development mode)

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **Database**: MongoDB (Mongoose 8.0)
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Security**: bcrypt 5.1, helmet 7.1, cors 2.8
- **Language**: TypeScript 5.6

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or cloud)

## Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Required: MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/agentforge
MONGODB_TEST_URI=mongodb://localhost:27017/agentforge_test

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS (comma-separated origins)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**Security Notes:**
- Generate strong secrets: `openssl rand -base64 32`
- Never commit `.env` to version control
- In production, set `NODE_ENV=production`

## Development

```bash
# Start development server (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Run production server
npm start

# Type check only
npm run typecheck

# Lint code
npm run lint
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.ts        # MongoDB connection
│   │   └── env.ts       # Environment variables
│   ├── controllers/     # Request handlers
│   │   ├── authController.ts
│   │   ├── agentController.ts
│   │   ├── taskController.ts
│   │   └── teamController.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # JWT authentication
│   │   └── errorHandler.ts
│   ├── models/          # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Agent.ts
│   │   ├── Task.ts
│   │   └── Team.ts
│   ├── routes/          # API routes
│   │   ├── auth.ts
│   │   ├── agents.ts
│   │   ├── tasks.ts
│   │   └── teams.ts
│   ├── utils/           # Utility functions
│   │   └── jwt.ts
│   ├── app.ts           # Express app setup
│   └── index.ts         # Server entry point
├── docs/                # Documentation
│   └── API.md           # Complete API reference
├── .env.example         # Environment template
├── tsconfig.json        # TypeScript config
└── package.json
```

## API Endpoints

Base URL: `http://localhost:3001/api/v1`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile

### Agents
- `GET /agents` - Get all agents
- `GET /agents/:id` - Get single agent
- `POST /agents` - Create agent
- `PUT /agents/:id` - Update agent
- `DELETE /agents/:id` - Delete agent
- `PATCH /agents/:id/stats` - Update agent statistics

### Tasks
- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get single task
- `GET /tasks/stats` - Get task statistics
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/logs` - Add execution log entry

### Teams
- `GET /teams` - Get all teams
- `GET /teams/:id` - Get single team
- `POST /teams` - Create team
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team
- `POST /teams/:id/members` - Add team member
- `DELETE /teams/:id/members/:agentId` - Remove team member
- `PATCH /teams/:id/stats` - Update team statistics

**See [docs/API.md](./docs/API.md) for complete API documentation with examples.**

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","username":"testuser"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get agents (requires token)
curl http://localhost:3001/api/v1/agents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman/Insomnia

1. Import the collection from `docs/API.md`
2. Set base URL: `http://localhost:3001/api/v1`
3. For authenticated endpoints:
   - Add header: `Authorization: Bearer <your_token>`
   - Get token from login/register response

## Database Schema

### User
- email, password (bcrypt hashed), username
- Unique indexes on email and username

### Agent
- userId, name, aiModel, systemPrompt, temperature, maxTokens
- RPG attributes: level, experience
- Statistics: tasksCompleted, tokensUsed, totalUptime
- Status: idle, busy, error

### Task
- userId, agentId, title, description
- Status: pending, in_progress, completed, failed
- Priority: low, medium, high, urgent
- Execution: result, errorMessage, executionLog, tokensUsed, actualDuration

### Team
- userId, name, description, maxMembers
- Members: array of { agentId, agentName, role, joinedAt }
- Statistics: tasksCompleted, totalTokensUsed

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Access (7d) + Refresh (30d) tokens
- **CORS**: Configurable allowed origins
- **Helmet**: Security headers
- **Input Validation**: Mongoose schema validation
- **Error Handling**: No sensitive data in error responses (production)

## Deployment

### Local MongoDB

```bash
# Install MongoDB
brew install mongodb-community  # macOS
sudo apt install mongodb         # Ubuntu

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Ubuntu

# Verify
mongosh
```

### Cloud MongoDB (MongoDB Atlas)

1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `.env`: `MONGODB_URI=mongodb+srv://...`

### Production Deployment

```bash
# Build
npm run build

# Set environment
export NODE_ENV=production

# Start
npm start
```

**Production Checklist:**
- [ ] Set strong JWT secrets
- [ ] Configure production MongoDB URI
- [ ] Set proper CORS origins
- [ ] Enable HTTPS
- [ ] Configure process manager (PM2)
- [ ] Set up monitoring (logs, errors)

## Troubleshooting

### Cannot connect to MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service

### JWT errors
```
Error: secretOrPrivateKey must have a value
```
**Solution**: Set `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`

### TypeScript errors
```
Cannot find module 'express'
```
**Solution**: Run `npm install`

## Contributing

1. Follow existing code style
2. Write TypeScript with strict mode
3. Add JSDoc comments for public APIs
4. Test endpoints before committing
5. Update API documentation if adding/changing endpoints

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [github.com/yourusername/agentforge/issues](https://github.com/yourusername/agentforge/issues)
- Documentation: [docs/API.md](./docs/API.md)
