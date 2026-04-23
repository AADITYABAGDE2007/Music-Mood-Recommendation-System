import requests

url = "http://127.0.0.1:5000/predict"
data = {
    "bpm": 130,
    "energy_%": 75,
    "valence_%": 65,
    "danceability_%": 80
}

response = requests.post(url, json=data)
print(response.json())
