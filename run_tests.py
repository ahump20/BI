#!/usr/bin/env python3
"""
Test runner for Blaze Intelligence ingestion system
"""

import sys
import os
import unittest

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def run_tests():
    """Run all tests"""
    # Discover and run tests
    loader = unittest.TestLoader()
    
    # Load tests from tests directory
    test_dir = os.path.join(os.path.dirname(__file__), 'tests')
    if os.path.exists(test_dir):
        suite = loader.discover(test_dir, pattern='test_*.py')
    else:
        print("Tests directory not found, creating minimal test suite")
        suite = unittest.TestSuite()
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Return success/failure
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
