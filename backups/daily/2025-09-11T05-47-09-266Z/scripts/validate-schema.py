#!/usr/bin/env python3
import json
import sys
from jsonschema import validate, ValidationError

# Load schema
with open('./blaze-unified-schema.json', 'r') as f:
    schema = json.load(f)

# Validate test data
test_player = {
    "player_id": "TEST-TST-0001",
    "name": "Test Player",
    "sport": "MLB",
    "league": "MLB",
    "team_id": "MLB-TST",
    "position": "SS"
}

try:
    # Validate player structure
    validate(instance=test_player, schema=schema['definitions']['player'])
    print("✓ Schema validation passed")
    sys.exit(0)
except ValidationError as e:
    print(f"✗ Schema validation failed: {e.message}")
    sys.exit(1)
