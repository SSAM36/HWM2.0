"""
Tools for the Farmer Support Agent (Feature 4)
Provides scheme search, benefit calculation, and application tools
"""
from langchain_core.tools import tool
from typing import List, Dict, Any, Optional
import json
import random
import time

# Mock schemes database (in production, this would query Supabase)
SCHEMES_DATABASE = [
    {
        "id": "PM-KISAN-001",
        "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "state": "All India",
        "category": "All Farmers",
        "subsidy_type": "Direct Benefit Transfer",
        "benefit_amount": "₹6000/year",
        "eligibility": "All landholding farmers",
        "portal_url": "https://pmkisan.gov.in/"
    },
    {
        "id": "PMFBY-002",
        "name": "Pradhan Mantri Fasal Bima Yojana",
        "state": "All India",
        "category": "All Farmers",
        "subsidy_type": "Crop Insurance",
        "benefit_amount": "Up to 90% subsidy on premium",
        "eligibility": "All farmers growing notified crops",
        "portal_url": "https://pmfby.gov.in/"
    },
    {
        "id": "KCC-003",
        "name": "Kisan Credit Card Scheme",
        "state": "All India",
        "category": "All Farmers",
        "subsidy_type": "Credit at subsidized rate",
        "benefit_amount": "Up to ₹3 lakh at 4% interest",
        "eligibility": "Farmers with land ownership",
        "portal_url": "https://www.nabard.org/kcc.aspx"
    },
    {
        "id": "SMAM-004",
        "name": "Sub-Mission on Agricultural Mechanization",
        "state": "All India",
        "category": "SC/ST/Women/Small Farmers",
        "subsidy_type": "Equipment Subsidy",
        "benefit_amount": "40-50% subsidy on farm equipment",
        "eligibility": "Individual farmers and groups",
        "portal_url": "https://agrimachinery.nic.in/"
    }
]

@tool
def search_local_schemes(
    state: Optional[str] = None,
    category: Optional[str] = None,
    crop: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Search for government agricultural schemes based on location, farmer category, and crop type.
    
    Args:
        state: The state/region (e.g., "Maharashtra", "Punjab", "All India")
        category: Farmer category (e.g., "SC/ST", "Small Farmer", "Women", "All Farmers")
        crop: Crop type (e.g., "Rice", "Wheat", "Cotton")
    
    Returns:
        List of matching schemes with details
    """
    results = []
    
    for scheme in SCHEMES_DATABASE:
        # Match state
        if state and state.lower() not in scheme["state"].lower() and "all india" not in scheme["state"].lower():
            continue
        
        # Match category
        if category and category.lower() not in scheme["category"].lower() and "all farmers" not in scheme["category"].lower():
            continue
        
        # For crop-specific schemes, we'd need more data
        # For now, return schemes that match state/category
        
        results.append(scheme)
    
    return results if results else [{"message": "No matching schemes found"}]


@tool
def calculate_benefits(
    scheme_id: str,
    land_size: Optional[float] = None,
    crop_value: Optional[float] = None
) -> Dict[str, Any]:
    """
    Calculate potential benefits from a specific scheme.
    
    Args:
        scheme_id: The ID of the scheme
        land_size: Land size in acres/hectares
        crop_value: Value of crops in rupees
    
    Returns:
        Calculated benefit details
    """
    # Find scheme
    scheme = next((s for s in SCHEMES_DATABASE if s["id"] == scheme_id), None)
    
    if not scheme:
        return {"error": "Scheme not found"}
    
    benefit_info = {
        "scheme_name": scheme["name"],
        "scheme_id": scheme_id,
        "benefit_type": scheme["subsidy_type"]
    }
    
    # Calculate based on scheme type
    if "PM-KISAN" in scheme_id:
        benefit_info["annual_benefit"] = "₹6,000"
        benefit_info["installments"] = "3 installments of ₹2,000 each"
        
    elif "PMFBY" in scheme_id and crop_value:
        premium = crop_value * 0.02  # 2% premium
        subsidy = premium * 0.9  # 90% subsidy
        benefit_info["estimated_premium"] = f"₹{premium:.2f}"
        benefit_info["subsidy_amount"] = f"₹{subsidy:.2f}"
        benefit_info["your_contribution"] = f"₹{premium - subsidy:.2f}"
        
    elif "KCC" in scheme_id and land_size:
        credit_limit = min(land_size * 50000, 300000)  # ₹50k per acre, max 3 lakh
        benefit_info["credit_limit"] = f"₹{credit_limit:,.0f}"
        benefit_info["interest_rate"] = "4% per annum"
        
    elif "SMAM" in scheme_id:
        benefit_info["subsidy_rate"] = "40-50%"
        benefit_info["max_subsidy"] = "₹1,00,000 per beneficiary"
        if crop_value:
            subsidy = crop_value * 0.45
            benefit_info["estimated_subsidy"] = f"₹{subsidy:,.2f}"
    
    return benefit_info


@tool
def auto_fill_application(
    scheme_id: str,
    user_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Auto-fill a scheme application form with user profile data.
    
    Args:
        scheme_id: The ID of the scheme to apply for
        user_profile: User's profile information (name, state, land_size, etc.)
    
    Returns:
        Pre-filled application data
    """
    scheme = next((s for s in SCHEMES_DATABASE if s["id"] == scheme_id), None)
    
    if not scheme:
        return {"error": "Scheme not found"}
    
    # Generate a reference number
    timestamp = str(int(time.time()))[-6:]
    rand = str(random.randint(100, 999))
    reference_no = f"AGR-{timestamp}-{rand}"
    
    application = {
        "reference_no": reference_no,
        "scheme_id": scheme_id,
        "scheme_name": scheme["name"],
        "applicant_name": user_profile.get("name", ""),
        "state": user_profile.get("state", ""),
        "category": user_profile.get("category", ""),
        "land_size": user_profile.get("land_size"),
        "crop": user_profile.get("crop", ""),
        "portal_url": scheme["portal_url"],
        "status": "draft"
    }
    
    # Calculate benefits if possible
    benefits = calculate_benefits.invoke({
        "scheme_id": scheme_id,
        "land_size": user_profile.get("land_size"),
        "crop_value": user_profile.get("crop_value")
    })
    
    application["estimated_benefits"] = benefits
    
    return application


@tool
def submit_scheme_application(
    application_data: Dict[str, Any]
) -> Dict[str, str]:
    """
    Submit a scheme application to the backend system.
    
    Args:
        application_data: Complete application form data
    
    Returns:
        Submission status and reference number
    """
    # In production, this would POST to /api/schemes/apply
    # For now, simulate submission
    
    reference_no = application_data.get("reference_no", f"AGR-{int(time.time())}")
    
    return {
        "status": "submitted",
        "reference_no": reference_no,
        "message": f"Application submitted successfully. Reference: {reference_no}",
        "next_steps": "Track your application status using the reference number. You will receive SMS updates."
    }


# Export all tools for binding to LLM
ALL_TOOLS = [
    search_local_schemes,
    calculate_benefits,
    auto_fill_application,
    submit_scheme_application
]
