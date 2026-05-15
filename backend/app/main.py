from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ALLOWED_ORIGINS = [
    "http://localhost:5173",
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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
