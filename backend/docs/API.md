# AgentForge Backend API Documentation

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## Authentication Endpoints

### Register New User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": null,
      "createdAt": "2026-03-15T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": null,
      "createdAt": "2026-03-15T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Refresh Access Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Get Current User Profile
**GET** `/auth/me`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": null,
      "createdAt": "2026-03-15T10:00:00.000Z"
    }
  }
}
```

---

## Agent Endpoints

### Get All Agents
**GET** `/agents`

**Headers:** Requires authentication

**Query Parameters:**
- `status` (optional): Filter by status (`idle`, `busy`, `error`)
- `sortBy` (optional): Sort field (default: `createdAt`)
- `order` (optional): Sort order (`asc`, `desc`, default: `desc`)

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "name": "Research Agent",
      "aiModel": "gpt-4",
      "systemPrompt": "You are a research assistant.",
      "temperature": 0.7,
      "maxTokens": 2000,
      "status": "idle",
      "level": 5,
      "experience": 1250,
      "tasksCompleted": 42,
      "tokensUsed": 125000,
      "totalUptime": 3600,
      "avatar": null,
      "tags": ["research", "analysis"],
      "createdAt": "2026-03-15T10:00:00.000Z",
      "updatedAt": "2026-03-15T12:00:00.000Z"
    }
  ]
}
```

---

### Get Single Agent
**GET** `/agents/:id`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Research Agent",
    "aiModel": "gpt-4",
    "level": 5,
    "experience": 1250
    // ... other fields
  }
}
```

---

### Create New Agent
**POST** `/agents`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "name": "Research Agent",
  "aiModel": "gpt-4",
  "systemPrompt": "You are a research assistant.",
  "temperature": 0.7,
  "maxTokens": 2000,
  "avatar": "https://example.com/avatar.png",
  "tags": ["research", "analysis"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Agent created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Research Agent",
    "aiModel": "gpt-4",
    "status": "idle",
    "level": 1,
    "experience": 0
    // ... other fields
  }
}
```

---

### Update Agent
**PUT** `/agents/:id`

**Headers:** Requires authentication

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Agent Name",
  "aiModel": "claude-3-opus",
  "systemPrompt": "New prompt",
  "temperature": 0.8,
  "maxTokens": 3000,
  "status": "busy",
  "avatar": "https://example.com/new-avatar.png",
  "tags": ["updated", "tags"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Agent updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Updated Agent Name"
    // ... updated fields
  }
}
```

---

### Delete Agent
**DELETE** `/agents/:id`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "Agent deleted successfully"
}
```

---

### Update Agent Statistics
**PATCH** `/agents/:id/stats`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "experience": 100,
  "tasksCompleted": 1,
  "tokensUsed": 1500,
  "totalUptime": 300
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Agent statistics updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "level": 6,
    "experience": 350,
    "tasksCompleted": 43
    // ... updated fields
  }
}
```

**Note:** Experience is added incrementally and triggers automatic level-up when threshold is reached (1000 exp per level).

---

## Task Endpoints

### Get All Tasks
**GET** `/tasks`

**Headers:** Requires authentication

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `in_progress`, `completed`, `failed`)
- `priority` (optional): Filter by priority (`low`, `medium`, `high`, `urgent`)
- `agentId` (optional): Filter by agent ID
- `sortBy` (optional): Sort field (default: `createdAt`)
- `order` (optional): Sort order (`asc`, `desc`, default: `desc`)

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439012",
      "agentId": "507f1f77bcf86cd799439011",
      "title": "Analyze market trends",
      "description": "Research and analyze current market trends in AI",
      "status": "completed",
      "priority": "high",
      "result": "Market analysis complete. Key trends identified...",
      "errorMessage": null,
      "executionLog": ["Started analysis", "Completed research"],
      "estimatedDuration": 600,
      "actualDuration": 580,
      "tokensUsed": 1500,
      "retryCount": 0,
      "scheduledAt": null,
      "startedAt": "2026-03-15T10:00:00.000Z",
      "completedAt": "2026-03-15T10:10:00.000Z",
      "tags": ["research", "market"],
      "createdAt": "2026-03-15T09:50:00.000Z",
      "updatedAt": "2026-03-15T10:10:00.000Z"
    }
  ]
}
```

