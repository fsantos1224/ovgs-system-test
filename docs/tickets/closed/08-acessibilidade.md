# Ticket 8 — a11y: HTML semântico + ARIA + Tailwind

- **Tipo:** `wayfinder:prototype`
- **Bloqueado por:** Ticket 5 — Routing e Layout, Ticket 6 — RBAC

## Questão

Como garantir acessibilidade (WCAG 2.1 AA) no sistema XPTO usando **apenas HTML semântico, atributos ARIA e Tailwind CSS** — sem shadcn/ui, Radix, Headless UI ou lib de componentes?

## Restrições YAGNI

- `🐴` Nada de design system — HTML semântico (button, nav, table, form, h1-h6, main, aside) + atributos ARIA
- Tailwind para estilos, com focus-visible, color contrast, etc. — nativo do Tailwind
- Sem Axe-core como dependência (apenas ferramenta de auditoria)
- Keyboard-first flows para criação de OV e agendamento

## O que precisa de ser decidido

- Padrão de componentes acessíveis (Button, Input, Select, Modal, Table)
- Estratégia de cor e contraste (Tailwind color palette default já suficiente)
- Foco e navegação por teclado (TabIndex, skip-to-content link)
- Mensagens de erro acessíveis (aria-live, aria-invalid, aria-describedby)
- RBAC e UI condicional: itens escondidos não devem ser focáveis por teclado

## Resolução

_[a preencher quando resolvido]_
