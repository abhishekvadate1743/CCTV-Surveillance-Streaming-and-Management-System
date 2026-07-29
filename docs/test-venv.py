#!/usr/bin/env python
"""
Test virtual environment and all installed packages
"""

import sys
import platform

print("=" * 50)
print("CCTV Surveillance System - venv Test")
print("=" * 50)
print()

# Python version
print(f"Python Version: {sys.version}")
print(f"Python Executable: {sys.executable}")
print(f"Platform: {platform.platform()}")
print()

# Test imports
packages_to_test = [
    ("flask", "Flask"),
    ("flask_cors", "Flask-CORS"),
    ("socketio", "Socket.IO"),
    ("cv2", "OpenCV"),
    ("numpy", "NumPy"),
    ("PIL", "Pillow"),
    ("requests", "Requests"),
    ("dotenv", "python-dotenv"),
    ("pymongo", "PyMongo"),
    ("redis", "Redis"),
    ("celery", "Celery"),
    ("sklearn", "scikit-learn"),
    ("scipy", "SciPy"),
    ("pydantic", "Pydantic"),
]

print("Testing Package Imports:")
print("-" * 50)

success_count = 0
failed_packages = []

for package_import, package_name in packages_to_test:
    try:
        exec(f"import {package_import}")
        print(f"✓ {package_name:25} - OK")
        success_count += 1
    except ImportError as e:
        print(f"✗ {package_name:25} - FAILED: {str(e)}")
        failed_packages.append(package_name)

print()
print("=" * 50)
print(f"Summary: {success_count}/{len(packages_to_test)} packages loaded successfully")
print("=" * 50)

if failed_packages:
    print()
    print("Failed packages:")
    for pkg in failed_packages:
        print(f"  - {pkg}")
    sys.exit(1)
else:
    print()
    print("✓ All packages loaded successfully!")
    print("✓ Virtual environment is properly configured!")
    sys.exit(0)