---

### Get Single Task
**GET** `/tasks/:id`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "title": "Analyze market trends",
    "status": "completed"
    // ... other fields
  }
}
```

---

### Create New Task
**POST** `/tasks`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "agentId": "507f1f77bcf86cd799439011",
  "title": "Analyze market trends",
  "description": "Research and analyze current market trends in AI",
  "priority": "high",
  "estimatedDuration": 600,
  "scheduledAt": "2026-03-15T14:00:00.000Z",
  "tags": ["research", "market"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439012",
    "agentId": "507f1f77bcf86cd799439011",
    "title": "Analyze market trends",
    "status": "pending",
    "priority": "high",
    "retryCount": 0
    // ... other fields
  }
}
```

---

### Update Task
**PUT** `/tasks/:id`

**Headers:** Requires authentication

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "urgent",
  "result": "Task result...",
  "errorMessage": "Error message if failed",
  "actualDuration": 580,
  "tokensUsed": 1500,
  "tags": ["updated", "tags"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "status": "in_progress",
    "startedAt": "2026-03-15T10:00:00.000Z"
    // ... updated fields
  }
}
```

**Note:** Status transitions automatically set timestamps (startedAt, completedAt).

---

### Delete Task
**DELETE** `/tasks/:id`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### Add Task Log Entry
**POST** `/tasks/:id/logs`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "logEntry": "[2026-03-15 10:05:00] Analysis in progress..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Log entry added successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "executionLog": [
      "[2026-03-15 10:00:00] Task started",
      "[2026-03-15 10:05:00] Analysis in progress..."
    ]
    // ... other fields
  }
}
```

---

### Get Task Statistics
**GET** `/tasks/stats`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTasks": 50,
    "byStatus": [
      {
        "_id": "completed",
        "count": 35,
        "totalTokens": 125000,
        "avgDuration": 580.5
      },
      {
        "_id": "pending",
        "count": 10,
        "totalTokens": 0,
        "avgDuration": null
      },
      {
        "_id": "in_progress",
        "count": 3,
        "totalTokens": 4500,
        "avgDuration": 300
      },
      {
        "_id": "failed",
        "count": 2,
        "totalTokens": 2000,
        "avgDuration": 120
      }
    ]
  }
}
```

---

## Team Endpoints

### Get All Teams
**GET** `/teams`

**Headers:** Requires authentication

**Query Parameters:**
- `isPublic` (optional): Filter by visibility (`true`, `false`)
- `sortBy` (optional): Sort field (default: `createdAt`)
- `order` (optional): Sort order (`asc`, `desc`, default: `desc`)

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439012",
      "name": "Research Team",
      "description": "Team for research-related tasks",
      "members": [
        {
          "agentId": "507f1f77bcf86cd799439011",
          "agentName": "Research Agent",
          "role": "leader",
          "joinedAt": "2026-03-15T10:00:00.000Z"
        }
      ],
      "tasksCompleted": 20,
      "totalTokensUsed": 50000,
      "isPublic": false,
      "maxMembers": 5,
      "tags": ["research", "analysis"],
      "createdAt": "2026-03-15T10:00:00.000Z",
      "updatedAt": "2026-03-15T12:00:00.000Z"
    }
  ]
}
```

---

### Get Single Team
**GET** `/teams/:id`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "name": "Research Team",
    "members": [...]
    // ... other fields
  }
}
```

---

### Create New Team
**POST** `/teams`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "name": "Research Team",
  "description": "Team for research-related tasks",
  "isPublic": false,
  "maxMembers": 5,
  "tags": ["research", "analysis"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Team created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Research Team",
    "members": [],
    "tasksCompleted": 0,
    "totalTokensUsed": 0,
    "isPublic": false,
    "maxMembers": 5
    // ... other fields
  }
}
```

---

### Update Team
**PUT** `/teams/:id`

