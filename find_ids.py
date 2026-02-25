import json
import re

try:
    with open('./src/data/courses.json', 'r', encoding='utf-8') as f:
        for line in f:
            if re.match(r'^\s{4}"id":', line):
                print(line.strip())
except Exception as e:
    print(f"Error: {e}")
