# Flow — Implementação do RIM (Reference Ideal Method)

Esta pasta contém o **contexto autoritativo** para implementar a aplicação web do RIM ponta-a-ponta. Cada arquivo é autocontido e pode ser lido isolado, mas todos pressupõem familiaridade com [../RIM_contexto_agente.md](../RIM_contexto_agente.md), que é a fonte da verdade do algoritmo.

## Resumo do projeto

Aplicação web completa que **replica e estende** o método RIM de Cables, Lamata & Verdegay (2016) — DOI 10.1016/j.ins.2015.12.011. Permite que um usuário não-técnico defina alternativas, critérios (com intervalos ideais), pesos e obtenha um ranking justificado. Extensão sobre o artigo: **análise de sensibilidade ao vivo** (sliders que alteram pesos e recalculam o ranking em tempo real) e **3 casos pré-carregados** para onboarding (1 réplica do artigo + notebook + fornecedor).

**Stack:** monorepo com FastAPI (backend) + React 18 + Vite + shadcn/ui + Tailwind (frontend). Persistência stateless (localStorage no cliente).

## Ordem de leitura

| # | Arquivo | Quando ler |
|---|---|---|
| 0 | [../RIM_contexto_agente.md](../RIM_contexto_agente.md) | **Sempre antes de tudo.** É a definição matemática do método. |
| 1 | [01_arquitetura.md](01_arquitetura.md) | Para ter a visão de alto nível antes de mergulhar em backend ou frontend. |
| 2 | [02_backend_fastapi.md](02_backend_fastapi.md) | Antes de codar qualquer coisa em `backend/`. |
| 3 | [03_frontend_react.md](03_frontend_react.md) | Antes de codar qualquer coisa em `frontend/`. |
| 4 | [04_claude_design_prompt.md](04_claude_design_prompt.md) | Para gerar o design no Claude Design (copiar-e-colar). |
| 5 | [05_casos_precarregados.md](05_casos_precarregados.md) | Quando for popular `backend/app/rim/cases.py`. |
| 6 | [06_claude_md_backend.md](06_claude_md_backend.md) | Para criar `backend/CLAUDE.md`. |
| 7 | [07_claude_md_frontend.md](07_claude_md_frontend.md) | Para criar `frontend/CLAUDE.md`. |
| 8 | [08_agente_rim_dev.md](08_agente_rim_dev.md) | Para registrar o subagente em `~/.claude/agents/rim-dev.md`. |
| 9 | [09_deploy.md](09_deploy.md) | Para publicar em `rim.brenodev.software` (Nginx + PM2/uvicorn + Certbot). |

## Quem precisa ler o quê

| Papel | Leitura obrigatória |
|---|---|
| Dev backend | 0, 1, 2, 5, 6, 9 |
| Dev frontend | 0 (§1-§4), 1, 3, 5, 7, 9 |
| Designer (via Claude Design) | 4 |
| Subagente `rim-dev` (Claude Code) | 0, 1, 2, 3, 5, 9 — carregar todos no system prompt |
| Operador/deploy | 1, 9 + [../server/servidor-brenodev.md](../server/servidor-brenodev.md) |
| Avaliador da disciplina | Este README + [01_arquitetura.md](01_arquitetura.md) |

## Decisões fechadas (não reabrir sem motivo forte)

- Monorepo único: `backend/` + `frontend/` na raiz.
- Sem banco de dados. Stateless no backend, `localStorage` no frontend.
- Extensão sobre o artigo: **análise de sensibilidade** + **3 casos pré-carregados**.
- Wizard de 4 passos: Alternativas → Critérios → Pesos → Resultado.
- Estética: Linear.app (neutro, sem gradientes, sem patterns de IA).
- Componentes: shadcn/ui + Tailwind.
- Export: CSV (papaparse) + PDF (jspdf).
- Deploy: `rim.brenodev.software` no VPS pessoal — Nginx + PM2 (uvicorn) + Certbot. Frontend usa **pnpm** no servidor.

## Princípio inegociável

A implementação do algoritmo em [../RIM_contexto_agente.md](../RIM_contexto_agente.md) §6 (Python canônico) é **cópia fiel**. Nenhuma reescrita "para ficar mais limpo". A validação contra a saída esperada em §5 (tolerância 1e-4) é a definição de "funciona".
