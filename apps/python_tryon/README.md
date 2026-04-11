# JewelFit Ultimate Python Try-On

A professional-grade real-time jewelry try-on system powered by MediaPipe Holistic. Supports simultaneous tracking of multiple jewelry types with smooth physics.

## Features
- **5 Jewelry Types**: Necklace, Earrings, Rings, Nose Pins, Bracelets.
- **Simultaneous Tracking**: Wear all items at once.
- **Holistic AI**: Uses Face Mesh (468 points), Pose (33 points), and Hands (21 points) together.
- **Smoothing**: OneEuro Filter for jitter-free rendering.
- **Smart Scaling**: Jewelry resizes automatically based on your distance from the camera.

## Setup

1. **Install Dependencies**:
   ```bash
   pip install opencv-python mediapipe numpy
   ```

2. **Add Your Jewelry Assets**:
   Place transparent `.png` images in the corresponding folders:
   - `assets/necklaces/`
   - `assets/earrings/`
   - `assets/rings/`
   - `assets/nosepins/`
   - `assets/bracelets/`

   *Tip: Ensure images are cropped tightly to the jewelry.*

3. **Run**:
   ```bash
   python main.py
   ```

## Controls

| Key | Action |
| --- | --- |
| `1` | Toggle **Necklace** |
| `2` | Toggle **Earrings** |
| `3` | Toggle **Ring** |
| `4` | Toggle **Nose Pin** |
| `5` | Toggle **Bracelet** |
| `N` | Cycle Variations (Next Item) |
| `Q` | Quit |

## How It Works

- **Necklace**: Anchors to Shoulders (Pose) + Chin (Face). Rotates with chest.
- **Nose Pin**: Anchors to Nose Tip (Face). Follows head rotation.
- **Earrings**: Anchors to Ear Lobes (Face). Mirrors for both ears.
- **Ring**: Anchors to Finger Joints (Hand). Aligns with finger direction.
- **Bracelet**: Anchors to Wrist (Pose). Aligns with forearm vector.

## Troubleshooting

- **Lag?**: Ensure you are in a well-lit room. MediaPipe runs fastest with good lighting.
- **Not detecting?**: Move closer for Face/Hand tracking details.
- **Crash?**: Verify you have a webcam connected and `opencv-python` installed.
