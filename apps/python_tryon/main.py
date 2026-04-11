import cv2
import mediapipe as mp
import numpy as np
import os
import math
import time

# ==========================================
# SMOOTHING FILTER (One Euro Filter)
# ==========================================
class OneEuroFilter:
    def __init__(self, t0, x0, dx0=0.0, min_cutoff=1.0, beta=0.0, d_cutoff=1.0):
        self.t_prev = t0
        self.x_prev = float(x0)
        self.dx_prev = float(dx0)
        self.min_cutoff = min_cutoff
        self.beta = beta
        self.d_cutoff = d_cutoff

    def smoothing_factor(self, t_e, cutoff):
        r = 2 * math.pi * cutoff * t_e
        return r / (r + 1)

    def exponential_smoothing(self, a, x, x_prev):
        return a * x + (1 - a) * x_prev

    def __call__(self, t, x):
        t_e = t - self.t_prev
        if t_e <= 0: return self.x_prev

        dx = (x - self.x_prev) / t_e
        a_d = self.smoothing_factor(t_e, self.d_cutoff)
        dx_hat = self.exponential_smoothing(a_d, dx, self.dx_prev)

        cutoff = self.min_cutoff + self.beta * abs(dx_hat)
        a = self.smoothing_factor(t_e, cutoff)
        
        x_hat = self.exponential_smoothing(a, x, self.x_prev)
        
        self.x_prev = x_hat
        self.dx_prev = dx_hat
        self.t_prev = t
        return x_hat

# ==========================================
# ASSET MANAGER
# ==========================================
class AssetManager:
    def __init__(self, base_path):
        self.assets = {
            'necklace': self.load_category(base_path, 'necklaces'),
            'earring': self.load_category(base_path, 'earrings'),
            'ring': self.load_category(base_path, 'rings'),
            'nosepin': self.load_category(base_path, 'nosepins'),
            'bracelet': self.load_category(base_path, 'bracelets'),
        }
        self.active_indices = {k: 0 for k in self.assets}
        self.active_states = {k: False for k in self.assets} # Toggle states

    def load_category(self, base, folder):
        path = os.path.join(base, 'assets', folder)
        images = []
        if os.path.exists(path):
            for f in sorted(os.listdir(path)):
                if f.lower().endswith('.png'):
                    img = cv2.imread(os.path.join(path, f), cv2.IMREAD_UNCHANGED)
                    if img is not None: images.append(img)
        return images

    def get_current(self, category):
        if not self.active_states[category]: return None
        items = self.assets[category]
        if not items: return None
        idx = self.active_indices[category] % len(items)
        return items[idx]

    def toggle(self, category):
        self.active_states[category] = not self.active_states[category]
    
    def next_item(self, category):
        if self.active_states[category]:
            self.active_indices[category] += 1

