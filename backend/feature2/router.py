from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from .agents import crop_agent_app, analysis_agent_app
from .satellite_service import SatelliteService
from .model_service import predict_disease
import traceback

router = APIRouter(prefix="/api/feature2", tags=["crop-health"])

class AnalysisRequest(BaseModel):
    disease: str
    confidence: float
    lang: Optional[str] = "en"  # Language code: en, hi, mr

class SatelliteRequest(BaseModel):
    lat: float
    lng: float
    bbox: Optional[List[float]] = None

@router.post("/predict")
async def predict_only(file: UploadFile = File(...)):
    """
    Step 1: Fast CNN Prediction Only.
    """
    try:
        print(f"📥 Received prediction request for file: {file.filename}")
        content = await file.read()
        print(f"📊 File size: {len(content)} bytes")
        
        result = predict_disease(content)
        print(f"✅ Prediction successful: {result.get('class', 'Unknown')}")
        return result
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Prediction Error: {e}")
        print(f"Full traceback:\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/analyze")
async def analyze_results(request: AnalysisRequest):
    """
    Step 2: Slow Agentic Analysis.
    """
    try:
        # Invoke the Analysis Workflow with language
        result = analysis_agent_app.invoke({
            "disease_class": request.disease,
            "confidence": request.confidence,
            "lang": request.lang or "en"
        })
        
        return {
            "analysis": result.get("analysis_report", "Analysis failed"),
            "treatment": result.get("treatment_plan", "No plan generated"),
            "subsidy": result.get("subsidy_info", "No info")
        }
    except Exception as e:
        print(f"❌ Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from .compensation_agent import CompensationAgent
from .agronomist_chat import AgronomistChatAgent

class ChatRequest(BaseModel):
    message: str
    state: dict
    context: Optional[dict] = None
    lang: Optional[str] = "en"  # Language code: en, hi, mr

@router.post("/agent/chat")
async def chat_agent(request: ChatRequest):
    """
    Interacts with Compensation Agent or Agronomist Agent.
    """
    try:
        # If context is provided, it's the Agronomist Chat
        if request.context:
             result = AgronomistChatAgent.chat(request.message, request.state.get("history", []), request.context, request.lang or "en")
             return result
        
        result = CompensationAgent.process_message(request.state, request.message, request.lang or "en")
        return result
    except Exception as e:
         print(f"❌ Agent Error: {e}")
         raise HTTPException(status_code=500, detail=str(e))

@router.post("/ndvi")
async def get_satellite_ndvi(request: SatelliteRequest):
    """
    Fetches NDVI Satellite Data (Real Sentinel-2).
    """
    try:
        # Default to checking last 30 days
        data = SatelliteService.get_ndvi_data(request.lat, request.lng, days_back=30, custom_bbox=request.bbox)
        return data
    except Exception as e:
        print(f"❌ NDVI Error: {e}")
        raise HTTPException(status_code=500, detail=f"Satellite Data Unavailable: {str(e)}")

# --- PDF GENERATION ---
from fastapi.responses import Response
from .pdf_service import PDFService

class ClaimFormRequest(BaseModel):
    farmer_name: str
    guardian_name: str
    mobile: str
    aadhaar: str
    address: str
    account_holder: str
    bank_name: str
    branch_name: str
    account_number: str
    ifsc: str
    survey_no: str
    village: str
    crop_name: str
    sowing_date: str
    area_insured: str
    loss_date: str
    loss_cause: str
    loss_percentage: str

@router.post("/claim/generate-pdf")
async def generate_claim_pdf(request: ClaimFormRequest):
    try:
        pdf_bytes = PDFService.generate_claim_form(request.dict())
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Claim_Form_{request.aadhaar[-4:]}.pdf"
            }
        )
    except Exception as e:
        print(f"❌ PDF Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- AGRONOMIST ENDPOINTS ---
from .agronomist_service import AgronomistService

@router.get("/agronomists")
async def get_agronomists(count: int = 2, specialization: Optional[str] = None):
    """
    Fetch random available agronomists from database
    
    Args:
        count: Number of agronomists to return (default: 2)
        specialization: Filter by specialization (optional)
    
    Returns:
        List of agronomist details
    """
    try:
        agronomists = AgronomistService.get_random_agronomists(count, specialization)
        return {"agronomists": agronomists}
    except Exception as e:
        print(f"❌ Agronomist Fetch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- SCHEME APPLICATION ENDPOINTS ---
from .scheme_application_service import SchemeApplicationService

class SchemeApplicationRequest(BaseModel):
    user_id: str  # From farmer_profiles
    scheme_name: str
    application_details: dict  # JSONB field containing all scheme details
    farmer_name: Optional[str] = None  # Farmer's name
    farmer_phone: Optional[str] = None  # Farmer's phone

class UpdateStatusRequest(BaseModel):
    status: str

@router.post("/scheme-applications")
async def create_scheme_application(request: SchemeApplicationRequest):
    """
    Create a new scheme application from a farmer
    """
    try:
        result = SchemeApplicationService.create_application(
            user_id=request.user_id,
            scheme_name=request.scheme_name,
            application_details=request.application_details,
            farmer_name=request.farmer_name,
            farmer_phone=request.farmer_phone
        )
        return result
    except Exception as e:
        print(f"❌ Scheme Application Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheme-applications/farmer/{farmer_id}")
async def get_farmer_applications(farmer_id: str):
    """
    Get all scheme applications for a specific farmer
    """
    try:
        applications = SchemeApplicationService.get_farmer_applications(farmer_id)
        return {"applications": applications}
    except Exception as e:
        print(f"❌ Error fetching farmer applications: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheme-applications")
async def get_all_applications(
    limit: int = 100,
    offset: int = 0,
    status: Optional[str] = None
):
    """
    Get all scheme applications (Admin only)
    """
    try:
        result = SchemeApplicationService.get_all_applications(
            limit=limit,
            status=status,
            offset=offset
        )
        return result
    except Exception as e:
        print(f"❌ Error fetching applications: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/scheme-applications/{application_id}/status")
async def update_application_status(
    application_id: str,  # UUID as string
    request: UpdateStatusRequest
):
    """
    Update scheme application status (Admin only)
    """
    try:
        success = SchemeApplicationService.update_application_status(
            application_id=application_id,
            status=request.status
        )
        if success:
            return {"status": "success", "message": "Application updated"}
        else:
            raise HTTPException(status_code=400, detail="Failed to update application")
    except Exception as e:
        print(f"❌ Error updating application: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheme-applications/statistics")
async def get_application_statistics():
    """
    Get scheme application statistics (Admin only)
    """
    try:
        stats = SchemeApplicationService.get_statistics()
        return stats
    except Exception as e:
        print(f"❌ Error fetching statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scheme-applications/test")
async def test_scheme_applications_table():
    """
    Test endpoint to verify scheme_applications table exists and is accessible
    """
    try:
        from core.supabase_client import supabase
        # Try to query the table
        response = supabase.table('scheme_applications')\
            .select('*')\
            .limit(1)\
            .execute()
        
        return {
            "status": "success",
            "message": "Table is accessible",
            "sample_count": len(response.data) if response.data else 0,
            "sample_data": response.data[0] if response.data and len(response.data) > 0 else None
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }

