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
    Fetch recently submitted schemes/claims with detailed info.
    """
    try:
        # Fetch applications
        response = supabase.table("scheme_applications")\
            .select("*, farmer_profiles(name, district)")\
            .order("created_at", desc=True)\
            .limit(10)\
            .execute()
        
        claims = []
        for item in response.data:
            details = item.get("application_details") or {}
            
            # Determine Farmer Name: Joined Profile > Details JSON > User ID > Default
            farmer_name = "Unknown Farmer"
            if item.get("farmer_profiles") and item.get("farmer_profiles").get("name"):
                farmer_name = item.get("farmer_profiles").get("name")
            elif details.get("applicant_name"):
                 farmer_name = details.get("applicant_name")
            
            # Determine Amount
            amount = details.get("subsidy_amount", "₹--")
            
            claims.append({
                "id": item.get("id"),
                "farmer": farmer_name,
                "type": item.get("scheme_name", "General Scheme"),
                "amount": amount,
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
    Get dynamic graph data for claims velocity aggregated by date.
    """
    try:
        from datetime import datetime, timedelta
        from collections import defaultdict

        # Calculate date range (last 7 days)
        today = datetime.now().date()
        date_labels = []
        for i in range(6, -1, -1):
            date_labels.append((today - timedelta(days=i)).isoformat())

        # Fetch claims created in last 7 days
        start_date = date_labels[0]
        
        # Claims (Submitted)
        claims_res = supabase.table("scheme_applications")\
            .select("created_at")\
            .gte("created_at", start_date)\
            .execute()
            
        # Processed (Approved/Rejected)
        processed_res = supabase.table("scheme_applications")\
            .select("updated_at")\
            .gte("updated_at", start_date)\
            .in_("status", ["approved", "rejected", "completed"])\
            .execute()

        # Aggregate counts
        claims_count = defaultdict(int)
        processed_count = defaultdict(int)

        for item in claims_res.data:
            date_str = item["created_at"].split("T")[0]
            claims_count[date_str] += 1
            
        for item in processed_res.data:
            date_str = item["updated_at"].split("T")[0]
            processed_count[date_str] += 1

        # Format for chart
        chart_data = []
        for date_str in date_labels:
            # Format label as "Mon", "Tue" etc.
            dt = datetime.fromisoformat(date_str)
            day_name = dt.strftime("%a") 
            
            chart_data.append({
                "name": day_name,
                "fullDate": date_str,
                "claims": claims_count[date_str],
                "processed": processed_count[date_str]
            })

        return chart_data

    except Exception as e:
        print(f"Error generating chart data: {e}")
        # Fallback to empty structure
        return []

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
