import cv2
import numpy as np
import os
from sklearn.neighbors import KNeighborsClassifier
from core.supabase_client import supabase

# Constants
DISTANCE_THRESHOLD = 15000.0 
TABLE_NAME = "face_auth_data"

# Load Haar Cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def process_image(image_path):
    """
    Reads image, detects face, crops COLOR image, resizes to 50x50, flattens.
    Returns the flattened face vector (1, 7500).
    """
    frame = cv2.imread(image_path)
    if frame is None:
        print(f"DEBUG: Could not read image at {image_path}")
        return None
        
    h_orig, w_orig = frame.shape[:2]
    
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Improve detection by equalizing histogram (good for varying light)
    gray = cv2.equalizeHist(gray)
    
    # Lower minNeighbors to 3 and scaleFactor to 1.1 for better detection
    faces = face_cascade.detectMultiScale(gray, 1.1, 3)
    
    if len(faces) == 0:
        # Try a slightly bigger scale for smaller faces
        faces = face_cascade.detectMultiScale(gray, 1.05, 2)
        
    print(f"DEBUG: Detected {len(faces)} faces in {w_orig}x{h_orig} image.")
        
    if len(faces) == 0:
        return None
    
    # Take the largest face
    (x, y, w, h) = max(faces, key=lambda f: f[2] * f[3])
    
    # Crop COLOR image
    crop_img = frame[y:y+h, x:x+w, :]
    resized_img = cv2.resize(crop_img, (50, 50))
    
    # Flatten (raw 0-255)
    flattened = resized_img.flatten().reshape(1, -1)
    
    return flattened

def register_face_opencv(image_path, name):
    face_vector = process_image(image_path)
    if face_vector is None:
        return False
        
    try:
        # 1. Read the RAW BYTES of the image
        with open(image_path, "rb") as f:
            raw_bytes = f.read()
            
        # 2. Convert to Hex format for PostgreSQL BYTEA storage
        # PostgreSQL BYTEA accepts a hex string prefixed with \x
        binary_hex = "\\x" + raw_bytes.hex()
            
        # 3. Save vector and metadata to Supabase DB
        vector_list = face_vector.tolist()[0]
        
        data = {
            "name": name,
            "face_vector": vector_list,
            "image_raw": binary_hex # Database stores this as raw bytes
        }
        
        supabase.table(TABLE_NAME).insert(data).execute()
        return True
    except Exception as e:
        print(f"Registration Error: {e}")
        return False

def authenticate_face_opencv(image_path):
    face_vector = process_image(image_path)
    if face_vector is None:
        print("Auth: No face detected.")
        return None
        
    # Fetch data from Supabase - only grab identifying data for speed
    try:
        response = supabase.table(TABLE_NAME).select("name", "face_vector").execute()
        records = response.data
        
        if not records or len(records) == 0:
            print("Auth: No registered faces in Supabase.")
            return None
            
        # Prepare training data
        faces_train = np.array([rec["face_vector"] for rec in records])
        names_train = [rec["name"] for rec in records]
        
        # Train KNN on-the-fly (Real-time model generation)
        n_samples = len(names_train)
        n_neighbors = min(5, n_samples)
        
        knn = KNeighborsClassifier(n_neighbors=n_neighbors)
        knn.fit(faces_train, names_train)
        
        # Predict: Classify if it's the right person
        distances, indices = knn.kneighbors(face_vector, n_neighbors=1)
        
        min_distance = distances[0][0]
        identified_idx = indices[0][0]
        candidate_name = names_train[identified_idx]
        
        print(f"Auth Check: Closest match '{candidate_name}' with distance {min_distance:.4f}")
        
        # Verify identity against threshold to prevent false positives
        if min_distance > DISTANCE_THRESHOLD:
            print(f"Auth: Rejected. Distance {min_distance:.4f} > Threshold {DISTANCE_THRESHOLD}")
            return None
            
        return candidate_name
        
    except Exception as e:
        print(f"Supabase Auth Error: {e}")
        return None
