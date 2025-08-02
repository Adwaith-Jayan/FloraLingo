import React, { useRef, useState } from 'react';
import './ui.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function UI() {
    const videoRef = useRef(null);
    const [translation, setTranslation] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const navigate = useNavigate();

const handleSend = async () => {
  if (!userInput.trim()) return;

  const userMessage = { role: 'user', content: userInput };
  const newMessages = [...chatMessages, userMessage];

  try {
    const res = await axios.post('http://localhost:3000/groqchat', {
      messages: newMessages,
      plantTranslation: translation
    });

    const aiResponse = res.data.reply;
    const aiMessage = { role: 'assistant', content: aiResponse };

    setChatMessages([...newMessages, aiMessage]);
    setUserInput('');
  } catch (err) {
    console.error('Chat error:', err);
  }
};

  
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error starting camera:', error);
            setTranslation("Camera access failed. Try again.");
        }
    };

  
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result;

            try {
                setLoading(true);
                const res = await axios.post('http://localhost:3000/analyze', {
                    image: base64Image,
                });

                console.log('Server response:', res.data); 
                setTranslation(res.data); 
            } catch (error) {
                console.error('Upload error:', error);
                setTranslation("Couldn't understand your plant. Try again?");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };


    const captureAndSend = async () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:3000/analyze', {
                image: imageData,
            });

            console.log('Server response:', res.data);
            setTranslation(res.data);
        } catch (error) {
            console.error('Capture error:', error);
            setTranslation("Couldn't understand your plant. Try again?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <div className="header">
                <button 
                className="surprise-btn"
                onClick={() => navigate('/volume')}
            >
                <span role="img" aria-label="surprise">🎉</span> Surprise Me!
                </button>
                <h1>🌿 FloraLingo</h1>
                <p className="tagline">What's your plant whispering today? 🌸</p>
                <div className="floating-leaves">
                    <div className="leaf leaf1">🍃</div>
                    <div className="leaf leaf2">🌿</div>
                    <div className="leaf leaf3">🍀</div>
                </div>
            </div>

            <div className="main-content">
                <div className="camera-container">
                    <div className="video-frame">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="video-preview"
                        />
                        <div className="frame-decoration top-left">🌻</div>
                        <div className="frame-decoration top-right">🌼</div>
                        <div className="frame-decoration bottom-left">🌺</div>
                        <div className="frame-decoration bottom-right">🌸</div>
                    </div>
                    
                    <div className="controls">
                        <button className="btn camera-btn" onClick={startCamera}>
                            <span className="icon">📷</span> Start Camera
                            <span className="btn-hover-effect"></span>
                        </button>
                        <button className="btn translate-btn" onClick={captureAndSend}>
                            <span className="icon">🔍</span> Translate My Plant
                            <span className="btn-hover-effect"></span>
                        </button>
                        <label className="file-upload btn upload-btn">
                            <span className="icon">🖼️</span> Upload Image
                            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                            <span className="btn-hover-effect"></span>
                        </label>
                    </div>
                </div>

                <div className="result-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-plants">
                                <div className="plant plant1">🌱</div>
                                <div className="plant plant2">🌿</div>
                                <div className="plant plant3">🍃</div>
                            </div>
                            <p>Listening to plant whispers...</p>
                        </div>
                    ) : (
                        <>
                           {translation &&(
                                <div className="plant-speech-bubble">
                                    <div className="speech-bubble">
                                        <p><span className="plant-icon">🌵</span> <strong>Plant says:</strong> {translation}</p>
                                    </div>
                                </div>
                            )}

                            {translation && !translation.includes("I am no plant") && (
                                <div className="chat-container">
                                    <div className="chat-box">
                                        {chatMessages.map((msg, idx) => (
                                            <div key={idx} className={`chat-message ${msg.role}`}>
                                                <div className="message-bubble">
                                                    <span className="message-icon">
                                                        {msg.role === 'user' ? '👤' : '🌿'}
                                                    </span>
                                                    <span className="message-text">{msg.content}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="chat-input-container">
                                        <input
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            placeholder="Ask your plant a question..."
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        />
                                        <button className="send-btn" onClick={handleSend}>
                                            <span>Send</span>
                                            <span className="send-icon">✉️</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            <div className="footer">
                <p>Made with 💚 by plant lovers</p>
                <div className="footer-flowers">
                    <span>🌻</span>
                    <span>🌷</span>
                    <span>🌹</span>
                </div>
            </div>
        </div>
    );

}

export default UI;
