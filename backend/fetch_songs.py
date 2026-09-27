import requests
import json
import time
import urllib.parse

songs_to_fetch = {
    "Happy": [
        {"track_name": "Chaleya", "artist": "Arijit Singh"},
        {"track_name": "Gulabi Sadi", "artist": "Sanju Rathod"},
        {"track_name": "Nauvari", "artist": "Sanju Rathod"},
        {"track_name": "Jhoome Jo Pathaan", "artist": "Arijit Singh"},
        {"track_name": "What Jhumka?", "artist": "Arijit Singh"},
        {"track_name": "Maan Meri Jaan", "artist": "King"},
        {"track_name": "Dimple", "artist": "Sanju Rathod"}
    ],
    "Sad": [
        {"track_name": "Satranga", "artist": "Arijit Singh"},
        {"track_name": "O Maahi", "artist": "Arijit Singh"},
        {"track_name": "Pehle Bhi Main", "artist": "Vishal Mishra"},
        {"track_name": "Tum Kya Mile", "artist": "Arijit Singh"},
        {"track_name": "Ve Kamleya", "artist": "Arijit Singh"},
        {"track_name": "Bappa Wala Dance", "artist": "Sanju Rathod"}
    ],
    "Energetic": [
        {"track_name": "Arjan Vailly", "artist": "Bhupinder Babbal"},
        {"track_name": "Sher Khul Gaye", "artist": "Vishal Dadlani"},
        {"track_name": "Zinda Banda", "artist": "Anirudh Ravichander"},
        {"track_name": "Lutt Putt Gaya", "artist": "Arijit Singh"},
        {"track_name": "Naatu Naatu", "artist": "Rahul Sipligunj"},
        {"track_name": "Style Maarna", "artist": "Sanju Rathod"},
        {"track_name": "Taambdi Chaamdi", "artist": "Sanju Rathod"}
    ],
    "Calm": [
        {"track_name": "Apna Bana Le", "artist": "Arijit Singh"},
        {"track_name": "Tere Hawaale", "artist": "Arijit Singh"},
        {"track_name": "Heeriye", "artist": "Arijit Singh"},
        {"track_name": "Raabta", "artist": "Arijit Singh"},
        {"track_name": "Majha Bappa", "artist": "Sanju Rathod"}
    ]
}

verified_db = {"Happy": [], "Sad": [], "Energetic": [], "Calm": []}

for mood, songs in songs_to_fetch.items():
    print(f"Fetching {mood} songs...", flush=True)
    for song in songs:
        query = f"{song['track_name']} {song['artist']}"
        url = f"https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query={urllib.parse.quote(query)}"
        try:
            res = requests.get(url, timeout=10)
            data = res.json()
            if data.get('data') and data['data'].get('results') and len(data['data']['results']) > 0:
                track = data['data']['results'][0]
                
                # Extract highest quality download url and artwork
                preview_url = None
                if track.get('downloadUrl'):
                    preview_url = track['downloadUrl'][-1]['link']
                
                artwork_url = None
                if track.get('image'):
                    artwork_url = track['image'][-1]['link']
                
                if preview_url:
                    verified_db[mood].append({
                        "track_name": song['track_name'],
                        "artist": song['artist'],
                        "previewUrl": preview_url,
                        "artworkUrl": artwork_url,
                        "duration": 30000 # Default approx 30s
                    })
                    print(f"  [SUCCESS] {song['track_name']}", flush=True)
                else:
                    print(f"  [NO PREVIEW] {song['track_name']}", flush=True)
            else:
                print(f"  [NOT FOUND] {song['track_name']}", flush=True)
            
            time.sleep(1) # Be gentle to the API
        except Exception as e:
            print(f"  [ERROR] {song['track_name']}: {e}", flush=True)

with open('songs_db.json', 'w') as f:
    json.dump(verified_db, f, indent=4)

print("Saved to songs_db.json", flush=True)
