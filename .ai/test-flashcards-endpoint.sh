#!/bin/bash

# Test script for POST /api/flashcards endpoint
# Make sure the dev server is running: npm run dev

BASE_URL="http://localhost:4321"
ENDPOINT="${BASE_URL}/api/flashcards"

echo "🧪 Testing POST /api/flashcards endpoint"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Create manual flashcard (SUCCESS)
echo -e "${YELLOW}Test 1: Create manual flashcard (SUCCESS)${NC}"
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "What is REST?",
        "back": "A software architectural style for building APIs.",
        "source": "manual",
        "generation_id": null
      }
    ]
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 2: Empty flashcards array (VALIDATION ERROR)
echo -e "${YELLOW}Test 2: Empty flashcards array (VALIDATION ERROR)${NC}"
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": []
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 3: Missing generation_id for AI flashcard (VALIDATION ERROR)
echo -e "${YELLOW}Test 3: Missing generation_id for AI flashcard (VALIDATION ERROR)${NC}"
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "AI question",
        "back": "AI answer",
        "source": "ai-full",
        "generation_id": null
      }
    ]
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 4: Invalid generation_id (ERROR)
echo -e "${YELLOW}Test 4: Invalid generation_id (ERROR)${NC}"
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "AI question",
        "back": "AI answer",
        "source": "ai-full",
        "generation_id": 99999
      }
    ]
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 5: Front text too long (VALIDATION ERROR)
echo -e "${YELLOW}Test 5: Front text too long (VALIDATION ERROR)${NC}"
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "'"$(python3 -c "print('A' * 201)")"'",
        "back": "Answer",
        "source": "manual",
        "generation_id": null
      }
    ]
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 6: Invalid source value (VALIDATION ERROR)
echo -e "${YELLOW}Test 6: Invalid source value (VALIDATION ERROR)${NC}"
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "Question",
        "back": "Answer",
        "source": "invalid-source",
        "generation_id": null
      }
    ]
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Test 7: Bulk creation - 3 flashcards (SUCCESS)
echo -e "${YELLOW}Test 7: Bulk creation - 3 flashcards (SUCCESS)${NC}"
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "What is TypeScript?",
        "back": "A typed superset of JavaScript.",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "What is Astro?",
        "back": "A modern web framework for content-driven websites.",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "What is Supabase?",
        "back": "An open-source Firebase alternative.",
        "source": "manual",
        "generation_id": null
      }
    ]
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.'
echo ""
echo "---"
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "Note: To test AI flashcards with valid generation_id:"
echo "1. First create a generation via POST /api/generations"
echo "2. Use the returned generation.id in your flashcards"


