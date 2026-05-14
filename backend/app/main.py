from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://rim.brenodev.software",
]

app = FastAPI(
    title="RIM API",
    version="0.1.0",
    description="Reference Ideal Method — Cables, Lamata & Verdegay (2016).",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
