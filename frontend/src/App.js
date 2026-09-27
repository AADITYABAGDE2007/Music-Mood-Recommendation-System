import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    bpm: "120",
    energy_: "80",
    valence_: "80",
    danceability_: "80"
  });
  const [mood, setMood] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Audio Player State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setRecommendations([]);
    setMood("");
    
    try {
      // Step 1: Predict Mood using ML model
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        bpm: parseInt(formData.bpm),
        "energy_%": parseInt(formData.energy_),
        "valence_%": parseInt(formData.valence_),
        "danceability_%": parseInt(formData.danceability_)
      });
      const predictedMood = response.data.mood;
      setMood(predictedMood);

      // Step 2: Get recommendations for that mood
      const recResponse = await axios.post("http://127.0.0.1:5000/recommend", {
        mood: predictedMood
      });
      
      const songs = recResponse.data.songs;
      
      // FILTER OUT songs that don't have an audio preview
      const playableSongs = songs.filter(song => song.previewUrl);
      
      setRecommendations(playableSongs);

    } catch (error) {
      console.error(error);
      setMood("Error connecting to backend");
    }
    setIsLoading(false);
  };

  const playTrack = (track) => {
    if (currentTrack && currentTrack.track_name === track.track_name) {
      togglePlay();
      return;
    }
    setProgress(0);
    if (track.previewUrl) {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.previewUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = 30; // iTunes previews are ~30s
      setProgress((current / total) * 100);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    // Find next track and play
    const currentIndex = recommendations.findIndex(t => t.track_name === currentTrack.track_name);
    if (currentIndex >= 0 && currentIndex < recommendations.length - 1) {
      const nextTrack = recommendations[currentIndex + 1];
      if (nextTrack.previewUrl) {
        playTrack(nextTrack);
      }
    }
  };

  return (
    <div className="min-h-screen app-bg-gradient pb-24 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-12 text-center animate-fade-in flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
            Moodify
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mb-6">
            Input your desired song metrics and let our AI predict the mood to generate the perfect playlist.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Controls Section */}
          <div className="md:col-span-1 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Tune Your Mood</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">BPM</label>
                  <input type="number" name="bpm" value={formData.bpm} onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Energy %</label>
                  <input type="number" name="energy_" value={formData.energy_} onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Valence %</label>
                  <input type="number" name="valence_" value={formData.valence_} onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Danceability %</label>
                  <input type="number" name="danceability_" value={formData.danceability_} onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 transition-colors" />
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="mt-6 w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-4 rounded-full transition-transform transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-green-500/30">
                {isLoading ? "Analyzing..." : "Generate Playlist"}
              </button>
            </form>

            {mood && (
              <div className="mt-6 glass-panel p-6 rounded-xl text-center animate-fade-in">
                <p className="text-sm text-gray-400 mb-1">Predicted Mood</p>
                <h3 className="text-2xl font-bold text-green-400">{mood}</h3>
              </div>
            )}
          </div>

          {/* Playlist Section */}
          <div className="md:col-span-2">
            {isLoading ? (
              <div className="h-full flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="animate-fade-in glass-panel p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Your Generated Playlist</h2>
                  </div>
                  <button onClick={() => playTrack(recommendations[0])} className="bg-green-500 hover:bg-green-400 text-black p-3 rounded-full shadow-lg shadow-green-500/30 transition-transform hover:scale-105">
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4.018 14L14.41 9 4.018 4v10z"></path></svg>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {recommendations.map((song, index) => (
                    <div 
                      key={index} 
                      onClick={() => playTrack(song)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/10 group ${currentTrack?.track_name === song.track_name ? 'bg-white/10' : ''}`}
                    >
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-800 rounded relative overflow-hidden flex items-center justify-center">
                        {song.artworkUrl ? (
                          <img src={song.artworkUrl} alt={song.track_name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path></svg>
                        )}
                        
                        <div className={`absolute inset-0 bg-black/50 items-center justify-center ${currentTrack?.track_name === song.track_name && isPlaying ? 'flex' : 'hidden group-hover:flex'}`}>
                           {currentTrack?.track_name === song.track_name && isPlaying ? (
                             <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"></path></svg>
                           ) : (
                             <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M4.018 14L14.41 9 4.018 4v10z"></path></svg>
                           )}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-grow truncate">
                        <p className={`font-medium truncate ${currentTrack?.track_name === song.track_name ? 'text-green-500' : 'text-white'}`}>{song.track_name}</p>
                        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                      </div>
                      
                      <div className="text-sm text-gray-500">0:30</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !isLoading && !mood && (
              <div className="h-full flex items-center justify-center text-gray-500 glass-panel rounded-xl p-12 border-dashed border-2 border-gray-700">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
                  <p>Tweak the parameters and hit generate<br/>to discover your mood's perfect soundtrack.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Music Player Bottom Bar */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-gray-800 p-3 px-6 flex items-center justify-between z-50 animate-fade-in shadow-2xl">
          <audio 
            ref={audioRef} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
          />
          
          <div className="flex items-center w-1/3 min-w-0">
             {currentTrack.artworkUrl ? (
                <img src={currentTrack.artworkUrl} alt="cover" className="w-14 h-14 rounded shadow-md" />
             ) : (
                <div className="w-14 h-14 bg-gray-800 rounded flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path></svg>
                </div>
             )}
             <div className="ml-4 truncate">
                <h4 className="text-white text-sm font-medium hover:underline cursor-pointer truncate">{currentTrack.track_name}</h4>
                <p className="text-gray-400 text-xs hover:underline cursor-pointer truncate">{currentTrack.artist}</p>
             </div>
          </div>

          <div className="flex flex-col items-center w-1/3">
             <div className="flex items-center space-x-6 mb-2">
                <button className="text-gray-400 hover:text-white transition-colors" onClick={() => {
                  const idx = recommendations.findIndex(t => t.track_name === currentTrack.track_name);
                  if (idx > 0) playTrack(recommendations[idx-1]);
                }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"></path></svg>
                </button>
                <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform">
                   {isPlaying ? (
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"></path></svg>
                   ) : (
                     <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.018 14L14.41 9 4.018 4v10z"></path></svg>
                   )}
                </button>
                <button className="text-gray-400 hover:text-white transition-colors" onClick={() => {
                  const idx = recommendations.findIndex(t => t.track_name === currentTrack.track_name);
                  if (idx < recommendations.length - 1) playTrack(recommendations[idx+1]);
                }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M11.555 14.832A1 1 0 0013 14v-2.798l5.445 3.63A1 1 0 0020 14V6a1 1 0 00-1.555-.832L13 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"></path></svg>
                </button>
             </div>
             <div className="w-full flex items-center space-x-2">
                <span className="text-xs text-gray-400 w-8 text-right">
                  {audioRef.current ? Math.floor(audioRef.current.currentTime) > 9 ? `0:${Math.floor(audioRef.current.currentTime)}` : `0:0${Math.floor(audioRef.current.currentTime)}` : "0:00"}
                </span>
                <div className="flex-grow h-1 bg-gray-600 rounded-full overflow-hidden">
                   <div className="h-full bg-white hover:bg-green-500 transition-colors" style={{width: `${progress}%`}}></div>
                </div>
                <span className="text-xs text-gray-400 w-8">0:30</span>
             </div>
          </div>

          <div className="flex items-center justify-end w-1/3">
             <button className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"></path></svg>
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
