from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"

from fastapi import FastAPI

app = FastAPI(title="CeylonPlanX API")

# To CORS Enable for Connect With React Frontend 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model Load
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "tourism_rf_model.pkl")
model = joblib.load(MODEL_PATH)

class PredictionInput(BaseModel):
    SmartTech: float
    ClimateSeason: float
    Economics: float
    CultureWellness: float
    SocialMedia: float
    Transport: float
    Political_Safety: float

@app.post("/api/predict")
def predict_travel_season(data: PredictionInput):
    df_input = pd.DataFrame([[
        data.SmartTech,
        data.ClimateSeason,
        data.Economics,
        data.CultureWellness,
        data.SocialMedia,
        data.Transport,
        data.Political_Safety
    ]], columns=['SmartTech', 'ClimateSeason', 'Economics', 'CultureWellness', 'SocialMedia', 'Transport', 'Political_Safety'])

    pred_class = int(model.predict(df_input)[0])

    seasons = {
        1: {
            "title": "Peak Season (December - March)",
            "subtitle": "West & South Coast Paradise",
            "description": "Ideal for sunny beaches in Mirissa, Bentota, and Galle, safari in Yala, and whale watching.",
            "weather": "29°C · Warm & Sunny"
        },
        2: {
            "title": "East Coast Season (May - August)",
            "subtitle": "Eastern Horizon & Surfing",
            "description": "Best for surfing in Arugam Bay, calm waters in Pasikudah, and cultural tours in Trincomalee.",
            "weather": "31°C · Coastal Breeze"
        },
        3: {
            "title": "Shoulder Season (April & Sept - Nov)",
            "subtitle": "Culture & Budget Escape",
            "description": "Lesser crowds, lower hotel tariffs, perfect for Kandy, Ella, and peaceful hill country retreats.",
            "weather": "25°C · Mist & Greenery"
        }
    }

    return {
        "season_class": pred_class,
        "recommendation": seasons.get(pred_class, seasons[1])
    }