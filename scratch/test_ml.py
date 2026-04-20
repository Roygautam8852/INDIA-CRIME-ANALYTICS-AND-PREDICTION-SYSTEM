import requests
import json

url = "http://localhost:5001/api/predict"
payload = {
    "Year": 2025,
    "State_UT_Name": "Maharashtra",
    "model": "random_forest",
    "IPC_Crimes": 180000,
    "SLL_Crimes": 50000
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
