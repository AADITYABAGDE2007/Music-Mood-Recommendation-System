from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import random

import json
import os

app = Flask(__name__)
CORS(app)   # React + Flask connect करने के लिए

# Load trained model
model = joblib.load("model.pkl")

# Load dataset (backend folder में होना चाहिए)
df = pd.read_csv("spotify_dataset.csv", encoding="latin1")

# Load fetched rich songs data
if os.path.exists("songs_db.json"):
    with open("songs_db.json", "r") as f:
        curated_songs = json.load(f)
else:
    curated_songs = {
        "Happy": [],
        "Sad": [],
        "Energetic": [],
        "Calm": []
    }

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    bpm = data["bpm"]
    energy = data["energy_%"]
    valence = data["valence_%"]
    danceability = data["danceability_%"]

    prediction = model.predict([[bpm, energy, valence, danceability]])[0]
    return jsonify({"mood": prediction})

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    mood = data.get("mood", "Happy")
    
    songs = curated_songs.get(mood, curated_songs["Happy"])
    
    recommendations = []
    # Mix and shuffle 
    mood_songs = random.sample(songs, min(15, len(songs)))
    for s in mood_songs:
        s_copy = s.copy()
        s_copy["mood"] = mood
        recommendations.append(s_copy)
    
    random.shuffle(recommendations)
    return jsonify({"mood": mood, "songs": recommendations})

if __name__ == "__main__":
    app.run(debug=True)