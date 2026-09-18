"""Agent 3 Follow-up test suite runner."""
import os
import sys

# Add parent dir to path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from test_agent3 import TestAgent3Followup
import unittest

if __name__ == "__main__":
    unittest.main()
