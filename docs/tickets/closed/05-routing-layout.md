# Ticket 5 — Routing e Layout

- **Tipo:** `wayfinder:prototype`
- **Bloqueado por:** Ticket 1 - Stack Frontend

## Questão

Como estruturar as rotas e layouts (React Router v6) para Gestão de OVs, Monitoramento Operacional, Central de Agendamento e Cadastros (Clientes, Transportes, Itens)?

## O que precisa de ser prototipado

- Árvore de rotas completa
- Layouts partilhados (sidebar, header, footer)
- Lazy loading de páginas (React.lazy + Suspense)
- Página 404

## Páginas esperadas

- `/` — Dashboard / monitoramento operacional
- `/ovs` — Listagem de OVs com filtros
- `/ovs/:id` — Detalhe da OV
- `/ovs/nova` — Criação de OV
- `/agendamento` — Central de agendamento
- `/cadastros/clientes` — CRUD clientes
- `/cadastros/transportes` — CRUD tipos de transporte
- `/cadastros/itens` — CRUD itens
- `/auditoria` — Timeline de eventos

## Notas

- React Router v6 (BrowserRouter, Routes, Route, Outlet, NavLink)
- Code-splitting via `React.lazy()` + `Suspense` — performance de loading inicial

## Resolução

_[a preencher quando resolvido]_