**Headers:** Requires authentication

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Team Name",
  "description": "Updated description",
  "isPublic": true,
  "maxMembers": 10,
  "tags": ["updated", "tags"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Team updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "name": "Updated Team Name"
    // ... updated fields
  }
}
```

---

### Delete Team
**DELETE** `/teams/:id`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "Team deleted successfully"
}
```

---

### Add Team Member
**POST** `/teams/:id/members`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "agentId": "507f1f77bcf86cd799439011",
  "role": "member"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Member added to team successfully",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "members": [
      {
        "agentId": "507f1f77bcf86cd799439011",
        "agentName": "Research Agent",
        "role": "member",
        "joinedAt": "2026-03-15T12:00:00.000Z"
      }
    ]
    // ... other fields
  }
}
```

---

### Remove Team Member
**DELETE** `/teams/:id/members/:agentId`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "Member removed from team successfully",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "members": []
    // ... other fields
  }
}
```

---

### Update Team Statistics
**PATCH** `/teams/:id/stats`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "tasksCompleted": 1,
  "totalTokensUsed": 1500
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Team statistics updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "tasksCompleted": 21,
    "totalTokensUsed": 51500
    // ... other fields
  }
}
```

**Note:** Statistics are incremented, not replaced.

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `409` - Conflict (duplicate resources)
- `500` - Internal Server Error

### Example Error Response (400):
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

### Example Error Response (401):
```json
{
  "success": false,
  "message": "No token provided"
}
```

### Example Error Response (404):
```json
{
  "success": false,
  "message": "Agent not found"
}
```

---

## Development Mode

In development mode (`NODE_ENV=development`), error responses include stack traces:

```json
{
  "success": false,
  "message": "Validation error",
  "stack": "Error: Validation error\n    at ..."
}
```

---

## Health Check

**GET** `/health`

**No authentication required**

**Response (200):**
```json
{
  "success": true,
  "message": "AgentForge Backend is running",
  "timestamp": "2026-03-15T12:00:00.000Z",
  "environment": "development"
}
```

---

---

# 🚀 v2.3.0 New APIs

**Added in AgentForge v2.3.0 - Enterprise & Gamification Boost**

---

## Gamification System API 🎮

### Get User Gamification Profile
**GET** `/api/gamification/user/:userId`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439012",
    "level": 5,
    "xp": 1250,
    "xpToNextLevel": 750,
    "currency": {
      "coins": 450,
      "gems": 12,
      "tickets": 3
    },
    "achievements": [
      {
        "achievementId": "first_agent",
        "unlockedAt": "2026-03-15T10:00:00.000Z",
        "progress": 100
      }
    ],
    "stats": {
      "totalAgentsCreated": 15,
      "totalTasksCompleted": 150,
      "totalXPEarned": 6250,
      "currentStreak": 7,
      "maxStreak": 14
    }
  }
}
```

---

### Add XP to User
**POST** `/api/gamification/xp/add`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "amount": 100,
  "source": "task_completion"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "XP added successfully",
  "data": {
    "previousLevel": 5,
    "currentLevel": 5,
    "previousXP": 1250,
    "currentXP": 1350,
    "xpGained": 100,
    "leveledUp": false,
    "xpToNextLevel": 650
  }
}
```

---

### Unlock Achievement
**POST** `/api/gamification/achievements/unlock`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "achievementId": "first_agent"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Achievement unlocked!",
  "data": {
    "achievement": {
      "id": "first_agent",
      "name": "First Steps",
      "description": "Create your first Agent",
      "category": "basics",
      "rarity": "bronze",
      "reward": {
        "xp": 50,
        "coins": 100
      },
      "unlockedAt": "2026-03-18T10:00:00.000Z"
    },
    "rewards": {
      "xp": 50,
      "coins": 100
    }
  }
}
```

**Response (409):** If already unlocked
```json
{
  "success": false,
  "message": "Achievement already unlocked"
}
```

---

### Get All Achievements
**GET** `/api/gamification/achievements`

**Headers:** Requires authentication

**Query Parameters:**
- `category` (optional): Filter by category
- `rarity` (optional): Filter by rarity (bronze/silver/gold/platinum/diamond)
- `unlocked` (optional): Filter by unlock status (true/false)

