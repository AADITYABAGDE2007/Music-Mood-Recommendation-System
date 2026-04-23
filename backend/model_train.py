import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
import joblib

# Kaggle dataset load करो (encoding fix किया है)
df = pd.read_csv("spotify_dataset.csv", encoding="latin1")

print("Columns:", df.columns)  # verify columns

# सही features चुनो
X = df[["bpm", "energy_%", "valence_%", "danceability_%"]]

# Labels (mood) बनाओ — threshold logic से
def assign_mood(row):
    if row["valence_%"] > 60 and row["energy_%"] > 60:
        return "Happy"
    elif row["valence_%"] < 40 and row["energy_%"] < 40:
        return "Sad"
    elif row["bpm"] > 120 and row["energy_%"] > 70:
        return "Energetic"
    else:
        return "Calm"

df["mood"] = df.apply(assign_mood, axis=1)
y = df["mood"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train KNN model
model = KNeighborsClassifier(n_neighbors=5)
model.fit(X_train, y_train)

# Accuracy check
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))

# Save model

# model train करने के बाद
joblib.dump(model, "model.pkl")

print("✅ Model saved as model.pkl")
