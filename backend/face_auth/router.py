from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from .face_service import register_face_opencv, authenticate_face_opencv
from typing import List
import shutil
import os
import uuid

router = APIRouter()

@router.post("/register")
async def register_user_face(name: str = Form(...), file: UploadFile = File(...)):
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    temp_filename = f"temp_reg_{uuid.uuid4()}.jpg"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        success = register_face_opencv(temp_filename, name)
        if success:
            return {"success": True, "message": f"User {name} registered!"}
        else:
            # Important: Don't 400 if it's a transient face detection failure during scanning
            return {"success": False, "message": "No face detected"}
            
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@router.post("/register-bulk")
async def register_bulk(name: str = Form(...), files: List[UploadFile] = File(...)):
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    
    success_count = 0
    errors = []
    
    for file in files:
        temp_filename = f"temp_bulk_{uuid.uuid4()}.jpg"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            if register_face_opencv(temp_filename, name):
                success_count += 1
        except Exception as e:
            errors.append(str(e))
        finally:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
                
    return {
        "success": success_count > 0,
        "message": f"Registered {success_count} samples for {name}",
        "failed": len(files) - success_count
    }

@router.post("/login")
async def login_user_face(file: UploadFile = File(...)):
    temp_filename = f"temp_login_{uuid.uuid4()}.jpg"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        identified_name = authenticate_face_opencv(temp_filename)
        
        if identified_name:
            return {
                "success": True, 
                "message": f"Welcome back, {identified_name}!", 
                "user": {"name": identified_name, "id": "knn-user"}
            }
        else:
            raise HTTPException(status_code=401, detail="Face not recognized.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=500, detail=f"Face Auth Error: {str(e)}")
    finally:
         if os.path.exists(temp_filename):
            os.remove(temp_filename)

