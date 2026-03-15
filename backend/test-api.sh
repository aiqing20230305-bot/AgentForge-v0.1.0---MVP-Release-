#!/bin/bash

# AgentForge Backend API Test Script
# Tests all major endpoints to verify functionality

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api/v1"

echo "🧪 AgentForge Backend API Test"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
  local name="$1"
  local method="$2"
  local url="$3"
  local data="$4"
  local expected_status="$5"
  local token="$6"

  echo -n "Testing: $name... "

  if [ -z "$token" ]; then
    RESPONSE=$(curl -s -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$data" \
      -w "\n%{http_code}")
  else
    RESPONSE=$(curl -s -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data" \
      -w "\n%{http_code}")
  fi

  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Status: $HTTP_CODE)"
    PASSED=$((PASSED + 1))
    return 0
  else
    echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $HTTP_CODE)"
    echo "Response: $BODY"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# 1. Health Check
echo "1️⃣  Health Check"
test_endpoint "Health endpoint" "GET" "$BASE_URL/health" "" "200"
echo ""

# 2. User Registration
echo "2️⃣  Authentication"
REGISTER_DATA='{"email":"test@example.com","password":"test123","username":"testuser"}'
test_endpoint "Register user" "POST" "$API_URL/auth/register" "$REGISTER_DATA" "201"

# Extract access token from registration
TOKEN=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"test123","username":"testuser2"}' \
  | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
  # Try login if registration fails (user might already exist)
  TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test2@example.com","password":"test123"}' \
    | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')
fi

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓${NC} Token obtained: ${TOKEN:0:20}..."
else
  echo -e "${RED}✗${NC} Failed to obtain token"
  echo "Remaining tests require authentication. Exiting."
  exit 1
fi

# Test login
LOGIN_DATA='{"email":"test2@example.com","password":"test123"}'
test_endpoint "Login user" "POST" "$API_URL/auth/login" "$LOGIN_DATA" "200"

# Test get current user
test_endpoint "Get current user" "GET" "$API_URL/auth/me" "" "200" "$TOKEN"
echo ""

# 3. Agent Operations
echo "3️⃣  Agent Management"
AGENT_DATA='{"name":"Test Agent","aiModel":"gpt-3.5-turbo","systemPrompt":"You are a test assistant","tags":["test"]}'
test_endpoint "Create agent" "POST" "$API_URL/agents" "$AGENT_DATA" "201" "$TOKEN"

# Get agent ID
AGENT_ID=$(curl -s -X POST "$API_URL/agents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$AGENT_DATA" \
  | grep -o '"id":"[^"]*' | grep -o '[^"]*$' | head -1)

if [ -n "$AGENT_ID" ]; then
  echo -e "${GREEN}✓${NC} Agent created: $AGENT_ID"

  test_endpoint "Get all agents" "GET" "$API_URL/agents" "" "200" "$TOKEN"
  test_endpoint "Get single agent" "GET" "$API_URL/agents/$AGENT_ID" "" "200" "$TOKEN"

  UPDATE_AGENT='{"name":"Updated Agent"}'
  test_endpoint "Update agent" "PUT" "$API_URL/agents/$AGENT_ID" "$UPDATE_AGENT" "200" "$TOKEN"

  STATS_UPDATE='{"experience":100,"tasksCompleted":1,"tokensUsed":1500}'
  test_endpoint "Update agent stats" "PATCH" "$API_URL/agents/$AGENT_ID/stats" "$STATS_UPDATE" "200" "$TOKEN"
else
  echo -e "${YELLOW}⚠${NC}  Could not get agent ID, skipping remaining agent tests"
fi
echo ""

# 4. Task Operations
echo "4️⃣  Task Management"
if [ -n "$AGENT_ID" ]; then
  TASK_DATA="{\"agentId\":\"$AGENT_ID\",\"title\":\"Test Task\",\"description\":\"A test task\",\"priority\":\"high\",\"tags\":[\"test\"]}"
  test_endpoint "Create task" "POST" "$API_URL/tasks" "$TASK_DATA" "201" "$TOKEN"

  # Get task ID
  TASK_ID=$(curl -s -X POST "$API_URL/tasks" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$TASK_DATA" \
    | grep -o '"id":"[^"]*' | grep -o '[^"]*$' | head -1)

  if [ -n "$TASK_ID" ]; then
    echo -e "${GREEN}✓${NC} Task created: $TASK_ID"

    test_endpoint "Get all tasks" "GET" "$API_URL/tasks" "" "200" "$TOKEN"
    test_endpoint "Get single task" "GET" "$API_URL/tasks/$TASK_ID" "" "200" "$TOKEN"
    test_endpoint "Get task stats" "GET" "$API_URL/tasks/stats" "" "200" "$TOKEN"

    UPDATE_TASK='{"status":"in_progress"}'
    test_endpoint "Update task" "PUT" "$API_URL/tasks/$TASK_ID" "$UPDATE_TASK" "200" "$TOKEN"

    LOG_DATA='{"logEntry":"[Test] Task started"}'
    test_endpoint "Add task log" "POST" "$API_URL/tasks/$TASK_ID/logs" "$LOG_DATA" "200" "$TOKEN"
  else
    echo -e "${YELLOW}⚠${NC}  Could not get task ID, skipping remaining task tests"
  fi
else
  echo -e "${YELLOW}⚠${NC}  No agent ID available, skipping task tests"
fi
echo ""

# 5. Team Operations
echo "5️⃣  Team Management"
TEAM_DATA='{"name":"Test Team","description":"A test team","maxMembers":5,"tags":["test"]}'
test_endpoint "Create team" "POST" "$API_URL/teams" "$TEAM_DATA" "201" "$TOKEN"

# Get team ID
TEAM_ID=$(curl -s -X POST "$API_URL/teams" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$TEAM_DATA" \
  | grep -o '"id":"[^"]*' | grep -o '[^"]*$' | head -1)

if [ -n "$TEAM_ID" ]; then
  echo -e "${GREEN}✓${NC} Team created: $TEAM_ID"

  test_endpoint "Get all teams" "GET" "$API_URL/teams" "" "200" "$TOKEN"
  test_endpoint "Get single team" "GET" "$API_URL/teams/$TEAM_ID" "" "200" "$TOKEN"

  UPDATE_TEAM='{"name":"Updated Team"}'
  test_endpoint "Update team" "PUT" "$API_URL/teams/$TEAM_ID" "$UPDATE_TEAM" "200" "$TOKEN"

  if [ -n "$AGENT_ID" ]; then
    MEMBER_DATA="{\"agentId\":\"$AGENT_ID\",\"role\":\"member\"}"
    test_endpoint "Add team member" "POST" "$API_URL/teams/$TEAM_ID/members" "$MEMBER_DATA" "200" "$TOKEN"

    STATS_DATA='{"tasksCompleted":1,"totalTokensUsed":1500}'
    test_endpoint "Update team stats" "PATCH" "$API_URL/teams/$TEAM_ID/stats" "$STATS_DATA" "200" "$TOKEN"
  fi
else
  echo -e "${YELLOW}⚠${NC}  Could not get team ID, skipping remaining team tests"
fi
echo ""

# 6. Socket.io Stats
echo "6️⃣  WebSocket"
test_endpoint "Get socket stats" "GET" "$API_URL/socket/stats" "" "200" "$TOKEN"
echo ""

# Summary
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
TOTAL=$((PASSED + FAILED))
echo "Total: $TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed.${NC}"
  exit 1
fi