**Response (200):**
```json
{
  "success": true,
  "count": 105,
  "data": [
    {
      "id": "first_agent",
      "name": "First Steps",
      "description": "Create your first Agent",
      "category": "basics",
      "rarity": "bronze",
      "reward": {
        "xp": 50,
        "coins": 100
      },
      "unlocked": true,
      "unlockedAt": "2026-03-18T10:00:00.000Z",
      "progress": 100
    }
  ]
}
```

---

### Add Currency
**POST** `/api/gamification/currency/add`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "currencyType": "coins",
  "amount": 50,
  "source": "task_reward"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Currency added successfully",
  "data": {
    "currencyType": "coins",
    "previousAmount": 450,
    "currentAmount": 500,
    "amountAdded": 50
  }
}
```

---

### Get Leaderboard
**GET** `/api/gamification/leaderboard`

**Headers:** Requires authentication

**Query Parameters:**
- `type`: Leaderboard type (global/team/friends/region)
- `metric`: Metric to rank by (xp/agents/tasks/achievements/streak)
- `period`: Time period (today/week/month/all)
- `limit` (optional): Number of entries (default: 50, max: 100)

**Response (200):**
```json
{
  "success": true,
  "type": "global",
  "metric": "xp",
  "period": "week",
  "updatedAt": "2026-03-18T10:00:00.000Z",
  "data": [
    {
      "rank": 1,
      "userId": "507f1f77bcf86cd799439012",
      "username": "johndoe",
      "avatar": "https://example.com/avatar.png",
      "value": 2500,
      "level": 10,
      "badge": "🥇"
    },
    {
      "rank": 2,
      "userId": "507f1f77bcf86cd799439013",
      "username": "janedoe",
      "avatar": null,
      "value": 2300,
      "level": 9,
      "badge": "🥈"
    }
  ],
  "myRank": {
    "rank": 15,
    "value": 1250
  }
}
```

---

### Get Daily Challenges
**GET** `/api/gamification/challenges/daily`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "refreshesAt": "2026-03-19T00:00:00.000Z",
  "data": [
    {
      "id": "daily_challenge_1",
      "title": "Create 3 Agents",
      "description": "Create 3 new agents today",
      "difficulty": "medium",
      "progress": {
        "current": 1,
        "target": 3
      },
      "reward": {
        "xp": 200,
        "coins": 150,
        "gems": 2
      },
      "completed": false
    }
  ]
}
```

---

### Complete Daily Challenge
**POST** `/api/gamification/challenges/daily/:challengeId/complete`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "Daily challenge completed!",
  "data": {
    "challengeId": "daily_challenge_1",
    "completedAt": "2026-03-18T15:30:00.000Z",
    "rewards": {
      "xp": 200,
      "coins": 150,
      "gems": 2
    }
  }
}
```

---

## Notification System API 🔔

### Get Notifications
**GET** `/api/notifications`

**Headers:** Requires authentication

**Query Parameters:**
- `filters` (optional): JSON string with filters
  - `type`: Array of types (system/agent/task/achievement/social/team)
  - `priority`: Array of priorities (low/medium/high/urgent)
  - `read`: Boolean (true/false)
  - `dateRange`: { start: ISO string, end: ISO string }
- `limit` (optional): Number of notifications (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `sortBy` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Example Request:**
```
GET /api/notifications?filters={"type":["system","agent"],"priority":["high"],"read":false}&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "total": 50,
  "unreadCount": 15,
  "count": 20,
  "data": [
    {
      "id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439012",
      "type": "achievement",
      "priority": "medium",
      "title": "Achievement Unlocked!",
      "message": "You've unlocked the 'First Steps' achievement",
      "icon": "🏆",
      "action": {
        "label": "View Achievement",
        "url": "/gamification/achievements/first_agent"
      },
      "read": false,
      "archivedAt": null,
      "createdAt": "2026-03-18T10:00:00.000Z",
      "updatedAt": "2026-03-18T10:00:00.000Z"
    }
  ]
}
```

---

### Get Single Notification
**GET** `/api/notifications/:id`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439015",
    "type": "achievement",
    "title": "Achievement Unlocked!",
    "message": "You've unlocked the 'First Steps' achievement",
    "read": false
  }
}
```

