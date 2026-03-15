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
