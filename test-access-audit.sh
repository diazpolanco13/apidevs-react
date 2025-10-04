#!/bin/bash

echo "🧪 Testing Access Audit Endpoints"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Test 1: Access Stats
echo -e "${YELLOW}📊 Test 1: GET /api/admin/access-stats${NC}"
echo "URL: ${BASE_URL}/api/admin/access-stats"
echo ""
curl -s "${BASE_URL}/api/admin/access-stats" | jq '.' || echo -e "${RED}❌ Failed${NC}"
echo ""
echo "-----------------------------------"
echo ""

# Test 2: Access Audit (first page)
echo -e "${YELLOW}📋 Test 2: GET /api/admin/access-audit (page 1, limit 10)${NC}"
echo "URL: ${BASE_URL}/api/admin/access-audit?page=1&limit=10"
echo ""
curl -s "${BASE_URL}/api/admin/access-audit?page=1&limit=10" | jq '.' || echo -e "${RED}❌ Failed${NC}"
echo ""
echo "-----------------------------------"
echo ""

# Test 3: Access Audit with filters (manual access source)
echo -e "${YELLOW}🔍 Test 3: GET /api/admin/access-audit (filter: access_source=manual)${NC}"
echo "URL: ${BASE_URL}/api/admin/access-audit?access_source=manual"
echo ""
curl -s "${BASE_URL}/api/admin/access-audit?access_source=manual" | jq '.records | length' || echo -e "${RED}❌ Failed${NC}"
echo ""
echo "-----------------------------------"
echo ""

# Test 4: Access Audit with filters (admin_bulk source)
echo -e "${YELLOW}🔍 Test 4: GET /api/admin/access-audit (filter: access_source=admin_bulk)${NC}"
echo "URL: ${BASE_URL}/api/admin/access-audit?access_source=admin_bulk"
echo ""
curl -s "${BASE_URL}/api/admin/access-audit?access_source=admin_bulk" | jq '.records | length' || echo -e "${RED}❌ Failed${NC}"
echo ""
echo "-----------------------------------"
echo ""

# Test 5: Access Audit with status filter
echo -e "${YELLOW}🔍 Test 5: GET /api/admin/access-audit (filter: status=active)${NC}"
echo "URL: ${BASE_URL}/api/admin/access-audit?status=active"
echo ""
curl -s "${BASE_URL}/api/admin/access-audit?status=active" | jq '.records | length' || echo -e "${RED}❌ Failed${NC}"
echo ""
echo "-----------------------------------"
echo ""

# Test 6: Access Audit with date range
TODAY=$(date -u +"%Y-%m-%d")
WEEK_AGO=$(date -u -d '7 days ago' +"%Y-%m-%d" 2>/dev/null || date -u -v-7d +"%Y-%m-%d")
echo -e "${YELLOW}📅 Test 6: GET /api/admin/access-audit (filter: last 7 days)${NC}"
echo "URL: ${BASE_URL}/api/admin/access-audit?date_from=${WEEK_AGO}&date_to=${TODAY}"
echo ""
curl -s "${BASE_URL}/api/admin/access-audit?date_from=${WEEK_AGO}&date_to=${TODAY}" | jq '.total' || echo -e "${RED}❌ Failed${NC}"
echo ""
echo "-----------------------------------"
echo ""

# Test 7: Access Audit - Check pagination info
echo -e "${YELLOW}📄 Test 7: Check pagination structure${NC}"
curl -s "${BASE_URL}/api/admin/access-audit?page=1&limit=5" | jq '{page: .page, limit: .limit, total: .total, totalPages: .totalPages, hasNextPage: .hasNextPage}' || echo -e "${RED}❌ Failed${NC}"
echo ""
echo "-----------------------------------"
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "💡 Tips:"
echo "  - Check that server is running: npm run dev"
echo "  - Make sure you're authenticated as api@apidevs.io"
echo "  - Install jq for pretty JSON: sudo apt install jq"

