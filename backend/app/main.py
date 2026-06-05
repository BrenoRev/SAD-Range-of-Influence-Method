from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

# Origens liberadas no CORS: o front rodando local no Vite (porta 5173) e o
# domínio de produção. allow_credentials fica False porque a API é stateless —
# não há cookies nem sessão para carregar entre requests.
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
    # Healthcheck cru de infra, fora do prefixo /api, para load balancer e
    # monitor baterem sem depender do roteador da aplicação. O par tipado vive
    # em /api/health (routes.py).
    return {"status": "ok"}
