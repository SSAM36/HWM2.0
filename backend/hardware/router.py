from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from core.supabase_client import supabase

router = APIRouter(prefix="/api/hardware", tags=["hardware"])

class SensorData(BaseModel):
    soil_moisture: float
    nitrogen: int
    phosphorus: int
    potassium: int
    ph: float
    soil_temperature: float
    conductivity: float
    user_id: Optional[str] = "HARDWARE_DEFAULT"

@router.post("/sensor-data")
async def receive_sensor_data(data: SensorData):
    """
    Receives real-time sensor data from Arduino/ESP32 hardware.
    """
    try:
        sensor_payload = {
            "user_id": data.user_id,
            "data": {
                "ph": data.ph,
                "nitrogen": data.nitrogen,
                "phosphorus": data.phosphorus,
                "potassium": data.potassium,
                "conductivity": data.conductivity,
                "soil_moisture": data.soil_moisture,
                "soil_temperature": data.soil_temperature,
                "last_updated": datetime.utcnow().isoformat()
            }
        }
        
        # Try to update existing record, if not exists then insert
        existing = supabase.table("autonomous_sensors").select("id").eq("user_id", data.user_id).execute()
        
        if existing.data:
            supabase.table("autonomous_sensors").update({"data": sensor_payload["data"]}).eq("user_id", data.user_id).execute()
        else:
            supabase.table("autonomous_sensors").insert(sensor_payload).execute()
        
        print(f"✅ Hardware data received: Moisture={data.soil_moisture}%, N={data.nitrogen}")
        
        return {
            "status": "success",
            "message": "Sensor data stored successfully",
            "data": data.dict()
        }
        
    except Exception as e:
        print(f"❌ Hardware data error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest")
async def get_latest_sensor_data(user_id: str = "HARDWARE_DEFAULT"):
    """Get latest sensor reading."""
    try:
        response = supabase.table("autonomous_sensors").select("*").eq("user_id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            return {"status": "success", "data": response.data[0]["data"]}
        else:
            return {"status": "no_data", "message": "No sensor data available yet"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
