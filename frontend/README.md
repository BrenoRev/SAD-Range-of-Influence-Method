# RIM Frontend

Interface React + Vite para o método RIM (Reference Ideal Method) — Cables, Lamata & Verdegay (2016).

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Backend rodando em `http://localhost:8000` (ver `../backend/README.md`)

## Setup

```bash
pnpm install
```

## Desenvolvimento

```bash
# em um terminal: backend
cd ../backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# em outro: frontend
pnpm dev
# http://localhost:5173
```

O Vite proxia `/api/*` para `http://localhost:8000`. Não há CORS issue em dev.

## Geração de tipos do OpenAPI

Sempre que o schema Pydantic do backend mudar:

```bash
# garanta que o backend está rodando
pnpm run generate-types
```

Isso regenera `src/shared/types/api.ts` a partir de `http://localhost:8000/openapi.json`.

## Build

```bash
pnpm build
pnpm preview
```

## Convenções


- Feature-based em `src/features/{home,wizard,cases}` + `src/shared`.
- Named exports, sem `default export`.
- Tailwind com tokens (`bg-page`, `text-ink`, `text-accent`, ...). Sem hex no JSX.
- API só via hooks dedicados (`useCases`, `useSolve`, `useSensitivity`).
- Estado compartilhado entre os 4 steps → `WizardContext`. Estado local → `useState`.
- Persistência (somente input, não resultado) em `localStorage` chave `rim:lastDecision`.

## Referência

- DOI do artigo: [10.1016/j.ins.2015.12.011](https://doi.org/10.1016/j.ins.2015.12.011)
