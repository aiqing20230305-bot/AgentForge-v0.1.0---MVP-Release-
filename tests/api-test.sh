#!/bin/bash

# AgentForge v2.4.0 API测试脚本
# 自动测试所有Analytics API端点

API_BASE="${API_BASE:-http://localhost:5000/api}"
FAILED=0
PASSED=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AgentForge v2.4.0 API自动化测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "API Base: $API_BASE"
echo ""

# 测试函数
test_endpoint() {
  local name=$1
  local endpoint=$2
  local expected_status=${3:-200}

  echo -n "Testing $name... "

  response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint" 2>/dev/null)

  status_code=$(echo "$response" | tail -n 1)

  if [ "$status_code" = "$expected_status" ]; then
    echo "✅ PASS"
    ((PASSED++))

    # 检查响应是否为JSON
    body=$(echo "$response" | sed '$d')
    if echo "$body" | jq . >/dev/null 2>&1; then
      echo "   └─ Valid JSON response"
    else
      echo "   └─ ⚠️  Response is not valid JSON"
    fi
  else
    echo "❌ FAIL (expected $expected_status, got $status_code)"
    ((FAILED++))
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Phase 1: Analytics API Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Analytics API 测试
test_endpoint "Overview API" "/analytics/overview?timeRange=week"
test_endpoint "Agent Performance" "/analytics/agents/performance?limit=5"
test_endpoint "Task Completion" "/analytics/tasks/completion?timeRange=week"
test_endpoint "User Activity" "/analytics/users/activity?timeRange=week"
test_endpoint "Trends API" "/analytics/trends?metrics=agents,tasks"
test_endpoint "Custom Analytics" "/analytics/custom?metric=agents&timeRange=week"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Phase 1.3: Predictive Analytics Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint "Predictions API" "/analytics/predictions?metric=agents&futureDays=7"
test_endpoint "Anomalies API" "/analytics/anomalies?metric=tasks&threshold=2"
test_endpoint "Suggestions API" "/analytics/suggestions"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total Tests: $((PASSED + FAILED))"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
else
  echo "⚠️  Some tests failed"
  exit 1
fi