# ==========================================
# MAIN APP
# ==========================================
class UltimateJewelryTryOn:
    def __init__(self):
        self.mp_holistic = mp.solutions.holistic
        self.holistic = self.mp_holistic.Holistic(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
            refine_face_landmarks=True
        )
        self.assets = AssetManager(os.path.dirname(__file__))
        self.filters = {} # Map key -> OneEuroFilter instance
        self.start_time = time.time()

    def get_smooth_val(self, key, val, t):
        if key not in self.filters:
            self.filters[key] = OneEuroFilter(t, val, min_cutoff=0.01, beta=0.1) # Tuned for smoothness
        return self.filters[key](t, val)

    def overlay_image(self, bg, overlay, x, y, w, h, angle):
        if overlay is None or w <= 0 or h <= 0: return bg
        
        # 1. Resize
        try:
            resized = cv2.resize(overlay, (w, h), interpolation=cv2.INTER_AREA)
        except: return bg

        # 2. Rotate
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, -math.degrees(angle), 1.0) # Negative for correct system
        cos, sin = abs(M[0, 0]), abs(M[0, 1])
        nw = int((h * sin) + (w * cos))
        nh = int((h * cos) + (w * sin))
        M[0, 2] += (nw / 2) - center[0]
        M[1, 2] += (nh / 2) - center[1]
        
        warped = cv2.warpAffine(resized, M, (nw, nh))

        # 3. Blend
        y1, y2 = y - nh // 2, y + nh // 2
        x1, x2 = x - nw // 2, x + nw // 2

        # Clipping
        h_bg, w_bg = bg.shape[:2]
        if y1 < 0: y1 = 0
        if y2 > h_bg: y2 = h_bg
        if x1 < 0: x1 = 0
        if x2 > w_bg: x2 = w_bg

        # ROI logic correction
        # We need to crop the warped image correspondingly if we clipped the ROI
        # Center of warped image was at (x,y).
        # Top-left of unclipped placement was (x - nw//2, y - nh//2)
        
        # Calculate offsets into the overlay image
        oy1 = y1 - (y - nh // 2)
        oy2 = oy1 + (y2 - y1)
        ox1 = x1 - (x - nw // 2)
        ox2 = ox1 + (x2 - x1)

        if oy1 < 0 or ox1 < 0 or oy2 > nh or ox2 > nw: return bg
        if (y2-y1) <= 0 or (x2-x1) <= 0: return bg

        roi = bg[int(y1):int(y2), int(x1):int(x2)]
        ov_crop = warped[int(oy1):int(oy2), int(ox1):int(ox2)]

        if ov_crop.shape[2] == 4:
            alpha = ov_crop[:, :, 3] / 255.0
            for c in range(3):
                roi[:, :, c] = alpha * ov_crop[:, :, c] + (1 - alpha) * roi[:, :, c]
            bg[int(y1):int(y2), int(x1):int(x2)] = roi

        return bg

    def process(self):
        cap = cv2.VideoCapture(0)
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            
            # Preprocessing
            frame = cv2.flip(frame, 1)
            h, w = frame.shape[:2]
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.holistic.process(rgb)
            t = time.time()

            # 1. Necklace (Shoulders)
            neck_img = self.assets.get_current('necklace')
            if neck_img is not None and results.pose_landmarks:
                lm11 = results.pose_landmarks.landmark[11] # L Shoulder
                lm12 = results.pose_landmarks.landmark[12] # R Shoulder
                
                # Position
                px = (lm11.x + lm12.x) * w / 2
                py = (lm11.y + lm12.y) * h / 2
                # Improve Y based on Chin if available
                if results.face_landmarks:
                     chin = results.face_landmarks.landmark[152]
                     py = (py + chin.y * h) / 2 + (h * 0.05) # Weighted towards chin
                
                # Scale & Rotation
                dist = math.hypot((lm12.x - lm11.x)*w, (lm12.y - lm11.y)*h)
                scale = dist * 2.0 / neck_img.shape[1]
                angle = math.atan2(lm12.y - lm11.y, lm12.x - lm11.x)
                
                # Smooth
                sx = self.get_smooth_val('n_x', px, t)
                sy = self.get_smooth_val('n_y', py, t)
                ss = self.get_smooth_val('n_s', scale, t)
                sa = self.get_smooth_val('n_a', angle, t) # necklace is horizontal
                
                self.overlay_image(frame, neck_img, int(sx), int(sy), int(neck_img.shape[1]*ss), int(neck_img.shape[0]*ss), sa)

            # 2. Nose Pin (Nose Tip)
            nose_img = self.assets.get_current('nosepin')
            if nose_img is not None and results.face_landmarks:
                nose = results.face_landmarks.landmark[4] # Tip of nose
                left = results.face_landmarks.landmark[234]
                right = results.face_landmarks.landmark[454]
                
                px, py = nose.x * w, nose.y * h
                
                # Scale based on face width
                face_w = math.hypot((right.x - left.x)*w, (right.y - left.y)*h)
                scale = face_w * 0.15 / nose_img.shape[1]
                
                # Rotation based on face tilt
                angle = math.atan2(right.y - left.y, right.x - left.x)
                
                sx = self.get_smooth_val('np_x', px, t)
                sy = self.get_smooth_val('np_y', py, t)
                ss = self.get_smooth_val('np_s', scale, t)
                sa = self.get_smooth_val('np_a', angle, t)

                self.overlay_image(frame, nose_img, int(sx), int(sy), int(nose_img.shape[1]*ss), int(nose_img.shape[0]*ss), sa)

            # 3. Earrings
            ear_img = self.assets.get_current('earring')
            if ear_img is not None and results.face_landmarks:
                # Left Ear (Lobe approx 177)
                l_ear = results.face_landmarks.landmark[177]
                r_ear = results.face_landmarks.landmark[401]
                
                face_angle = math.atan2(results.face_landmarks.landmark[454].y - results.face_landmarks.landmark[234].y,
                                      results.face_landmarks.landmark[454].x - results.face_landmarks.landmark[234].x)
                
                # Left
                px, py = l_ear.x * w, l_ear.y * h
                scale = face_w * 0.15 / ear_img.shape[1]
                self.overlay_image(frame, ear_img, int(px), int(py + scale*20), int(ear_img.shape[1]*scale), int(ear_img.shape[0]*scale), face_angle)
                
                # Right
                px, py = r_ear.x * w, r_ear.y * h
                self.overlay_image(frame, ear_img, int(px), int(py + scale*20), int(ear_img.shape[1]*scale), int(ear_img.shape[0]*scale), face_angle)

            # 4. Ring (Hands) - Check Left and Right Hand
            ring_img = self.assets.get_current('ring')
            if ring_img is not None:
                hands_list = [results.left_hand_landmarks, results.right_hand_landmarks]
                for i, hand_lm in enumerate(hands_list):
                    if hand_lm:
                        # Ring Finger MCP(13) -> PIP(14)
                        mcp = hand_lm.landmark[13]
                        pip = hand_lm.landmark[14]
                        
                        px, py = (mcp.x+pip.x)*w/2, (mcp.y+pip.y)*h/2
                        
                        dist = math.hypot((pip.x-mcp.x)*w, (pip.y-mcp.y)*h)
                        scale = dist * 2.5 / ring_img.shape[1]
                        angle = math.atan2(pip.y-mcp.y, pip.x-mcp.x) + math.pi/2
                        
                        prefix = f'h{i}'
                        sx = self.get_smooth_val(prefix+'x', px, t)
                        sy = self.get_smooth_val(prefix+'y', py, t)
                        ss = self.get_smooth_val(prefix+'s', scale, t)
                        sa = self.get_smooth_val(prefix+'a', angle, t)
                        
                        self.overlay_image(frame, ring_img, int(sx), int(sy), int(ring_img.shape[1]*ss), int(ring_img.shape[0]*ss), sa)

            # 5. Bracelet (Wrists)
            bra_img = self.assets.get_current('bracelet')
            if bra_img is not None and results.pose_landmarks:
                 # Left Wrist 15, Elbow 13
                 l_wrist = results.pose_landmarks.landmark[15]
                 l_elbow = results.pose_landmarks.landmark[13]
                 
                 # Only render if confidence high
                 if l_wrist.visibility > 0.5:
                     px, py = l_wrist.x * w, l_wrist.y * h
                     # Scale based on forearm length
                     len_forearm = math.hypot((l_wrist.x-l_elbow.x)*w, (l_wrist.y-l_elbow.y)*h)
                     scale = len_forearm * 0.4 / bra_img.shape[1]
                     angle = math.atan2(l_wrist.y-l_elbow.y, l_wrist.x-l_elbow.x) + math.pi/2
                     
                     sx = self.get_smooth_val('wb_x', px, t)
                     sy = self.get_smooth_val('wb_y', py, t)
                     ss = self.get_smooth_val('wb_s', scale, t)
                     sa = self.get_smooth_val('wb_a', angle, t)
                     
                     self.overlay_image(frame, bra_img, int(sx), int(sy), int(bra_img.shape[1]*ss), int(bra_img.shape[0]*ss), sa)

            # UI HUD
            y_off = 30
            cv2.putText(frame, "TOGGLE KEYS: 1=Necklace, 2=Earring, 3=Ring, 4=NosePin, 5=Bracelet", (10, y_off), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            y_off += 20
            cv2.putText(frame, f"Necklace: {'ON' if self.assets.active_states['necklace'] else 'OFF'}", (10, y_off), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
            y_off += 20
            cv2.putText(frame, f"Earring: {'ON' if self.assets.active_states['earring'] else 'OFF'}", (10, y_off), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
            y_off += 20
            # ... etc
            
            cv2.imshow('Ultimate Jewelry Try-On', frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'): break
            elif key == ord('1'): self.assets.toggle('necklace')
            elif key == ord('2'): self.assets.toggle('earring')
            elif key == ord('3'): self.assets.toggle('ring')
            elif key == ord('4'): self.assets.toggle('nosepin')
            elif key == ord('5'): self.assets.toggle('bracelet')
            elif key == ord('n'): 
                for cat in self.assets.active_states:
                    if self.assets.active_states[cat]:
                        self.assets.next_item(cat)
        
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    app = UltimateJewelryTryOn()
    app.process()