---

### Create Notification (System Only)
**POST** `/api/notifications`

**Headers:** Requires authentication + Admin role

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "type": "system",
  "priority": "high",
  "title": "System Update",
  "message": "AgentForge v2.3.0 has been released!",
  "icon": "🚀",
  "action": {
    "label": "Read More",
    "url": "/release-notes/v2.3.0"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439012",
    "type": "system",
    "priority": "high",
    "title": "System Update",
    "read": false,
    "createdAt": "2026-03-18T10:00:00.000Z"
  }
}
```

---

### Mark Notification as Read
**PATCH** `/api/notifications/:id/read`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "507f1f77bcf86cd799439015",
    "read": true,
    "readAt": "2026-03-18T11:00:00.000Z"
  }
}
```

---

### Mark All as Read
**POST** `/api/notifications/mark-all-read`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "updatedCount": 15
  }
}
```

---

### Batch Operations
**POST** `/api/notifications/batch`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "action": "markRead",
  "notificationIds": [
    "507f1f77bcf86cd799439015",
    "507f1f77bcf86cd799439016"
  ]
}
```

**Supported Actions:**
- `markRead` - Mark notifications as read
- `markUnread` - Mark notifications as unread
- `archive` - Archive notifications
- `delete` - Delete notifications

**Response (200):**
```json
{
  "success": true,
  "message": "Batch operation completed successfully",
  "data": {
    "action": "markRead",
    "processedCount": 2,
    "failedCount": 0
  }
}
```

---

### Export Notifications
**POST** `/api/notifications/export`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "format": "json",
  "filters": {
    "dateRange": {
      "start": "2026-03-01T00:00:00.000Z",
      "end": "2026-03-18T23:59:59.999Z"
    }
  }
}
```

**Supported Formats:** `json`, `csv`

**Response (200):** Download file

---

### Get Notification Preferences
**GET** `/api/notifications/preferences`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "channels": {
      "email": {
        "enabled": true,
        "frequency": "instant"
      },
      "push": {
        "enabled": true,
        "sound": true,
        "vibrate": true
      },
      "inApp": {
        "enabled": true,
        "toast": true,
        "badge": true
      }
    },
    "types": {
      "system": {
        "email": true,
        "push": true,
        "inApp": true
      },
      "agent": {
        "email": true,
        "push": true,
        "inApp": true
      },
      "task": {
        "email": true,
        "push": false,
        "inApp": true
      },
      "achievement": {
        "email": false,
        "push": true,
        "inApp": true
      },
      "social": {
        "email": false,
        "push": true,
        "inApp": true
      },
      "team": {
        "email": true,
        "push": true,
        "inApp": true
      }
    },
    "dnd": {
      "enabled": false,
      "startTime": "22:00",
      "endTime": "08:00",
      "allowUrgent": true
    }
  }
}
```

---

### Update Notification Preferences
**PUT** `/api/notifications/preferences`

**Headers:** Requires authentication

**Request Body:** (all fields optional, partial updates supported)
```json
{
  "channels": {
    "email": {
      "enabled": true,
      "frequency": "daily"
    },
    "push": {
      "enabled": false
    }
  },
  "types": {
    "achievement": {
      "email": false,
      "push": true,
      "inApp": true
    }
  },
  "dnd": {
    "enabled": true,
    "startTime": "23:00",
    "endTime": "07:00",
    "allowUrgent": true
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    // Updated preferences object
  }
}
```

---

## Report System API 📊

### Get Report Templates
**GET** `/api/reports/templates`

**Headers:** Requires authentication

