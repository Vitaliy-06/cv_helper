from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.analysis import router
from limiter import limiter

app = FastAPI()

# Rate Limit
app.state.limiter = limiter 

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["Content-Type"]
)

# Endpoints
app.include_router(router)