#!/usr/bin/env python3
"""
Example Python client for integrating with the SaaS license validation API.
This demonstrates how your Python .exe tool should validate licenses.
"""

import requests
import hashlib
import platform
import sys
import json
from typing import Dict, Optional, Tuple

class LicenseValidator:
    def __init__(self, api_base_url: str = "http://localhost:5000"):
        self.api_base_url = api_base_url.rstrip('/')
        self.validation_endpoint = f"{self.api_base_url}/api/validate-license"
    
    def get_hardware_hash(self) -> str:
        """
        Generate a unique hardware hash for license binding.
        This combines multiple system identifiers for better security.
        """
        # Get system information
        system_info = {
            'platform': platform.platform(),
            'processor': platform.processor(),
            'machine': platform.machine(),
            'node': platform.node(),
        }
        
        # Try to get additional hardware info (works on Windows/Linux)
        try:
            import uuid
            system_info['mac'] = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) 
                                         for elements in range(0,2*6,2)][::-1])
        except:
            pass
        
        # Create hash from system info
        info_string = json.dumps(system_info, sort_keys=True)
        hardware_hash = hashlib.sha256(info_string.encode()).hexdigest()
        
        return hardware_hash
    
    def validate_license(self, license_key: str) -> Tuple[bool, Dict]:
        """
        Validate license key with the SaaS backend.
        
        Args:
            license_key: The license key to validate
            
        Returns:
            Tuple of (is_valid, response_data)
        """
        hardware_hash = self.get_hardware_hash()
        
        payload = {
            "licenseKey": license_key,
            "hardwareHash": hardware_hash
        }
        
        try:
            response = requests.post(
                self.validation_endpoint,
                json=payload,
                timeout=10,
                headers={'Content-Type': 'application/json'}
            )
            
            data = response.json()
            
            if response.status_code == 200 and data.get('valid'):
                return True, {
                    'api_calls_left': data.get('apiCallsLeft', 0),
                    'days_remaining': data.get('daysRemaining'),
                    'message': 'License valid'
                }
            else:
                return False, {
                    'message': data.get('message', 'License validation failed'),
                    'error_code': response.status_code
                }
                
        except requests.exceptions.RequestException as e:
            return False, {
                'message': f'Network error: {str(e)}',
                'error_code': 'NETWORK_ERROR'
            }
        except json.JSONDecodeError:
            return False, {
                'message': 'Invalid response from server',
                'error_code': 'INVALID_RESPONSE'
            }

class AITool:
    """
    Example AI tool that requires license validation to function.
    """
    
    def __init__(self):
        self.validator = LicenseValidator()
        self.is_licensed = False
        self.license_info = {}
    
    def activate(self, license_key: str) -> bool:
        """
        Activate the tool with a license key.
        """
        print("Validating license...")
        
        is_valid, license_info = self.validator.validate_license(license_key)
        
        if is_valid:
            self.is_licensed = True
            self.license_info = license_info
            print("✓ License activated successfully!")
            print(f"  API calls remaining: {license_info.get('api_calls_left', 'Unknown')}")
            if license_info.get('days_remaining'):
                print(f"  License expires in: {license_info['days_remaining']} days")
            return True
        else:
            self.is_licensed = False
            print(f"✗ License validation failed: {license_info['message']}")
            return False
    
    def check_license_before_use(self) -> bool:
        """
        Check if the tool is properly licensed before each API call.
        """
        if not self.is_licensed:
            print("Error: Tool not activated. Please provide a valid license key.")
            return False
        
        if self.license_info.get('api_calls_left', 0) <= 0:
            print("Error: No API calls remaining. Please upgrade your plan.")
            return False
        
        return True
    
    def process_request(self, request_data: str) -> Optional[str]:
        """
        Example AI processing function that requires license validation.
        """
        if not self.check_license_before_use():
            return None
        
        # Simulate AI processing
        print(f"Processing: {request_data}")
        
        # In a real implementation, you would:
        # 1. Make the actual AI API call
        # 2. Process the response
        # 3. Return the result
        
        result = f"Processed result for: {request_data}"
        print(f"Result: {result}")
        
        # Update remaining calls (this would be handled by the backend in real usage)
        if 'api_calls_left' in self.license_info:
            self.license_info['api_calls_left'] -= 1
            print(f"API calls remaining: {self.license_info['api_calls_left']}")
        
        return result

def main():
    """
    Example usage of the AI tool with license validation.
    """
    print("AI Tool - SaaS License Integration Example")
    print("=" * 50)
    
    tool = AITool()
    
    # Get license key from user
    license_key = input("Enter your license key (or 'demo' for demo): ").strip()
    
    if license_key.lower() == 'demo':
        print("\nDemo Mode: Using a test license key...")
        license_key = "LIC-DEMO123456789ABC"  # This will fail validation
    
    # Try to activate the tool
    if tool.activate(license_key):
        print("\n" + "=" * 50)
        print("Tool activated! You can now use AI features.")
        print("=" * 50)
        
        # Example usage
        while True:
            user_input = input("\nEnter text to process (or 'quit' to exit): ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                break
            
            if user_input:
                result = tool.process_request(user_input)
                if result is None:
                    print("Processing failed due to license issues.")
                    break
    else:
        print("\n" + "=" * 50)
        print("Tool activation failed. Please check your license key.")
        print("=" * 50)
        print("\nTo get a valid license key:")
        print("1. Visit the SaaS platform website")
        print("2. Sign up for an account")
        print("3. Subscribe to a paid plan (Pro or Advanced)")
        print("4. Generate your license key from the dashboard")

if __name__ == "__main__":
    main()