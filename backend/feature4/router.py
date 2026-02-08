from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from feature4.agent import agent_app
from langchain_core.messages import HumanMessage

feature4_router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    user_profile: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    found_schemes: Optional[List[Dict]] = None
    application_status: Optional[str] = None
    application_details: Optional[Dict] = None

@feature4_router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Chat with the farmer support agent.
    The agent can search for schemes, help with applications, and answer questions.
    """
    try:
        # Initialize state
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "user_profile": request.user_profile or {},
            "found_schemes": [],
            "selected_scheme": {},
            "application_status": "",
            "application_details": {},
            "intent": ""
        }
        
        # Run the agent
        result = agent_app.invoke(initial_state)
        
        # Extract the final response
        final_message = result["messages"][-1].content if result["messages"] else "No response generated."
        
        return ChatResponse(
            response=final_message,
            found_schemes=result.get("found_schemes", []),
            application_status=result.get("application_status", ""),
            application_details=result.get("application_details", {})
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@feature4_router.post("/search-schemes", response_model=Dict)
async def search_schemes(
    state: Optional[str] = None,
    category: Optional[str] = None,
    crop: Optional[str] = None
):
    """
    Search for government schemes based on criteria.
    """
    try:
        query = f"Find government schemes"
        if state:
            query += f" in {state}"
        if category:
            query += f" for {category} category"
        if crop:
            query += f" related to {crop}"
            
        initial_state = {
            "messages": [HumanMessage(content=query)],
            "user_profile": {
                "state": state or "",
                "category": category or "",
                "crop": crop or ""
            },
            "found_schemes": [],
            "selected_scheme": {},
            "application_status": "",
            "application_details": {},
            "intent": "search"
        }
        
        result = agent_app.invoke(initial_state)
        
        return {
            "schemes": result.get("found_schemes", []),
            "message": result["messages"][-1].content if result["messages"] else "No schemes found."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching schemes: {str(e)}")

@feature4_router.get("/health")
async def health_check():
    """Check if the agent service is running."""
    return {"status": "healthy", "service": "Farmer Support Agent"}
