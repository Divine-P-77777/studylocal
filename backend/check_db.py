from pymongo import MongoClient
from bson import ObjectId

client = MongoClient('mongodb+srv://dbStudyLocal:dbjbprea0928t4ghqgherog@dynamicphillic.n7b9d2x.mongodb.net/?appName=DynamicPhillic')
db = client.test

with open('db_check_result.txt', 'w') as f:
    f.write("--- Tutor Profile ---\n")
    tp = db.TutorProfile.find_one({"_id": ObjectId("69d1564cb04c4712656375b4")})
    if tp:
        f.write(f"ID: {tp.get('_id')}\n")
        f.write(f"Name: {tp.get('fullName')}\n")
        f.write(f"Email: {tp.get('contactInfo', {}).get('email')}\n")
        f.write(f"Auth0Id: {tp.get('auth0Id')}\n")
        f.write(f"Status: {tp.get('status')}\n")
    else:
        f.write("TutorProfile not found!\n")

    f.write("\n--- Active User in Session ---\n")
    for u in db.User.find({"auth0Id": "google-oauth2|115309879984282774935"}):
        f.write(f"User ID: {u.get('_id')} - Auth0Id: {u.get('auth0Id')} - Name: {u.get('fullName')} - Email: {u.get('email')}\n")

client.close()
