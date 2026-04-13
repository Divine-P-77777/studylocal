import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Path to the .env file in the backend directory
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)

def check_db():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DB_NAME", "test")
    
    print(f"Connecting to: {uri}")
    print(f"Database: {db_name}")
    
    try:
        client = MongoClient(uri)
        db = client[db_name]
        
        # List collections
        collections = db.list_collection_names()
        print(f"Collections: {collections}")
        
        for coll_name in ["Complaint", "complaints"]:
            if coll_name in collections:
                count = db[coll_name].count_documents({})
                print(f"Collection '{coll_name}' count: {count}")
                for doc in db[coll_name].find().limit(3):
                    # Clean up _id for printing
                    doc['_id'] = str(doc['_id'])
                    print(f"  Doc in {coll_name}: {doc}")
            else:
                print(f"Collection '{coll_name}' NOT found")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
