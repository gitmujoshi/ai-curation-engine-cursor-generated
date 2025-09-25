#!/usr/bin/env python3
"""
Demo Setup Test Script
=====================

Quick test to verify all components are properly integrated and ready for demo.
"""

import sys
import os
import subprocess
import requests
import time
from pathlib import Path

def print_status(message, status="info"):
    colors = {
        "info": "\033[0;34m[INFO]\033[0m",
        "success": "\033[0;32m[SUCCESS]\033[0m", 
        "warning": "\033[1;33m[WARNING]\033[0m",
        "error": "\033[0;31m[ERROR]\033[0m"
    }
    print(f"{colors.get(status, colors['info'])} {message}")

def check_file_exists(filepath, description):
    """Check if a required file exists."""
    if os.path.exists(filepath):
        print_status(f"✅ {description}: {filepath}", "success")
        return True
    else:
        print_status(f"❌ {description} missing: {filepath}", "error")
        return False

def check_command_exists(command):
    """Check if a command is available."""
    try:
        subprocess.run([command, "--version"], capture_output=True, check=True)
        print_status(f"✅ {command} is available", "success")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_status(f"❌ {command} not found", "error")
        return False

def test_python_imports():
    """Test if required Python modules can be imported."""
    modules = [
        ("flask", "Flask"),
        ("requests", "HTTP requests"), 
        ("pymongo", "MongoDB driver"),
        ("bcrypt", "Password hashing"),
        ("jwt", "JWT tokens")
    ]
    
    success = True
    for module, description in modules:
        try:
            __import__(module)
            print_status(f"✅ {description} ({module}) available", "success")
        except ImportError:
            print_status(f"❌ {description} ({module}) not available", "error")
            success = False
    
    return success

def test_baml_integration():
    """Test BAML integration."""
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        from BAML_Integration_Implementation import BAMLContentAnalyzer
        print_status("✅ BAML integration module importable", "success")
        return True
    except ImportError as e:
        print_status(f"⚠️ BAML integration not available: {e}", "warning")
        print_status("   Demo will use fallback mock classification", "info")
        return False

def check_demo_structure():
    """Check if all demo files are in place."""
    files_to_check = [
        ("run_complete_demo.sh", "Main demo script"),
        ("integrated-backend/server.js", "Backend server"),
        ("integrated-backend/package.json", "Backend package config"),
        ("demo-frontend/app.js", "Demo frontend"),
        ("baml_src/content_classification.baml", "BAML functions"),
        ("baml_src/llama_content_classification.baml", "Llama BAML functions"),
        ("DEMO_GUIDE.md", "Demo guide"),
        ("LOCAL_DEPLOYMENT_GUIDE.md", "Deployment guide"),
        ("enhanced-child-profile-setup.jsx", "Enhanced UI component")
    ]
    
    all_present = True
    for filepath, description in files_to_check:
        if not check_file_exists(filepath, description):
            all_present = False
    
    return all_present

def check_prerequisites():
    """Check system prerequisites."""
    commands = ["python3", "node", "npm"]
    optional_commands = ["mongod", "ollama"]
    
    success = True
    for cmd in commands:
        if not check_command_exists(cmd):
            success = False
    
    print_status("Checking optional commands:", "info")
    for cmd in optional_commands:
        check_command_exists(cmd)
    
    return success

def test_api_endpoints():
    """Test if demo can make API calls."""
    print_status("Testing API endpoint structure...", "info")
    
    # This just tests the demo frontend structure
    try:
        sys.path.insert(0, str(Path(__file__).parent / "demo-frontend"))
        # Just test the file can be loaded
        with open("demo-frontend/app.js", "r") as f:
            content = f.read()
            if "def classify_content" in content and "/api/classify" in content:
                print_status("✅ API endpoint structure looks correct", "success")
                return True
    except Exception as e:
        print_status(f"❌ API structure test failed: {e}", "error")
    
    return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("🧪 AI Curation Engine Demo Setup Test")
    print("=" * 60)
    print()
    
    tests = [
        ("Prerequisites", check_prerequisites),
        ("File Structure", check_demo_structure),
        ("Python Modules", test_python_imports),
        ("BAML Integration", test_baml_integration),
        ("API Structure", test_api_endpoints)
    ]
    
    results = {}
    for test_name, test_func in tests:
        print_status(f"Running {test_name} test...", "info")
        results[test_name] = test_func()
        print()
    
    # Summary
    print("=" * 60)
    print("📋 Test Results Summary")
    print("=" * 60)
    
    passed = 0
    total = len(tests)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20} {status}")
        if result:
            passed += 1
    
    print()
    print(f"Tests Passed: {passed}/{total}")
    
    if passed == total:
        print_status("🎉 All tests passed! Demo is ready to run.", "success")
        print()
        print("Next steps:")
        print("1. Run: ./run_complete_demo.sh")
        print("2. Open: http://localhost:5000")
        print("3. Follow: DEMO_GUIDE.md")
        return True
    else:
        print_status("⚠️ Some tests failed. Check the issues above.", "warning")
        print()
        print("Solutions:")
        if not results.get("Prerequisites"):
            print("• Install missing prerequisites (see LOCAL_DEPLOYMENT_GUIDE.md)")
        if not results.get("Python Modules"):
            print("• Run: pip install flask requests pymongo bcrypt pyjwt")
        if not results.get("BAML Integration"):
            print("• BAML will use fallback mode (this is okay for demo)")
        print("• You can still run the demo with some limitations")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