**Query Parameters:**
- `category` (optional): Filter by category (agent/task/team/performance/analytics/gamification)
- `search` (optional): Search by name or description

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "agent_performance",
      "name": "Agent Performance Report",
      "description": "Analyze Agent execution performance and efficiency",
      "category": "agent",
      "icon": "🤖",
      "chartType": "bar",
      "fields": [
        { "name": "agentName", "type": "string", "label": "Agent Name" },
        { "name": "tasksCompleted", "type": "number", "label": "Tasks Completed" },
        { "name": "avgDuration", "type": "number", "label": "Avg Duration (s)" },
        { "name": "tokensUsed", "type": "number", "label": "Tokens Used" }
      ],
      "filters": [
        { "field": "status", "type": "select", "options": ["active", "inactive", "all"] },
        { "field": "dateRange", "type": "dateRange" }
      ],
      "aggregations": [
        { "field": "tasksCompleted", "function": "sum" },
        { "field": "avgDuration", "function": "avg" },
        { "field": "tokensUsed", "function": "sum" }
      ]
    }
  ]
}
```

---

### Get Single Report Template
**GET** `/api/reports/templates/:templateId`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "agent_performance",
    "name": "Agent Performance Report",
    "description": "Analyze Agent execution performance and efficiency",
    "category": "agent",
    "icon": "🤖",
    "chartType": "bar"
    // ... full template details
  }
}
```

---

### Generate Report
**POST** `/api/reports/generate`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "templateId": "agent_performance",
  "filters": {
    "status": "active",
    "dateRange": {
      "start": "2026-03-01T00:00:00.000Z",
      "end": "2026-03-18T23:59:59.999Z"
    }
  },
  "aggregations": ["sum", "avg"],
  "limit": 100
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reportId": "507f1f77bcf86cd799439020",
    "templateId": "agent_performance",
    "templateName": "Agent Performance Report",
    "icon": "🤖",
    "chartType": "bar",
    "generatedAt": "2026-03-18T10:00:00.000Z",
    "filters": {
      "status": "active",
      "dateRange": {
        "start": "2026-03-01T00:00:00.000Z",
        "end": "2026-03-18T23:59:59.999Z"
      }
    },
    "aggregations": {
      "tasksCompleted_sum": 150,
      "avgDuration_avg": 580.5,
      "tokensUsed_sum": 125000
    },
    "data": [
      {
        "agentName": "Research Agent",
        "tasksCompleted": 50,
        "avgDuration": 600,
        "tokensUsed": 50000
      },
      {
        "agentName": "Analysis Agent",
        "tasksCompleted": 100,
        "avgDuration": 570,
        "tokensUsed": 75000
      }
    ],
    "totalRecords": 2
  }
}
```

---

### Export Report
**POST** `/api/reports/export`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "reportId": "507f1f77bcf86cd799439020",
  "format": "csv"
}
```

**Supported Formats:** `csv`, `json`, `pdf`, `excel`

**Response (200):** Download file with appropriate Content-Type

---

### Get Report History
**GET** `/api/reports/history`

**Headers:** Requires authentication

**Query Parameters:**
- `userId` (optional): Filter by user (admin only)
- `templateId` (optional): Filter by template
- `limit` (optional): Number of reports (default: 20, max: 100)
- `offset` (optional): Pagination offset

**Response (200):**
```json
{
  "success": true,
  "total": 50,
  "count": 20,
  "data": [
    {
      "reportId": "507f1f77bcf86cd799439020",
      "templateId": "agent_performance",
      "templateName": "Agent Performance Report",
      "generatedAt": "2026-03-18T10:00:00.000Z",
      "recordCount": 2,
      "filters": {
        "status": "active",
        "dateRange": {
          "start": "2026-03-01T00:00:00.000Z",
          "end": "2026-03-18T23:59:59.999Z"
        }
      }
    }
  ]
}
```

---

### Delete Report
**DELETE** `/api/reports/:reportId`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

## SSO / OAuth2 Authentication API 🔐

### Get OAuth Authorization URL
**GET** `/api/auth/oauth/:provider/authorize`

**No authentication required**

**Supported Providers:** `google`, `github`

**Query Parameters:**
- `redirectUri` (optional): Custom redirect URI (must be whitelisted)
- `state` (optional): Custom state parameter

