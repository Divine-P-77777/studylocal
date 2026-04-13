import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def check_db():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DB_NAME", "test")
    
    print(f"Connecting to: {uri}")
    print(f"Database: {db_name}")
    
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    # List collections
    collections = await db.list_collection_names()
    print(f"Collections: {collections}")
    
    if "Complaint" in collections:
        count = await db.Complaint.count_documents({})
        print(f"Complaint count: {count}")
        async for doc in db.Complaint.find().limit(5):
            print(f"Doc: {doc}")
    else:
        print("Complaint collection NOT found")

if __name__ == "__main__":
    asyncio.run(check_db())
