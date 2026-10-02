from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.analysis import router
from limiter import limiter
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# Rate Limit
app.state.limiter = limiter 

# CORS
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["Content-Type"]
)

# Endpoints
app.include_router(router)