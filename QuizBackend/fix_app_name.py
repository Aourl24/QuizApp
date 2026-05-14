
# fix_app_name.py
# Run this to replace YOURAPP. with your actual Django app name

import json
import sys

YOUR_APP_NAME = "question"  # ← CHANGE THIS TO YOUR APP NAME
file = "exams/aws_exam_fixture_TEMPLATE.json"
with open(file, 'r') as f:
    data = json.load(f)

for item in data:
    item['model'] = item['model'].replace('YOURAPP.', f'{YOUR_APP_NAME}.')

output_name = f'exams/aws_exam_fixture_{YOUR_APP_NAME}.json'
with open(output_name, 'w') as f:
    json.dump(data, f, indent=2)

print(f"Created {output_name} with app name '{YOUR_APP_NAME}'")
