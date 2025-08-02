import { useEffect, useState } from "react";
import axios from "axios";
import "./vi.css";

function VI() {
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create floating particles
    const particles = Array.from({ length: 20 }).map((_, i) => {
      const size = Math.random() * 10 + 5;
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
      particle.style.opacity = Math.random() * 0.3 + 0.1;
      document.querySelector('.app-container').appendChild(particle);
      return particle;
    });

    const fetchVolume = () => {
      axios.get("http://localhost:5000/get-volume")
        .then(res => {
          const rawVol = res.data.volume;
          const vol = parseFloat(rawVol);

          if (!isNaN(vol)) {
            setVolume(Math.round(vol));
            setError(null);
            setIsLoading(false);
          } else {
            throw new Error("Invalid volume data");
          }
        })
        .catch(err => {
          console.error("API error:", err);
          setError("Unable to fetch volume");
          setIsLoading(false);
        });
    };

    const interval = setInterval(fetchVolume, 100);
    fetchVolume();
    
    return () => {
      clearInterval(interval);
      particles.forEach(p => p.remove());
    };
  }, []);

  // Calculate circular bar offset
  const circumference = 2 * Math.PI * 140;
  const offset = circumference - (volume / 100) * circumference;

  return (
    <div className="app-container">
      <h1 className="app-title">HINGE VOLUME</h1>
      
      <div className="volume-container">
        <svg className="circular-bar" viewBox="0 0 300 300">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6e45e2" />
              <stop offset="100%" stopColor="#ff7e5f" />
            </linearGradient>
          </defs>
          <circle
            className="circular-bar-bg"
            cx="150"
            cy="150"
            r="140"
          />
          <circle
            className="circular-bar-fill"
            cx="150"
            cy="150"
            r="140"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="volume-percent">{volume}%</div>
      </div>
      
      <div className="creative-bar">
        <div 
          className="creative-fill" 
          style={{ width: `${volume}%` }}
        />
      </div>
      
      {error ? (
        <div className="status-message error-message">{error}</div>
      ) : isLoading ? (
        <div className="status-message loading-message">
          Connecting
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      ) : (
        <div className="status-message"></div>
      )}
    </div>
  );
}

export default VI;