**Response (200):**
```json
{
  "success": true,
  "data": {
    "provider": "google",
    "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=...&state=...",
    "state": "random_state_string_for_security"
  }
}
```

---

### OAuth Callback Handler
**GET** `/api/auth/oauth/:provider/callback`

**No authentication required**

**Query Parameters:**
- `code`: Authorization code from OAuth provider
- `state`: State parameter for CSRF protection
- `error` (optional): Error code if authorization failed
- `error_description` (optional): Human-readable error description

**Success Response (302):** Redirects to frontend with tokens
```
Location: http://localhost:5173/auth/success?accessToken=...&refreshToken=...
```

**Error Response (302):** Redirects to frontend with error
```
Location: http://localhost:5173/auth/error?error=access_denied&error_description=User%20denied%20access
```

---

### Exchange Code for Tokens (Alternative)
**POST** `/api/auth/oauth/:provider/token`

**No authentication required**

**Request Body:**
```json
{
  "code": "authorization_code_from_provider",
  "state": "state_parameter",
  "redirectUri": "http://localhost:5173/auth/callback/google"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OAuth login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": "https://lh3.googleusercontent.com/...",
      "ssoProvider": "google",
      "ssoProfile": {
        "provider": "google",
        "providerId": "1234567890",
        "email": "user@example.com",
        "name": "John Doe",
        "avatar": "https://lh3.googleusercontent.com/..."
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Refresh OAuth Token
**POST** `/api/auth/oauth/refresh`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

---

### Revoke OAuth Token
**POST** `/api/auth/oauth/revoke`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token revoked successfully"
}
```

---

### Get OAuth User Info
**GET** `/api/auth/oauth/userinfo`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "data": {
    "provider": "google",
    "providerId": "1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://lh3.googleusercontent.com/...",
    "linkedAt": "2026-03-15T10:00:00.000Z"
  }
}
```

---

### Unlink SSO Account
**DELETE** `/api/auth/oauth/unlink/:provider`

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "message": "SSO account unlinked successfully"
}
```

**Note:** Users must have either a password or at least one SSO provider linked. Cannot unlink the last authentication method.

---

## WebSocket Events (Real-time) 🔄

v2.3.0 adds support for real-time notifications via WebSocket.

### Connect to WebSocket
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your_jwt_access_token'
  }
});
```

### Subscribe to Notifications
```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  // notification object follows the same structure as REST API
});
```

### Notification Event Payload
```json
{
  "id": "507f1f77bcf86cd799439015",
  "userId": "507f1f77bcf86cd799439012",
  "type": "achievement",
  "priority": "medium",
  "title": "Achievement Unlocked!",
  "message": "You've unlocked the 'First Steps' achievement",
  "icon": "🏆",
  "action": {
    "label": "View Achievement",
    "url": "/gamification/achievements/first_agent"
  },
  "read": false,
  "createdAt": "2026-03-18T10:00:00.000Z"
}
```

---

## Rate Limiting

v2.3.0 introduces rate limiting for all API endpoints:

**Default Limits:**
- Authentication endpoints: 5 requests / 15 minutes
- Standard endpoints: 100 requests / 15 minutes
- Report generation: 10 requests / 15 minutes
- Notification creation: 50 requests / 15 minutes

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1647604800
```

**429 Response (Rate Limit Exceeded):**
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "retryAfter": 300
}
```

---

## API Versioning

v2.3.0 maintains backward compatibility with v2.2.x APIs.

**Base URL remains:** `http://localhost:3001/api/v1`

All new v2.3.0 endpoints are added under the same `/api/v1` namespace.

---

## Changelog Summary

**v2.3.0 New Endpoints:**
- ✅ 12 Gamification endpoints
- ✅ 10 Notification endpoints
- ✅ 7 Report endpoints
- ✅ 6 SSO/OAuth2 endpoints
- ✅ WebSocket notification support
- ✅ Rate limiting on all endpoints

**Total Endpoints:** 80+ (35 v2.2.x + 35 v2.3.0 + 10 system)

---

**Last Updated:** 2026-03-18 (v2.3.0)
**API Version:** v1
**Documentation Version:** 2.0
