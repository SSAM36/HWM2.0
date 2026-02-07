from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from langchain_core.messages import HumanMessage, AIMessage
from feature4.agent import agent_app
from feature5.subsidy_service import get_all_subsidies, get_available_states, CENTRAL_SUBSIDIES, STATE_SUBSIDIES
from core.supabase_client import supabase

feature4_router = APIRouter()

class HistoryMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    thread_id: str
    history: Optional[List[HistoryMessage]] = []
    user_state: Optional[Dict] = {}

class ProfileRequest(BaseModel):
    name: str
    phone: Optional[str] = None
    state: str
    district: Optional[str] = None
    land_size: Optional[float] = None
    crops: Optional[str] = None
    category: Optional[str] = "General"

# In-memory fallback (used if DB is unavailable)
farmer_profiles_fallback: Dict[str, Dict] = {}

# Supabase table name for farmer profiles
PROFILES_TABLE = "farmer_profiles"

@feature4_router.get("/schemes")
async def get_schemes(state: Optional[str] = None, category: Optional[str] = None):
    """
    Get all available schemes, optionally filtered by state.
    """
    try:
        result = get_all_subsidies(state=state)
        
        # Add category tags to schemes
        schemes = []
        for s in result.get("central_subsidies", []):
            s["category"] = "Central Scheme"
            schemes.append(s)
        for s in result.get("state_subsidies", []):
            s["category"] = "State Scheme"
            schemes.append(s)
        
        return {
            "schemes": schemes,
            "total": len(schemes),
            "available_states": get_available_states()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@feature4_router.get("/states")
async def get_states():
    """Get list of states with subsidy data."""
    return {"states": get_available_states()}

@feature4_router.post("/profile")
async def save_profile(profile: ProfileRequest, user_id: str = "default"):
    """Save farmer profile to Supabase."""
    profile_data = profile.dict()
    profile_data["user_id"] = user_id
    
    try:
        if supabase is not None:
            # Check if profile exists
            existing = supabase.table(PROFILES_TABLE).select("id").eq("user_id", user_id).execute()
            
            if existing.data and len(existing.data) > 0:
                # Update existing profile
                result = supabase.table(PROFILES_TABLE).update(profile_data).eq("user_id", user_id).execute()
            else:
                # Insert new profile
                result = supabase.table(PROFILES_TABLE).insert(profile_data).execute()
            
            if result.data:
                return {"message": "Profile saved to database", "profile": profile_data}
            else:
                raise Exception("No data returned from Supabase")
        else:
            # Fallback to in-memory
            farmer_profiles_fallback[user_id] = profile_data
            return {"message": "Profile saved (in-memory fallback)", "profile": profile_data}
    except Exception as e:
        # Fallback to in-memory on error
        farmer_profiles_fallback[user_id] = profile_data
        print(f"⚠️ Supabase save failed, using fallback: {e}")
        return {"message": "Profile saved (fallback)", "profile": profile_data}

@feature4_router.get("/profile")
async def get_profile(user_id: str = "default"):
    """Get farmer profile from Supabase."""
    try:
        if supabase is not None:
            result = supabase.table(PROFILES_TABLE).select("*").eq("user_id", user_id).execute()
            
            if result.data and len(result.data) > 0:
                profile = result.data[0]
                # Remove internal fields
                profile.pop("id", None)
                profile.pop("created_at", None)
                profile.pop("updated_at", None)
                return {"profile": profile}
        
        # Fallback to in-memory
        if user_id in farmer_profiles_fallback:
            return {"profile": farmer_profiles_fallback[user_id]}
        
        return {"profile": None}
    except Exception as e:
        print(f"⚠️ Supabase read failed, using fallback: {e}")
        if user_id in farmer_profiles_fallback:
            return {"profile": farmer_profiles_fallback[user_id]}
        return {"profile": None}

@feature4_router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    try:
        # Build messages from history
        messages = []
        if request.history:
            for msg in request.history:
                if msg.role == 'user':
                    messages.append(HumanMessage(content=msg.content))
                else:
                    messages.append(AIMessage(content=msg.content))
        else:
            # Fallback: just use the current message
            messages.append(HumanMessage(content=request.message))
        
        # Construct state with full history
        initial_state = {
            "messages": messages,
            "user_profile": request.user_state or {}
        }
        
        # Run agent
        final_state = await agent_app.ainvoke(initial_state)
        
        # Extract response
        last_message = final_state["messages"][-1]
        response_text = last_message.content
        
        return {
            "response": response_text,
            "current_profile": final_state.get("user_profile"),
            "found_schemes": final_state.get("found_schemes"),
            "application_status": final_state.get("application_status"),
            "application_details": final_state.get("application_details")
        }
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
