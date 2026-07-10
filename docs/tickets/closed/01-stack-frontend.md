# Ticket 1 — Stack Frontend

- **Tipo:** `wayfinder:grilling`
- **Bloqueado por:** _(nenhum — raiz)_

## Questão

Confirmar e justificar a stack base: React 18 + Vite 5 + TypeScript (strict) + React Router v6 + Tailwind CSS. Considerar se React 19 ou Vite 6 trazem algo relevante para um backoffice CRUD.

## Restrições

- YAGNI: não adicionar nada que o standard library ou uma linha de código resolva.
- Stack deve ser executável com `npm install && npm run dev` sem configurações complexas.
- json-server é a única dependência externa para mocks — já confirmado no MAP.md.

## Resolução

Stack confirmada e implementada:

- **React 18.3** + **Vite 5.4** + **TypeScript 5.6 (strict)** — create-vite não usado (diretório não vazio), config manual
- **React Router v6** — BrowserRouter com 8 rotas (Dashboard, OVList, OVDetail, OVNew, Agendamento, Clientes, Transportes, Itens)
- **Tailwind CSS 3.4** — postcss.config.js + tailwind.config.js padrão
- **json-server 0.17** — mock API com 5 endpoints (clientes, tiposTransporte, itens, ordensVenda, eventosAuditoria)
- **concurrently** — `dev:full` roda Vite + json-server em paralelo

Estrutura de pastas criada:

```
src/
├── domain/types.ts
├── api/fetch.ts
├── hooks/useFetch.ts + usePermission.ts
├── layouts/AppLayout.tsx
├── pages/ (8 páginas)
├── components/ (vazio — para próximos tickets)
├── App.tsx
└── main.tsx
```

Dados mock: 3 clientes, 3 transportes, 5 itens, 3 OVs (rascunho, confirmada, em_transporte), 3 eventos de auditoria.

### Decisões

- `as const` no array de transições para evitar widening de string literal no TypeScript strict
- RBAC hardcoded como objeto — sem Context/Provider (YAGNI até vir da API)
- fetch wrapper minimalista sem axios — `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`
- `useFetch` hook genérico com refreshKey pattern (sem TanStack Query)
