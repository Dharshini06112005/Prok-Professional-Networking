#!/usr/bin/env python3

import webbrowser
import time
import requests
import json

def main():
    print("🚀 Quick Access to Your Posts!")
    print("=" * 40)
    
    # Check if servers are running
    try:
        backend_response = requests.get("http://localhost:5000/api/posts/categories", timeout=2)
        print("✅ Backend: Running on http://localhost:5000")
    except:
        print("❌ Backend: Not running")
        return
    
    try:
        frontend_response = requests.get("http://localhost:5173/", timeout=2)
        print("✅ Frontend: Running on http://localhost:5173")
    except:
        print("❌ Frontend: Not running")
        return
    
    print("\n📱 Quick Links:")
    print("1. Login/Register: http://localhost:5173/")
    print("2. Posts List: http://localhost:5173/posts")
    print("3. Create Post: http://localhost:5173/posts/create")
    print("4. Profile: http://localhost:5173/profile")
    
    print("\n🔧 To see your posted content:")
    print("1. Go to http://localhost:5173/")
    print("2. Login with your credentials")
    print("3. Navigate to 'Posts' in the menu")
    print("4. Click 'Refresh' button to see latest posts")
    print("5. Or click 'Create Post' to add more content")
    
    # Open the main page
    print("\n🌐 Opening your app in browser...")
    webbrowser.open("http://localhost:5173/")
    
    print("\n💡 Tips:")
    print("- After creating a post, you'll be automatically redirected to the posts list")
    print("- Use the 'Refresh' button to see new posts")
    print("- Use the search and filter options to find specific posts")
    print("- Posts are sorted by newest first by default")

if __name__ == "__main__":
    main() 