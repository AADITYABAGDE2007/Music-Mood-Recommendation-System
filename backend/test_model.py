import joblib
import pandas as pd

# Load trained model
model = joblib.load("model.pkl")

# Example input
sample = pd.DataFrame([{
    "bpm": 130,
    "energy_%": 75,
    "valence_%": 65,
    "danceability_%": 80
}])

prediction = model.predict(sample)[0]
print("Predicted Mood:", prediction)
