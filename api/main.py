from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials in environment variables")

supabase: Client = create_client(supabase_url, supabase_key)

# Define request model
class KYCStatusUpdate(BaseModel):
    user_address: str
    status: str
    updated_at: Optional[datetime] = None

@app.post("/kyc/status")
async def update_kyc_status(status_update: KYCStatusUpdate):
    try:
        # Check if user exists
        response = supabase.table("kyc_requests").select("*").eq("user_address", status_update.user_address).execute()
        
        data = {
            "status": status_update.status,
            "updated_at": status_update.updated_at.isoformat() if status_update.updated_at else datetime.utcnow().isoformat()
        }
        
        if not response.data:
            # Insert new record
            data["user_address"] = status_update.user_address
            result = supabase.table("kyc_requests").insert(data).execute()
        else:
            # Update existing record
            result = supabase.table("kyc_requests").update(data).eq("user_address", status_update.user_address).execute()
        
        return {
            "success": True,
            "message": "KYC status updated successfully",
            "data": result.data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/kyc/status/{user_address}")
async def get_kyc_status(user_address: str):
    try:
        response = supabase.table("kyc_requests").select("*").eq("user_address", user_address).execute()
        
        if not response.data:
            return {
                "success": True,
                "data": {
                    "user_address": user_address,
                    "status": "NOT_SUBMITTED"
                }
            }
        
        return {
            "success": True,
            "data": response.data[0]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)