#!/usr/bin/env python3

import sqlite3
import os

def run_migration():
    db_path = 'db.sql'
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if media_type column already exists
        cursor.execute("PRAGMA table_info(posts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'media_type' in columns:
            print("✅ media_type column already exists!")
            return
        
        # Add media_type column
        cursor.execute("ALTER TABLE posts ADD COLUMN media_type VARCHAR(100)")
        
        # Commit changes
        conn.commit()
        print("✅ Successfully added media_type column to posts table!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 Running migration to add media_type column...")
    run_migration() 