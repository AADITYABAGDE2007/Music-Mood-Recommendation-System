from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)   # React + Flask connect करने के लिए

# Load trained model
model = joblib.load("model.pkl")

# Load dataset (backend folder में होना चाहिए)
df = pd.read_csv("spotify_dataset.csv", encoding="latin1")

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
    mood = data["mood"]

    # Mood के हिसाब से filter logic
    if mood == "Happy":
        songs = df[df["valence_%"] > 70]["track_name"].head(5).tolist()
    elif mood == "Sad":
        songs = df[df["valence_%"] < 30]["track_name"].head(5).tolist()
    elif mood == "Energetic":
        songs = df[df["energy_%"] > 70]["track_name"].head(5).tolist()
    elif mood == "Calm":
        songs = df[df["energy_%"] < 40]["track_name"].head(5).tolist()
    else:
        songs = df["track_name"].head(5).tolist()

    return jsonify({"mood": mood, "songs": songs})

if __name__ == "__main__":
    app.run(debug=True)
