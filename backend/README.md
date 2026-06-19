# RIM Backend (FastAPI)

API REST que implementa o **Reference Ideal Method** (RIM) de Cables, Lamata & Verdegay (2016). Stateless — cada request carrega o problema inteiro.

## Stack

- Python 3.11+
- FastAPI 0.115+
- Pydantic 2.x
- NumPy 1.26+
- pytest 8.x (dev)

## Instalação

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Rodar

```bash
uvicorn app.main:app --reload --port 8000
```

- Swagger UI: <http://localhost:8000/docs>
- Redoc: <http://localhost:8000/redoc>
- Healthcheck: <http://localhost:8000/health>

## Endpoints

| Método | Path | Descrição |
|---|---|---|
| GET  | `/health` | Healthcheck simples |
| POST | `/api/rim/solve` | Recebe `DecisionInput`, retorna `DecisionResult` |
| POST | `/api/rim/sensitivity` | Varre o peso de um critério em N pontos |
| GET  | `/api/cases` | Lista os casos pré-carregados |
| GET  | `/api/cases/{id}` | Retorna o input completo de um caso |

## Testes

```bash
pytest -v
```

## Estrutura

```
app/
├── main.py                  # FastAPI app + CORS + montagem das rotas
├── rim/
│   ├── algorithm.py         # f_rim + rim
│   ├── schemas.py           # Pydantic v2: DecisionInput, DecisionResult, ...
│   ├── solver.py            # camada fina: DecisionInput → rim() → DecisionResult
│   └── cases.py             # casos pré-carregados (article-replication, supplier)
└── api/
    └── routes.py            # endpoints REST
tests/
├── test_algorithm.py
├── test_schemas.py
└── test_routes.py
```