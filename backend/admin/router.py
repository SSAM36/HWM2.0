from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from core.supabase_client import supabase

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard-stats")
async def get_dashboard_stats():
    """
    Fetch consolidated stats for the Admin Dashboard.
    """
    try:
        # 1. Total Farmers
        # Try farmer_profiles first, fallback to users count if table empty or error
        farmers_res = supabase.table("farmer_profiles").select("id", count="exact").execute()
        total_farmers = farmers_res.count if farmers_res.count is not None else 0
        
        # 2. Total Claims / Scheme Applications
        claims_res = supabase.table("scheme_applications").select("id", count="exact").execute()
        total_claims = claims_res.count if claims_res.count is not None else 0
        
        # 3. Pending Approvals
        pending_res = supabase.table("scheme_applications").select("id", count="exact").eq("status", "submitted").execute()
        pending_approvals = pending_res.count if pending_res.count is not None else 0
        
        # 4. Active Alerts / Risk Events
        alerts_res = supabase.table("risk_events").select("id", count="exact").in_("status", ["ACTIVE", "CLAIM_INITIATED"]).execute()
        active_alerts = alerts_res.count if alerts_res.count is not None else 0

        # 5. Disbursed Amount (Mock or sum from orders if available)
        # Using 'orders' total_price sum for now as a proxy for financial movement
        # Or ideally check a 'payments' table if it existed.
        orders_res = supabase.table("orders").select("total_price").execute()
        disbursed_amount = 0
        if orders_res.data:
            disbursed_amount = sum(float(order.get("total_price", 0)) for order in orders_res.data)
        
        # Format as Millions if large
        disbursed_display = f"₹{disbursed_amount:,.0f}"
        if disbursed_amount > 1000000:
            disbursed_display = f"₹{disbursed_amount/1000000:.1f}M"

        return {
            "total_farmers": total_farmers,
            "total_claims": total_claims,
            "pending_approvals": pending_approvals,
            "active_alerts": active_alerts,
            "disbursed_amount": disbursed_display
        }

    except Exception as e:
        print(f"Error fetching dashboard stats: {e}")
        # Return fallback zeros so UI doesn't crash
        return {
            "total_farmers": 0,
            "total_claims": 0,
            "pending_approvals": 0,
            "active_alerts": 0,
            "disbursed_amount": "₹0"
        }

@router.get("/recent-claims")
async def get_recent_claims():
    """
    Fetch recently submitted schemes/claims.
    """
    try:
        # Join with farmer_profiles if possible, or just fetch applications
        # Supabase join syntax: select('*, farmer_profiles(*)')
        response = supabase.table("scheme_applications")\
            .select("*, farmer_profiles(name, district)")\
            .order("created_at", desc=True)\
            .limit(10)\
            .execute()
        
        claims = []
        for item in response.data:
            farmer_name = "Unknown Farmer"
            if item.get("farmer_profiles"):
                farmer_name = item.get("farmer_profiles").get("name", "Unknown")
            elif item.get("user_id"):
                 # Fallback if the join didn't work directly or user_id is just local ID
                 farmer_name = f"User {item.get('user_id')[:8]}"

            claims.append({
                "id": item.get("id"),
                "farmer": farmer_name,
                "type": item.get("scheme_name", "General Scheme"),
                "amount": "₹--", # Amount often in application_details jsonb
                "date": item.get("created_at", "").split("T")[0],
                "status": item.get("status", "Pending")
            })
            
        return claims

    except Exception as e:
        print(f"Error fetching recent claims: {e}")
        return []

@router.get("/dashboard-chart")
async def get_dashboard_chart_data():
    """
    Get graph data for claims velocity.
    """
    # In a real app, we would aggregate by date in SQL.
    # For now, we will mock the trend based on recent data or return static structure if DB is empty
    return [
       {"name": "Mon", "claims": 4, "processed": 2},
       {"name": "Tue", "claims": 3, "processed": 1},
       {"name": "Wed", "claims": 2, "processed": 5},
       {"name": "Thu", "claims": 12, "processed": 8},
       {"name": "Fri", "claims": 18, "processed": 12},
       {"name": "Sat", "claims": 10, "processed": 9},
       {"name": "Sun", "claims": 8, "processed": 6},
    ]

@router.get("/risk-heatmap")
async def get_risk_heatmap():
    """
    Get active risks for the heatmap/alert section.
    """
    try:
        response = supabase.table("risk_events")\
            .select("*")\
            .eq("status", "ACTIVE")\
            .order("created_at", desc=True)\
            .limit(5)\
            .execute()
            
        alerts = []
        for item in response.data:
            # Parse details safely
            details = item.get("details") or {}
            
            alerts.append({
                "id": item.get("id"),
                "type": item.get("risk_level", "Unknown Risk"),
                "location": details.get("location", "Unknown Region"),
                "message": details.get("description", "Potential crop risk detected.")
            })
            
        return alerts
    except Exception as e:
        print(f"Error fetching alerts: {e}")
        return []
