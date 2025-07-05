#!/usr/bin/env python3
"""
Test script for Profile Data Management and Image Upload System
Tests all endpoints and features as specified in the requirements.
"""

import requests
import json
import os
import time

# Configuration
BASE_URL = "http://localhost:5000/api"
FRONTEND_URL = "http://localhost:5173"

def test_auth():
    """Test authentication endpoints"""
    print("🔐 Testing Authentication...")
    
    # Test signup
    signup_data = {
        "email": "testprofile@example.com",
        "username": "testprofile",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
    print(f"  Signup: {response.status_code} - {response.json()}")
    
    # Test login
    login_data = {
        "email": "testprofile@example.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"  Login: {response.status_code}")
    
    if response.status_code == 200:
        token = response.json()["token"]
        print(f"  ✅ Authentication successful, token received")
        return token
    else:
        print(f"  ❌ Authentication failed: {response.json()}")
        return None

def test_profile_endpoints(token):
    """Test profile data management endpoints"""
    print("\n👤 Testing Profile Endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test GET profile (should return 404 initially)
    response = requests.get(f"{BASE_URL}/profile/", headers=headers)
    print(f"  GET Profile (initial): {response.status_code} - {response.json()}")
    
    # Test PUT profile (create profile)
    profile_data = {
        "name": "John Doe",
        "title": "Software Developer",
        "bio": "A passionate developer with 5 years of experience",
        "location": "San Francisco, CA",
        "skills": ["Python", "JavaScript", "React", "Flask"],
        "contact": {
            "email": "john.doe@example.com",
            "phone": "+1-555-0123",
            "website": "https://johndoe.dev"
        },
        "social": [
            {"platform": "LinkedIn", "url": "https://linkedin.com/in/johndoe"},
            {"platform": "GitHub", "url": "https://github.com/johndoe"}
        ],
        "experience": [
            {
                "company": "Tech Corp",
                "title": "Senior Developer",
                "startDate": "2022-01-01",
                "endDate": "2024-01-01",
                "description": "Led development of web applications"
            }
        ],
        "education": [
            {
                "school": "University of Technology",
                "degree": "Bachelor of Science",
                "field": "Computer Science",
                "startDate": "2018-09-01",
                "endDate": "2022-05-01"
            }
        ]
    }
    
    response = requests.put(f"{BASE_URL}/profile/", headers=headers, json=profile_data)
    print(f"  PUT Profile (create): {response.status_code}")
    
    if response.status_code == 200:
        profile = response.json()
        print(f"  ✅ Profile created successfully")
        print(f"     Name: {profile['name']}")
        print(f"     Title: {profile['title']}")
        print(f"     Skills: {profile['skills']}")
    else:
        print(f"  ❌ Profile creation failed: {response.json()}")
        return False
    
    # Test GET profile (should return the created profile)
    response = requests.get(f"{BASE_URL}/profile/", headers=headers)
    print(f"  GET Profile (after create): {response.status_code}")
    
    if response.status_code == 200:
        profile = response.json()
        print(f"  ✅ Profile retrieved successfully")
        print(f"     Bio: {profile['bio']}")
        print(f"     Location: {profile['location']}")
    else:
        print(f"  ❌ Profile retrieval failed: {response.json()}")
        return False
    
    # Test PUT profile (update existing profile)
    update_data = {
        "title": "Senior Software Engineer",
        "bio": "Updated bio with more experience",
        "connections": 150,
        "mutualConnections": 45
    }
    
    response = requests.put(f"{BASE_URL}/profile/", headers=headers, json=update_data)
    print(f"  PUT Profile (update): {response.status_code}")
    
    if response.status_code == 200:
        profile = response.json()
        print(f"  ✅ Profile updated successfully")
        print(f"     New Title: {profile['title']}")
        print(f"     Connections: {profile['connections']}")
    else:
        print(f"  ❌ Profile update failed: {response.json()}")
        return False
    
    return True

def test_image_upload(token):
    """Test image upload functionality"""
    print("\n🖼️ Testing Image Upload...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a simple test image (1x1 pixel PNG)
    test_image_data = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
        b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00'
        b'\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00'
        b'\x00\x04\x00\x01\xf5\x27\xde\xfc\x00\x00\x00\x00IEND\xaeB`\x82'
    )
    
    # Save test image to file
    with open("test_image.png", "wb") as f:
        f.write(test_image_data)
    
    try:
        # Test image upload
        with open("test_image.png", "rb") as f:
            files = {"image": ("test_image.png", f, "image/png")}
            response = requests.post(f"{BASE_URL}/profile/image", headers=headers, files=files)
        
        print(f"  POST Image Upload: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"  ✅ Image uploaded successfully")
            print(f"     Image URL: {result['url']}")
            
            # Test image serving
            image_response = requests.get(f"{BASE_URL}{result['url']}", headers=headers)
            print(f"  GET Image Serve: {image_response.status_code}")
            
            if image_response.status_code == 200:
                print(f"  ✅ Image serving works correctly")
            else:
                print(f"  ❌ Image serving failed")
                return False
        else:
            print(f"  ❌ Image upload failed: {response.json()}")
            return False
            
    finally:
        # Clean up test file
        if os.path.exists("test_image.png"):
            os.remove("test_image.png")
    
    return True

def test_frontend():
    """Test frontend accessibility"""
    print("\n🌐 Testing Frontend...")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        print(f"  Frontend Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"  ✅ Frontend is accessible")
            return True
        else:
            print(f"  ❌ Frontend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Frontend not accessible: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Profile Data Management & Image Upload System Test")
    print("=" * 60)
    
    # Test authentication
    token = test_auth()
    if not token:
        print("\n❌ Authentication failed. Stopping tests.")
        return
    
    # Test profile endpoints
    profile_success = test_profile_endpoints(token)
    
    # Test image upload
    image_success = test_image_upload(token)
    
    # Test frontend
    frontend_success = test_frontend()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary:")
    print(f"  Authentication: ✅")
    print(f"  Profile Management: {'✅' if profile_success else '❌'}")
    print(f"  Image Upload: {'✅' if image_success else '❌'}")
    print(f"  Frontend: {'✅' if frontend_success else '❌'}")
    
    if all([profile_success, image_success, frontend_success]):
        print("\n🎉 All tests passed! Your profile management system is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main() 