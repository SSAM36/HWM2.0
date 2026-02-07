"""
Equipment Analyzer Module - Multi-Agent System for Farm Equipment Maintenance

This module provides AI-powered analysis of farm equipment using Google Gemini API.
It includes agents for:
- Image Analysis: Identifies equipment, assesses condition, detects damage
- Maintenance Planning: Generates schedules based on condition and usage
- Repair Advisory: Provides repair instructions and recommendations
"""

from google import genai
from google.genai import types
import base64
import json
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import os

# Configure Gemini API
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Pydantic models for structured responses
class EquipmentIssue(BaseModel):
    name: str
    severity: str  # low, medium, high, critical
    description: str
    affected_part: str

class EquipmentAnalysis(BaseModel):
    equipment_name: str
    equipment_type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    health_score: int  # 0-100
    condition: str  # Excellent, Good, Fair, Poor, Critical
    issues: list[EquipmentIssue]
    summary: str
    confidence: float  # 0-1

class MaintenanceTask(BaseModel):
    task_id: str
    task_name: str
    description: str
    priority: str  # low, medium, high, urgent
    scheduled_date: str
    estimated_duration: str
    tools_required: list[str]
    difficulty: str  # easy, moderate, difficult

class RepairRecommendation(BaseModel):
    issue_name: str
    repair_type: str  # diy, professional
    steps: list[str]
    tools_required: list[str]
    estimated_cost: str
    estimated_time: str
    parts_needed: list[str]
    safety_warnings: list[str]

class DamagedPart(BaseModel):
    part_name: str
    original_equipment: str
    urgency: str  # immediate, soon, can_wait
    estimated_price_range: str

# In-memory storage for equipment analyses
equipment_history: list[dict] = []
maintenance_schedules: list[dict] = []


def get_gemini_model():
    """Get the Gemini model for image analysis."""
    return 'gemini-2.0-flash-exp'


async def analyze_equipment_image(image_base64: str) -> dict:
    """
    Analyze a farm equipment image using Gemini AI.
    
    Args:
        image_base64: Base64 encoded image string
        
    Returns:
        Dictionary containing equipment analysis results
    """
    model_name = get_gemini_model()
    
    # Decode base64 to image data
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]
    
    image_data = base64.b64decode(image_base64)
    
    # Create the analysis prompt
    analysis_prompt = """You are an expert agricultural equipment analyst. Analyze this image of farm equipment and provide a detailed assessment.

Return your analysis in the following JSON format ONLY (no markdown, no code blocks):
{
    "equipment_name": "Name of the equipment (e.g., Tractor, Rotavator, Pump)",
    "equipment_type": "Category (e.g., Tillage, Irrigation, Harvesting, Spraying)",
    "brand": "Brand name if visible, or null",
    "model": "Model number if visible, or null",
    "health_score": 85,
    "condition": "Good",
    "issues": [
        {
            "name": "Issue name",
            "severity": "low|medium|high|critical",
            "description": "Detailed description of the issue",
            "affected_part": "Which part is affected"
        }
    ],
    "summary": "A 2-3 sentence summary of the equipment's overall condition",
    "confidence": 0.85
}

Health Score Guidelines:
- 90-100: Excellent - New or like-new condition
- 70-89: Good - Well maintained, minor wear
- 50-69: Fair - Visible wear, needs attention
- 30-49: Poor - Significant issues, needs repair
- 0-29: Critical - Major damage, may need replacement

Condition values: Excellent, Good, Fair, Poor, Critical
Severity values: low, medium, high, critical

Be thorough but realistic. If you cannot identify the equipment clearly, provide your best assessment with a lower confidence score."""

    try:
        # Send image and prompt to Gemini using new API
        response = client.models.generate_content(
            model=model_name,
            contents=[
                types.Part.from_bytes(
                    data=image_data,
                    mime_type="image/jpeg"
                ),
                analysis_prompt
            ]
        )
        
        # Parse the response
        response_text = response.text.strip()
        
        # Clean up response if it has markdown code blocks
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        analysis_result = json.loads(response_text.strip())
        
        # Add timestamp and store in history
        analysis_result['analyzed_at'] = datetime.now().isoformat()
        analysis_result['id'] = f"eq_{len(equipment_history) + 1}"
        equipment_history.append(analysis_result)
        
        return analysis_result
        
    except json.JSONDecodeError as e:
        return {
            "error": "Failed to parse AI response",
            "raw_response": response_text if 'response_text' in locals() else None,
            "details": str(e)
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"⚠️ API Error: {e}. Switching to SIMULATION MODE.")
        
        # Fallback Simulation Data
        mock_data = {
            "equipment_name": "Farm Equipment (Simulated)",
            "equipment_type": "General Agriculture",
            "brand": "Standard Make",
            "model": "Series-X",
            "health_score": 85,
            "condition": "Good",
            "issues": [
                {
                    "name": "Routine Wear",
                    "severity": "low",
                    "description": "Normal wear and tear observed on moving parts.",
                    "affected_part": "Chassis"
                }
            ],
            "summary": "Simulation: The AI service was unavailable/unconfigured. Assuming equipment is in good working order for demonstration.",
            "confidence": 0.90,
            "id": f"eq_{len(equipment_history) + 1}",
            "analyzed_at": datetime.now().isoformat()
        }
        equipment_history.append(mock_data)
        return mock_data


