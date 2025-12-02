from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from agno.agent import Agent
from agno.models.google import Gemini
from agno.team import Team
from agno.tools.serper import SerperTools
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

class ResearchRequest(BaseModel):
    destination: str
    budget: float
    days: int

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

class HotelOption(BaseModel):
    name: str
    price_per_night: float
    rating: str
    location: str
    amenities: List[str]

class TransportOption(BaseModel):
    type: str
    price_per_day: float
    capacity: str
    description: str

class MarketResearchResponse(BaseModel):
    hotels: List[HotelOption]
    transport: List[TransportOption]
    summary: str

# --- Agents ---
search_tool = SerperTools(api_key=os.getenv("SERPER_API_KEY"))

weather_agent = Agent(
    id='weather_agent',
    model=Gemini(id="gemini-2.5-flash"),
    instructions=[
        "You are a weather information specialist.",
        "Provide current weather details for the user's chosen destination on each date mentioned.",
        "Include temperature, conditions, and any relevant forecasts.",
    ],
    tools=[search_tool],
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

hotel_search_agent = Agent(
    id='hotel_search_agent',
    model=Gemini(id="gemini-2.5-flash"),
    instructions=[
        "You are a hotel market researcher.",
        "Find 3 real, currently operating hotels in the specified destination.",
        "For each hotel, find the approximate price per night for the current season.",
        "Include rating, location, and key amenities.",
        "Ensure the hotels fit within the user's overall budget context.",
    ],
    tools=[search_tool],
    markdown=True,
)

transport_search_agent = Agent(
    id='transport_search_agent',
    model=Gemini(id="gemini-2.5-flash"),
    instructions=[
        "You are a local transport expert.",
        "Find 2-3 common transport options for tourists in the destination (e.g., Private Cab, Luxury Sedan, Van).",
        "Estimate the daily rental cost including driver.",
        "Specify capacity and brief description.",
    ],
    tools=[search_tool],
    markdown=True,
)

# --- Teams ---

itinerary_team = Team(
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

research_team = Team(
    name='Market Research Team',
    members=[hotel_search_agent, transport_search_agent],
    model=Gemini(id="gemini-2.5-flash"),
    instructions=[
        "You are a Market Research Lead.",
        "Your goal is to find real-world options for Hotels and Transport in the destination.",
        "Delegate to hotel_search_agent to find 3 hotels.",
        "Delegate to transport_search_agent to find transport options.",
        "Combine the findings into a structured MarketResearchResponse.",
    ],
    output_schema=MarketResearchResponse,
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
        response = itinerary_team.run(prompt)
        
        if response and response.content:
             return response.content
        else:
             raise HTTPException(status_code=500, detail="Failed to generate itinerary")

    except Exception as e:
        print(f"Error generating itinerary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/research")
async def research_market(request: ResearchRequest):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            prompt = (
                f"Find real hotel and transport options for a trip to {request.destination}. "
                f"The total trip budget is {request.budget} for {request.days} days. "
                "Provide 3 specific hotel options and 2-3 transport types with current estimated prices."
            )

            response = research_team.run(prompt)

            if response and response.content:
                return response.content
            else:
                print(f"Attempt {attempt + 1} failed: No content in response")
        except Exception as e:
            print(f"Attempt {attempt + 1} error: {e}")
            if attempt == max_retries - 1:
                raise HTTPException(status_code=500, detail=f"Failed to research market after {max_retries} attempts: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
