from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from .decision_engine import evaluate_crop_status
from .blockchain_logger import ledger
from .data_simulator import update_data, simulate_drying

router = APIRouter()

# Helper to require Farmer ID
def get_user_id(x_farmer_id: Optional[str] = Header(None)):
    if not x_farmer_id:
        # Fallback for dev/testing if header missing
        return "DEMO_FARMER_001"
    return x_farmer_id

@router.get("/status")
def get_system_status(x_farmer_id: Optional[str] = Header(None)):
    """Returns current sensor data and decision engine status for specific user."""
    user_id = get_user_id(x_farmer_id)
    return evaluate_crop_status(user_id)

@router.post("/run-cycle")
def run_automation_cycle(x_farmer_id: Optional[str] = Header(None)):
    """
    Manually triggers the automation cycle (for Demo).
    Checks sensors -> Decides -> Returns Action.
    """
    user_id = get_user_id(x_farmer_id)
    
    # 1. Simulate data change (e.g. soil getting drier)
    simulate_drying(user_id)
    
    # 2. Evaluate
    status = evaluate_crop_status(user_id)
    
    # 3. Log cycle run
    ledger.log_event(user_id, "Automation Cycle Ran", {"moisture": status["soil_moisture"]})
    
    return status

@router.post("/execute-irrigation")
def execute_irrigation(x_farmer_id: Optional[str] = Header(None)):
    """
    Executes the irrigation action (triggered by User from Dashboard).
    """
    user_id = get_user_id(x_farmer_id)
    
    # 1. Log to Blockchain
    block = ledger.log_event(user_id, "Irrigation Triggered", {"source": "User Dashboard", "amount_liters": 1000})
    
    # 2. Update Soil Data (Simulate watering)
    update_data(user_id, {"soil_moisture": 45, "last_irrigation_hours_ago": 0})
    
    return {
        "status": "success",
        "message": "Irrigation system activated.",
        "blockchain_record": block
    }

from .twilio_manager import TwilioManager

twilio_manager = TwilioManager()

@router.post("/consultation-call")
def make_consultation_call(to_number: str):
    """Triggers a Twilio call to the agronomist."""
    return twilio_manager.make_call(to_number)

@router.get("/history")
def get_history(x_farmer_id: Optional[str] = Header(None)):
    """Returns the immutable ledger history for the user."""
    user_id = get_user_id(x_farmer_id)
    return ledger.get_history(user_id)
