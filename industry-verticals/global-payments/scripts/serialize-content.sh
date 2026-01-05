#!/bin/bash

# Serialize Content Script for Global Payments
# This script serializes content items from Sitecore to YAML files

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Global Payments Content Serialization${NC}"
echo "=================================="
echo ""

# Get the repository root (assuming script is in global-payments/scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

# Check if Sitecore CLI is available
if ! command -v dotnet &> /dev/null; then
    echo -e "${RED}Error: dotnet CLI is not installed or not in PATH${NC}"
    exit 1
fi

# Check if sitecore CLI is available
if ! dotnet sitecore --version &> /dev/null; then
    echo -e "${RED}Error: Sitecore CLI is not installed${NC}"
    echo "Install it with: dotnet tool install -g Sitecore.CLI"
    exit 1
fi

echo -e "${YELLOW}Checking Sitecore connection...${NC}"
if ! dotnet sitecore login --help &> /dev/null; then
    echo -e "${RED}Error: Not connected to Sitecore${NC}"
    echo ""
    echo "To connect to Sitecore, run:"
    echo "  dotnet sitecore login"
    echo ""
    echo "For XM Cloud, use:"
    echo "  dotnet sitecore cloud login"
    exit 1
fi

echo -e "${GREEN}Connected to Sitecore${NC}"
echo ""

# Serialize global-payments module
echo -e "${YELLOW}Serializing Global Payments content...${NC}"
echo "This will pull all content items defined in global-payments.module.json"
echo ""

if dotnet sitecore ser pull --include global-payments; then
    echo ""
    echo -e "${GREEN}✓ Content serialization completed successfully!${NC}"
    echo ""
    echo "Serialized content is located at:"
    echo "  authoring/items/global-payments/items/"
    echo ""
    echo "To push content back to Sitecore, run:"
    echo "  dotnet sitecore ser push --include global-payments"
else
    echo ""
    echo -e "${RED}✗ Content serialization failed${NC}"
    exit 1
fi
