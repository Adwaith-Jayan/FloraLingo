from flask import Flask, jsonify
import cv2
import numpy as np
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from flask_cors import CORS
import threading
import time

app = Flask(__name__)
CORS(app)
current_volume = 50.0  # Initialize with default value

# Pycaw setup
devices = AudioUtilities.GetSpeakers()
interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
volume_control = cast(interface, POINTER(IAudioEndpointVolume))

def set_volume(vol):
    global current_volume
    vol = max(0.0, min(1.0, vol))  # Ensure volume is between 0 and 1
    volume_control.SetMasterVolumeLevelScalar(vol, None)
    current_volume = vol * 100  # Store as percentage

def camera_loop():
    global current_volume
    cap = cv2.VideoCapture(0)
    prev_vol = 0.5  # Start with 50%

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        avg_brightness = gray.mean()

        # --- Calibrate for your environment ---
        min_brightness = 20    # Very dark: lid nearly closed
        max_brightness = 120   # Very bright: lid fully open

        # Clamp brightness to safe range
        brightness = max(min_brightness, min(avg_brightness, max_brightness))

        # Normalize and reverse: darker -> louder
        normalized = (brightness - min_brightness) / (max_brightness - min_brightness)
        target_vol = 1.0 - normalized  # So darker = louder

        # Clamp between 10% and 100%
        target_vol = max(0.1, min(1.0, target_vol))

        # Smooth transition to avoid jumps
        smoothed_vol = 0.8 * prev_vol + 0.2 * target_vol

        # Apply and update
        set_volume(smoothed_vol)
        prev_vol = smoothed_vol

        time.sleep(0.1)  # Fast enough for smoothness, slow enough to avoid CPU load


@app.route('/get-volume')
def get_volume():
    return jsonify({
        'volume': float(current_volume),
        'status': 'success'
    })

if __name__ == '__main__':
    threading.Thread(target=camera_loop, daemon=True).start()
    app.run(port=5000)
