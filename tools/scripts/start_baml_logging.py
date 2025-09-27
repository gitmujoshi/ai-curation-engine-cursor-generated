#!/usr/bin/env python3
"""
BAML Logging Wrapper
===================
This script captures BAML's direct console output and saves it to logs/baml.log
"""

import sys
import os
import subprocess
import threading
import time
from datetime import datetime

def setup_baml_log_capture():
    """Setup log capture for BAML output"""
    
    # Ensure logs directory exists
    os.makedirs('logs', exist_ok=True)
    
    # Open BAML log file
    baml_log_file = open('logs/baml.log', 'a', buffering=1)
    
    def log_baml_output(process):
        """Capture and log BAML output"""
        for line in iter(process.stdout.readline, b''):
            line_str = line.decode('utf-8').strip()
            
            # Check if this looks like a BAML log line
            if any(indicator in line_str for indicator in ['[BAML', 'BAML WARN', 'BAML INFO', 'BAML ERROR']):
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                baml_log_file.write(f"{timestamp} - {line_str}\n")
                baml_log_file.flush()
            
            # Also print to console
            print(line_str)
    
    def log_baml_errors(process):
        """Capture BAML error output"""
        for line in iter(process.stderr.readline, b''):
            line_str = line.decode('utf-8').strip()
            
            # Check if this looks like a BAML log line
            if any(indicator in line_str for indicator in ['[BAML', 'BAML WARN', 'BAML INFO', 'BAML ERROR']):
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                baml_log_file.write(f"{timestamp} - ERROR - {line_str}\n")
                baml_log_file.flush()
            
            # Also print to console
            print(line_str, file=sys.stderr)
    
    return log_baml_output, log_baml_errors, baml_log_file

if __name__ == "__main__":
    # Start the demo frontend with BAML log capture
    print("🔍 Starting BAML log capture...")
    
    log_stdout, log_stderr, log_file = setup_baml_log_capture()
    
    try:
        # Start the demo frontend process
        process = subprocess.Popen(
            [sys.executable, "demo-frontend/app.js"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            bufsize=1,
            universal_newlines=False
        )
        
        # Start logging threads
        stdout_thread = threading.Thread(target=log_stdout, args=(process,))
        stderr_thread = threading.Thread(target=log_stderr, args=(process,))
        
        stdout_thread.daemon = True
        stderr_thread.daemon = True
        
        stdout_thread.start()
        stderr_thread.start()
        
        print("🚀 Demo frontend started with BAML logging")
        print("📝 BAML logs will be saved to logs/baml.log")
        
        # Wait for the process
        process.wait()
        
    except KeyboardInterrupt:
        print("\n🛑 Stopping demo frontend...")
        process.terminate()
        process.wait()
    finally:
        log_file.close()
        print("✅ BAML logging stopped")
