# Ticket 32 — Dark accent: Amber/Gold → Blue

- **Tipo:** `wayfinder:design`
- **Bloqueado por:** Nenhum

## Questão

Dark theme atual usa Amber/Gold `#f59e0b` como accent (links, hover states, focus rings, KPIs numéricos, navegação ativa). Stakeholder pediu alinhamento com tom de azul corporativo. Badges de status (CRIADA/PLANEJADA/AGENDADA/EM_TRANSPORTE/ENTREGUE) permanecem com cores semânticas (amber, sky, emerald, purple, zinc).

Migração é exclusiva em tokens do `@theme` do Tailwind v4 em `src/index.css`. Light theme já usa Sky (azul corporativo) — não muda.

## Restrições YAGNI

- `🐴` Sem renomear token `--color-accent`
- `🐴` Sem mexer no light theme
- `🐴` Sem alterar badges (`bg-amber-950/30`, `bg-sky-50` etc.) — semânticos

## Cenários de aceitação

- [ ] `src/index.css:@theme`: `--color-accent` `#f59e0b` → `#3b82f6` (blue-500)
- [ ] `--color-accent-soft` `rgb(245 158 11 / 0.15)` → `rgb(59 130 246 / 0.15)`
- [ ] `--color-on-accent` `#000000` → `#ffffff` (contraste com Blue-500 precisa de texto branco)
- [ ] `grep -r "f59e0b" src/` retorna apenas usos semânticos (badges), não como accent primário
- [ ] `grep -r "amber-500\|amber-600" src/` retorna apenas badges semânticos (status CRIADA/PLANEJADA)
- [ ] Visual smoke: dark theme agora predominantemente azul em ações (hover de botão, KPI numbers, focus rings)
- [ ] `docs/DESIGN.md` seção 2.1.1 atualizada com a nova paleta
- [ ] Screenshots dark + light anexados à Resolução do ticket (para review visual)
- [ ] Build OK sem warnings

## Notas

- Tokens semânticos (`--color-canvas`, `--color-surface`, `--color-text` etc.) **não mudam** — apenas accent e accent-soft.
- Light theme mantém `#0EA5E9` (sky-500) já em uso — coerente com brand.
- Crítico: `--color-on-accent` muda de preto para branco. Blue-500 não passa contraste AA com texto preto.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**Evidência no código:**
- `src/index.css:18-20` — `--color-accent: #3b82f6` (Blue-500), `--color-accent-soft: rgb(59 130 246 / 0.15)`
- `src/index.css:27` — `--color-on-accent: #ffffff` (blue-500 precisa de texto branco para contraste AA)
- `docs/DESIGN.md:24` — paleta documentada com nota sobre badges semânticas preservadas

**Verificação:**
- `npm run build` → 19 chunks gerados, sem warnings
- Badge colors semânticos intactos: `bg-amber-950/30` (CRIADA/PLANEJADA), `bg-sky-50` (AGENDADA), `bg-emerald-950/30` (ENTREGUE) — preservados
- Dark theme: hover de botões primários, focus rings, KPI numbers, link hover agora usam Blue-500
- Light theme: inalterado (`#0EA5E9` Sky)
