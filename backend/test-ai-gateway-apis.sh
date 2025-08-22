#!/bin/bash

# Script de test des APIs AI Gateway WikiPro
# Usage: ./test-ai-gateway-apis.sh [base_url]

BASE_URL=${1:-"http://localhost:3001"}

echo "=== TEST AI GATEWAY APIs ==="
echo "Base URL: $BASE_URL"
echo

# Test health check global
echo "1. Health Check Global"
curl -s "$BASE_URL/" | jq .
echo

# Test health check IA
echo "2. Health Check IA"
curl -s "$BASE_URL/api/ai/health" | jq .
echo

# Test summary IA
echo "3. Summary IA"
curl -s "$BASE_URL/api/ai/health/summary" | jq .
echo

# Test liste providers
echo "4. Liste Providers"
curl -s "$BASE_URL/api/ai/providers" | jq .
echo

# Test métriques
echo "5. Métriques"
curl -s "$BASE_URL/api/ai/metrics" | jq .
echo

# Test alertes
echo "6. Alertes"
curl -s "$BASE_URL/api/ai/alerts" | jq .
echo

# Test health check forcé
echo "7. Health Check Forcé"
curl -s "$BASE_URL/api/ai/health?force=true" | jq .
echo

echo "=== FIN DES TESTS ==="