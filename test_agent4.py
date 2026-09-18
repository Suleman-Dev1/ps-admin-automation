"""
Root runner for Agent 4 test suite.
Delegates to agent4_scheduling_summary/test_agent4.py.
"""

import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import unittest
from agent4_scheduling_summary.test_agent4 import *

if __name__ == "__main__":
    unittest.main()
