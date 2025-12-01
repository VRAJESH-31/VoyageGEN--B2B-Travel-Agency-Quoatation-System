from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from agno.agent import Agent
from agno.models.google import Gemini
from agno.team import Team
from agno.tools.duckduckgo import DuckDuckGoTools
import os
import json

load_dotenv()

app = FastAPI()

# --- Data Models ---

class GenerateRequest(BaseModel):
    destination: str
    budget: float
    days: int
    start_date: str

class WeatherSchema(BaseModel):
    temperature: float
    conditions: str
    forecast: str

class DayItinerary(BaseModel):
    day: str
    activities: List[str]
    approximate_cost: float
    weather_details: WeatherSchema

class PredictionSchema(BaseModel):
    ai_reply: str
    suggested_destinations: List[str]
    Activities: List[str]
    DayWiseItinerary: Dict[str, DayItinerary]
    estimated_cost: float
    hotel_details: Optional[Dict[str, Any]]

# --- Agents ---

weather_agent = Agent(
    id='weather_agent',
    model=Gemini(id="gemini-2.5-flash"),
    instructions=[
        "You are a weather information specialist.",
        "Provide current weather details for the user's chosen destination on each date mentioned.",
        "Include temperature, conditions, and any relevant forecasts.",
    ],
    tools=[DuckDuckGoTools()],
    markdown=True,
)

prediction_agent = Agent(
    id='prediction_agent',
    model=Gemini(id="gemini-2.5-flash"),
    instructions=[
        "You are a travel itinerary expert.",
        "Based on the destination and budget provided:",
        "1. Suggest must-visit cities in that country/region",
        "2. Create a detailed day-by-day itinerary with specific activities",
        "3. Include approximate costs for each day's activities",
        "4. Ensure the total cost stays within the user's budget",
        "5. Make the itinerary practical and enjoyable",
        "Present the itinerary in a clear, organized format with daily activities and costs.",
    ],
    markdown=True,
)

team = Team(
    name='Travel Planning Team',
    members=[prediction_agent, weather_agent],
    model=Gemini(id="gemini-2.5-flash"),
    instructions=[
        "You coordinate a travel planning team.",
        "First, use the weather_agent to check the weather for the trip dates.",
        "Then, use the prediction_agent to create a detailed itinerary based on the destination, budget, and weather.",
        "Ensure the output matches the PredictionSchema structure.",
    ],
    output_schema=PredictionSchema,
    use_json_mode=True,
)

# --- Endpoints ---

@app.post("/generate")
async def generate_itinerary(request: GenerateRequest):
    try:
        # Construct the prompt for the team
        prompt = (
            f"Plan a trip to {request.destination} for {request.days} days, "
            f"starting on {request.start_date}. "
            f"The budget is {request.budget}. "
            "Please provide a detailed day-wise itinerary with weather forecasts."
        )

        # Run the team
        response = team.run(prompt)
        
        # The response from team.run() with output_schema should be a RunResponse object
        # We need to extract the content which should be the Pydantic model or dict
        
        if response and response.content:
             # Depending on agno version, content might be the object or a string
             return response.content
        else:
             raise HTTPException(status_code=500, detail="Failed to generate itinerary")

    except Exception as e:
        print(f"Error generating itinerary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