async def generate_maintenance_schedule(analysis: dict) -> list[dict]:
    """
    Generate a maintenance schedule based on equipment analysis.
    
    Args:
        analysis: Equipment analysis result
        
    Returns:
        List of maintenance tasks
    """
    model_name = get_gemini_model()
    
    schedule_prompt = f"""Based on this equipment analysis, generate a maintenance schedule for the next 6 months.

Equipment Analysis:
{json.dumps(analysis, indent=2)}

Return a JSON array of maintenance tasks ONLY (no markdown, no code blocks):
[
    {{
        "task_id": "task_1",
        "task_name": "Task name",
        "description": "Detailed description",
        "priority": "low|medium|high|urgent",
        "scheduled_date": "YYYY-MM-DD",
        "estimated_duration": "30 minutes",
        "tools_required": ["Tool 1", "Tool 2"],
        "difficulty": "easy|moderate|difficult"
    }}
]

Schedule Guidelines:
- For Critical condition: Schedule urgent repairs immediately
- For Poor condition: Weekly check-ups, monthly maintenance
- For Fair condition: Monthly maintenance, quarterly deep cleaning
- For Good condition: Quarterly maintenance, annual overhaul
- For Excellent condition: Semi-annual maintenance

Include:
1. Immediate repairs for any critical/high severity issues
2. Regular maintenance tasks (oil changes, cleaning, lubrication)
3. Seasonal preparation tasks
4. Preventive maintenance based on equipment type"""

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=schedule_prompt
        )
        response_text = response.text.strip()
        
        # Clean up response
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
            
        schedule = json.loads(response_text.strip())
        
        # Store in memory
        for task in schedule:
            task['equipment_id'] = analysis.get('id')
            maintenance_schedules.append(task)
        
        return schedule
        
    except Exception as e:
        # Generate a basic schedule if AI fails
        today = datetime.now()
        return [
            {
                "task_id": "task_1",
                "task_name": "General Inspection",
                "description": "Perform a thorough visual inspection of the equipment",
                "priority": "high" if analysis.get('health_score', 50) < 50 else "medium",
                "scheduled_date": today.strftime("%Y-%m-%d"),
                "estimated_duration": "1 hour",
                "tools_required": ["Flashlight", "Inspection checklist"],
                "difficulty": "easy"
            },
            {
                "task_id": "task_2", 
                "task_name": "Routine Maintenance",
                "description": "Clean, lubricate, and check all moving parts",
                "priority": "medium",
                "scheduled_date": (today + timedelta(days=7)).strftime("%Y-%m-%d"),
                "estimated_duration": "2 hours",
                "tools_required": ["Lubricant", "Cleaning cloth", "Basic tools"],
                "difficulty": "moderate"
            }
        ]


