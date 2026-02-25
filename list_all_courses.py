import json

try:
    with open('./src/data/courses.json', 'r', encoding='utf-8') as f:
        courses = json.load(f)
        for c in courses:
            print(f"ID: {c.get('id')}, Title: {c.get('title')}")
except Exception as e:
    print(f"Error: {e}")
