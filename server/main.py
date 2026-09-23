from fastapi import FastAPI
from routers.analysis import router

app = FastAPI()

app.include_router(router)