async def get_repair_recommendations(analysis: dict) -> list[dict]:
    """
    Get detailed repair recommendations for identified issues.
    
    Args:
        analysis: Equipment analysis result
        
    Returns:
        List of repair recommendations
    """
    if not analysis.get('issues'):
        return []
    
    model_name = get_gemini_model()
    
    repair_prompt = f"""Based on the identified issues in this equipment, provide detailed repair recommendations.

Equipment: {analysis.get('equipment_name')}
Type: {analysis.get('equipment_type')}
Issues: {json.dumps(analysis.get('issues', []), indent=2)}

Return a JSON array of repair recommendations ONLY (no markdown, no code blocks):
[
    {{
        "issue_name": "Name of the issue being addressed",
        "repair_type": "diy|professional",
        "steps": [
            "Step 1: Description",
            "Step 2: Description"
        ],
        "tools_required": ["Tool 1", "Tool 2"],
        "estimated_cost": "₹500-1000",
        "estimated_time": "2-3 hours",
        "parts_needed": ["Part 1", "Part 2"],
        "safety_warnings": ["Warning 1", "Warning 2"]
    }}
]

Guidelines:
- For low/medium severity issues: Recommend DIY if feasible
- For high/critical severity: Recommend professional help
- Include safety warnings for any potentially dangerous repairs
- Provide cost estimates in Indian Rupees (₹)
- Be specific with steps - farmers should be able to follow them"""

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=repair_prompt
        )
        response_text = response.text.strip()
        
        # Clean up response
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
            
        recommendations = json.loads(response_text.strip())
        return recommendations
        
    except Exception as e:
        return [{
            "issue_name": "General Maintenance Required",
            "repair_type": "professional",
            "steps": ["Contact a local equipment service center for inspection"],
            "tools_required": [],
            "estimated_cost": "Varies",
            "estimated_time": "Depends on issues",
            "parts_needed": [],
            "safety_warnings": ["Always disconnect power before any inspection"]
        }]


async def identify_damaged_parts(analysis: dict) -> list[dict]:
    """
    Identify parts that need replacement from the analysis.
    
    Args:
        analysis: Equipment analysis result
        
    Returns:
        List of damaged parts that need replacement
    """
    if not analysis.get('issues'):
        return []
    
    # Filter for high/critical severity issues that likely need parts
    critical_issues = [
        issue for issue in analysis.get('issues', [])
        if issue.get('severity') in ['high', 'critical']
    ]
    
    if not critical_issues:
        return []
    
    model_name = get_gemini_model()
    
    parts_prompt = f"""Based on these critical issues, identify parts that may need replacement.

Equipment: {analysis.get('equipment_name')}
Type: {analysis.get('equipment_type')}
Brand: {analysis.get('brand', 'Unknown')}
Model: {analysis.get('model', 'Unknown')}
Critical Issues: {json.dumps(critical_issues, indent=2)}

Return a JSON array of parts that likely need replacement ONLY (no markdown, no code blocks):
[
    {{
        "part_name": "Specific part name",
        "original_equipment": "Equipment this part belongs to",
        "urgency": "immediate|soon|can_wait"
    }}
]

Be specific with part names so they can be searched on e-commerce sites."""

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=parts_prompt
        )
        response_text = response.text.strip()
        
        # Clean up response
        if response_text.startswith('```'):
            response_text = response_text.split('```')[1]
            if response_text.startswith('json'):
                response_text = response_text[4:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
            
        parts = json.loads(response_text.strip())
        return parts
        
    except Exception as e:
        return []


def get_analysis_history() -> list[dict]:
    """Get all previous equipment analyses."""
    return equipment_history


def get_maintenance_schedules() -> list[dict]:
    """Get all maintenance schedules."""
    return maintenance_schedules
