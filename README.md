# RIM — Reference Ideal Method

Aplicação web para apoio à decisão multicritério (MCDM) que implementa o **Reference Ideal Method** de Cables, Lamata & Verdegay (2016). Disciplina **CIN0192 — Sistemas de Apoio à Decisão**.

Monorepo com dois apps:

- **`backend/`** — API REST em FastAPI que expõe o algoritmo RIM e casos pré-carregados.
- **`frontend/`** — SPA em React + Vite que guia o usuário por um wizard de 4 etapas.

## Ambiente de produção

| Recurso  | URL                                  |
| -------- | ------------------------------------ |
| Frontend | https://rim.brenodev.software/       |
| Backend  | https://rim.brenodev.software/api    |
| Docs (Swagger) | https://rim.brenodev.software/docs |

## Stack

| Camada    | Tecnologias                                                                     |
| --------- | ------------------------------------------------------------------------------- |
| Backend   | Python 3.11+, FastAPI, Pydantic v2, NumPy, pytest                               |
| Frontend  | React 18, TypeScript 5, Vite 5, Tailwind 3, react-router, zod, Recharts         |
| Contratos | OpenAPI gerado pelo FastAPI → tipos TS gerados via `openapi-typescript`         |

## Pré-requisitos

- **Python 3.11+** — o `./dev.sh` chama `python3.13` explicitamente. Sem ele, use o caminho manual (que usa o `python3` padrão) ou instale o Python 3.13.
- **Node.js 20+** e **pnpm**. Se ainda não tiver o pnpm: `corepack enable` (já vem com o Node 20+) ou `npm i -g pnpm@10.14.0` (versão usada na CI).
- Porta **8000** livre (backend) e **5173** livre (frontend).

## Clonar

```bash
git clone https://github.com/BrenoRev/SAD-Range-of-Influence-Method.git
cd SAD-Range-of-Influence-Method
```

## Subir em um comando

Na raiz do projeto:

```bash
./dev.sh
```

> Se aparecer `python3.13: command not found`, instale o Python 3.13 ou use a seção [Subir manualmente](#subir-manualmente) (que usa o `python3` padrão). Mais em [Solução de problemas](#solução-de-problemas).

Esse script:

1. Cria a venv do backend (`backend/.venv`) e instala `rim-backend[dev]` se ainda não existir.
2. Roda `pnpm install` no frontend se `node_modules` não existir.
3. Sobe os dois servidores em paralelo:
   - Backend → http://localhost:8000 (Swagger em `/docs`)
   - Frontend → http://localhost:5173
4. `Ctrl+C` derruba os dois.

## Subir manualmente

**Use dois terminais.** O `uvicorn --reload` ocupa o terminal enquanto roda — deixe o backend no **terminal 1** e suba o frontend no **terminal 2**.

### Backend (terminal 1)

```bash
cd backend
python3 -m venv .venv          # precisa ser Python 3.11+
source .venv/bin/activate      # Windows (PowerShell): .venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

Verificação rápida (em outro terminal): `curl http://localhost:8000/health` deve responder `{"status":"ok"}`.

### Frontend (terminal 2)

```bash
cd frontend
pnpm install
pnpm dev
```

Abrir http://localhost:5173 — você deve ver a Home com os cards dos casos pré-carregados. O Vite faz proxy de `/api/*` para `localhost:8000`, então o backend precisa estar de pé.

## Solução de problemas

| Sintoma | Causa provável → correção |
| ------- | ------------------------- |
| `python3.13: command not found` ao rodar `./dev.sh` | O script fixa o Python 3.13. Instale-o ou use [Subir manualmente](#subir-manualmente), que usa o `python3` padrão (3.11+). |
| `pnpm: command not found` | Habilite o pnpm: `corepack enable` (vem com o Node 20+) ou `npm i -g pnpm@10.14.0`. |
| Porta **8000** ou **5173** já em uso | Mate o processo que a ocupa (`lsof -ti:8000 \| xargs kill`) ou libere a porta antes de subir. |
| Frontend abre mas fica sem dados / erro de rede | O backend não está de pé. Suba o `uvicorn` primeiro — o proxy do Vite aponta para `:8000`. |
| `pnpm run generate-types` falha | O backend precisa estar rodando em `:8000` (o comando lê `/openapi.json`). |
| **Windows:** `./dev.sh` não roda | É um script bash. Rode via **WSL** ou **Git Bash**, ou suba os dois serviços manualmente (seção acima). |

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

`test_algorithm.py` valida o algoritmo contra o exemplo numérico do §5 do paper (notebook de Cables et al.) com tolerância `1e-4`. Esse teste é o canário do algoritmo — falhou, **não** faça release.

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
