# RIM — Reference Ideal Method

Aplicação web para apoio à decisão multicritério (MCDM) que implementa o **Reference Ideal Method** de Cables, Lamata & Verdegay (2016). Disciplina **CIN0192 — Sistemas de Apoio à Decisão**.

Monorepo com dois apps:

- **`backend/`** — API REST em FastAPI que expõe o algoritmo RIM e casos pré-carregados.
- **`frontend/`** — SPA em React + Vite que guia o usuário por um wizard de 4 etapas.

## Stack

| Camada    | Tecnologias                                                                     |
| --------- | ------------------------------------------------------------------------------- |
| Backend   | Python 3.11+, FastAPI, Pydantic v2, NumPy, pytest                               |
| Frontend  | React 18, TypeScript 5, Vite 5, Tailwind 3, react-router, zod, Recharts         |
| Contratos | OpenAPI gerado pelo FastAPI → tipos TS gerados via `openapi-typescript`         |

## Pré-requisitos

- Python **3.11+** (o script `dev.sh` usa `python3.13`, ajustar se necessário)
- Node.js **20+** e **pnpm**
- Porta **8000** livre (backend) e **5173** livre (frontend)

## Subir em um comando

Na raiz do projeto:

```bash
./dev.sh
```

Esse script:

1. Cria a venv do backend (`backend/.venv`) e instala `rim-backend[dev]` se ainda não existir.
2. Roda `pnpm install` no frontend se `node_modules` não existir.
3. Sobe os dois servidores em paralelo:
   - Backend → http://localhost:8000 (Swagger em `/docs`)
   - Frontend → http://localhost:5173
4. `Ctrl+C` derruba os dois.

## Subir manualmente

### Backend

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

Verificação rápida: `curl http://localhost:8000/health` deve responder `{"status":"ok"}`.

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Abrir http://localhost:5173. O Vite faz proxy de `/api/*` para `localhost:8000`, então o backend precisa estar de pé.

## Estrutura

```
.
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app + CORS
│   │   ├── api/routes.py       # endpoints /api/rim/* e /api/cases
│   │   └── rim/
│   │       ├── algorithm.py    # núcleo do RIM (cópia literal do paper)
│   │       ├── solver.py       # orquestração + payload de resposta
│   │       ├── schemas.py      # Pydantic — contrato com o frontend
│   │       └── cases.py        # casos pré-carregados
│   └── tests/                  # pytest, inclui regressão contra o §5 do paper
├── frontend/
│   └── src/
│       ├── app/                # bootstrap (router, providers)
│       ├── features/
│       │   ├── home/           # landing + cards de casos
│       │   ├── wizard/         # 4 steps + contexto + chamadas à API
│       │   └── cases/          # carga de caso pré-preenchido
│       └── shared/             # UI primitives, http, logger, tipos OpenAPI
└── dev.sh                      # sobe backend + frontend
```

## API

Quatro endpoints, todos sob `/api`:

| Método | Caminho                  | Descrição                                                     |
| ------ | ------------------------ | ------------------------------------------------------------- |
| GET    | `/api/cases`             | Lista resumida dos casos pré-carregados                       |
| GET    | `/api/cases/{case_id}`   | Caso completo (alternativas, critérios, pesos, matriz X)      |
| POST   | `/api/rim/solve`         | Aplica o RIM e devolve ranking + matrizes intermediárias      |
| POST   | `/api/rim/sensitivity`   | Varre o peso de um critério e devolve o R de cada alternativa |

Documentação interativa em http://localhost:8000/docs.

## Como funciona o wizard (frontend)

1. **Alternativas** — liste as opções que vão competir.
2. **Critérios** — para cada critério, informe `[A, B]` (faixa realista) e `[C, D]` (intervalo ideal), com `A ≤ C ≤ D ≤ B`. Tipos: Benefício, Custo ou Alvo.
3. **Pesos** — sliders 0–100 (bruto); a aplicação normaliza para somar 1 ao chamar o backend.
4. **Resultado** — matriz `X[alternativa × critério]`, pódio dos 3 primeiros, tabela completa, gráfico de R e painel de sensibilidade.

O estado do wizard é persistido em `localStorage` (`rim:lastDecision`). Não há banco — o backend é stateless.

## Testes

### Backend

```bash
cd backend && source .venv/bin/activate
pytest -v
```

`test_algorithm.py` valida o algoritmo contra o exemplo numérico do §5 do paper (réplica do artigo de Cables et al. — seleção de motorista) com tolerância `1e-4`. Esse teste é o canário do algoritmo — falhou, **não** faça release.

### Frontend

```bash
cd frontend
pnpm build       # tsc -b --noEmit + vite build
```

Não há suíte automatizada de UI; o critério de pronto é build verde + smoke test no navegador.

## Regenerar tipos do frontend

Quando schemas Pydantic do backend mudarem, com o backend rodando:

```bash
cd frontend && pnpm run generate-types
```

Isso reescreve `frontend/src/shared/types/api.ts` a partir do `openapi.json` em `:8000`.

## Referência

Cables, E., Lamata, M. T., & Verdegay, J. L. (2016). _RIM-reference ideal method in multicriteria decision making_. **Information Sciences**, 337–338, 1–10. [doi:10.1016/j.ins.2015.12.011](https://doi.org/10.1016/j.ins.2015.12.011)
