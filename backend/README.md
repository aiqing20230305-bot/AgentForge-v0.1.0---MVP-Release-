# AgentForge Backend API

Backend API server for AgentForge - Gamified AI Agent Management Platform

## 🚀 Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js 4.18
- **Language:** TypeScript 5.3
- **Database:** MongoDB (Mongoose 8.0)
- **Real-time:** Socket.io 4.6
- **Authentication:** JWT (jsonwebtoken 9.0)
- **Security:** bcrypt, helmet, cors
- **Dev Tools:** ts-node-dev, ESLint, Prettier

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## 🔧 Configuration

### Environment Variables

Required variables (see `.env.example`):

```env
# Server
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/agentforge

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB (macOS)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 🛠️ Development

```bash
# Development mode (hot reload)
npm run dev

# Build TypeScript
npm run build

# Production mode
npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints (Planned)

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

#### Agents
- `GET /agents` - List agents
- `POST /agents` - Create agent
- `GET /agents/:id` - Get agent
- `PUT /agents/:id` - Update agent
- `DELETE /agents/:id` - Delete agent

#### Tasks
- `GET /tasks` - List tasks
- `POST /tasks` - Create task
- `GET /tasks/:id` - Get task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

#### Teams
- `GET /teams` - List teams
- `POST /teams` - Create team
- `GET /teams/:id` - Get team
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team

### WebSocket Events (Planned)

```javascript
// Client → Server
socket.emit('agent:update', { agentId, data })
socket.emit('task:update', { taskId, data })
socket.emit('team:join', { teamId })

// Server → Client
socket.on('agent:updated', (data) => {})
socket.on('task:updated', (data) => {})
socket.on('team:message', (data) => {})
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app setup
│   ├── config/
│   │   ├── db.ts             # MongoDB configuration
│   │   └── env.ts            # Environment variables
│   ├── models/
│   │   ├── User.ts           # User model
│   │   ├── Agent.ts          # Agent model
│   │   ├── Task.ts           # Task model
│   │   └── Team.ts           # Team model
│   ├── routes/
│   │   ├── auth.ts           # Auth routes
│   │   ├── agents.ts         # Agent routes
│   │   ├── tasks.ts          # Task routes
│   │   └── teams.ts          # Team routes
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── agentController.ts
│   │   └── taskController.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   └── errorHandler.ts  # Global error handler
│   ├── services/
│   │   └── socketService.ts # Socket.io service
│   └── utils/
│       ├── jwt.ts            # JWT utilities
│       └── validator.ts      # Validation utilities
├── dist/                     # Compiled JavaScript (gitignored)
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## 🔐 Security

- **JWT Authentication:** Token-based auth with refresh tokens
- **Password Hashing:** bcrypt with 12 rounds
- **CORS:** Configured for frontend origin
- **Helmet:** Security headers
- **Rate Limiting:** Prevent abuse (planned)
- **Input Validation:** express-validator

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test coverage
npm run test:coverage
```

## 📊 Database Schema

### User
```typescript
{
  _id: ObjectId
  email: string (unique)
  password: string (hashed)
  username: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}
```

### Agent
```typescript
{
  _id: ObjectId
  userId: ObjectId (ref: User)
  name: string
  level: number
  experience: number
  skills: ObjectId[] (ref: Skill)
  config: Object (agent configuration)
  stats: Object (performance stats)
  createdAt: Date
  updatedAt: Date
}
```

### Task
```typescript
{
  _id: ObjectId
  userId: ObjectId (ref: User)
  agentId?: ObjectId (ref: Agent)
  teamId?: ObjectId (ref: Team)
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Team
```typescript
{
  _id: ObjectId
  name: string
  ownerId: ObjectId (ref: User)
  members: ObjectId[] (ref: User)
  inviteCode: string (unique)
  createdAt: Date
  updatedAt: Date
}
```

## 🚢 Deployment

### Docker (Planned)

```bash
# Build image
docker build -t agentforge-backend .

# Run container
docker run -p 3000:3000 --env-file .env agentforge-backend
```

### Environment Variables (Production)

**Required:**
- `NODE_ENV=production`
- `MONGODB_URI=<production-mongodb-uri>`
- `JWT_SECRET=<strong-random-secret>`
- `JWT_REFRESH_SECRET=<strong-random-secret>`
- `CORS_ORIGIN=<production-frontend-url>`

## 📝 Development Status

### ✅ Completed (v1.1.0 Phase 1 - In Progress)
- [x] Project initialization
- [x] TypeScript configuration
- [x] Environment configuration
- [x] MongoDB connection setup
- [ ] Data models (User, Agent, Task, Team)
- [ ] Authentication system (register/login/JWT)
- [ ] RESTful API routes
- [ ] Socket.io real-time communication
- [ ] Error handling middleware
- [ ] API testing

### 🔜 Next Steps
1. Complete data models
2. Implement authentication system
3. Create CRUD routes for agents/tasks
4. Add Socket.io for real-time updates
5. Write API tests
6. Deploy to staging environment

## 📞 Support

For issues and questions:
- **Issues:** [GitHub Issues](https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-/issues)
- **Discussions:** [GitHub Discussions](https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-/discussions)

## 📄 License

MIT License - see [LICENSE](../LICENSE) file

---

**Part of AgentForge v1.1.0** - Online Collaboration Features
