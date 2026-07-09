# Ticket 19 — E2E do happy path de criar OV

- **Tipo:** `wayfinder:quality`
- **Bloqueado por:** 13 (bugs que tornam o teste flaky), 14b (regra de transporte autorizado implementada na UI)

## Questão

A spec CONTEXT.md exige "criar OV" como funcionalidade. O projeto tem testes E2E para RBAC e para carregar detalhes, mas **não tem** um teste E2E do happy path de criar OV. O teste atual em `e2e/rbac.spec.ts:35` só verifica que o formulário carrega sem erro de JS, não que o submit funciona.

Este ticket fecha o gap: Playwright test que exercita o fluxo completo.

## Restrições YAGNI

- `🐴` Sem nova dependência — usar o que já está configurado em `playwright.config.ts`
- `🐴` Sem mock — usar o `webServer` que sobe a api real (`server.cjs`)

## Cenários de aceitação

- [ ] `e2e/ov-create.spec.ts` criado
- [ ] **Cenário:** loga como `admin`, navega a `/ovs/nova`, seleciona cliente válido (Alpha), seleciona transporte autorizado (1), adiciona 1 item (Parafuso M10, quantidade 100), submete
- [ ] Assert: redirect para `/ovs/:id`, status inicial `CRIADA`, número da OV presente, valor total = 100 × 0.5 = 50
- [ ] Doc drift corrigido no `README.md` e `MAP.md` ao final (atualizar contagem para 8 E2E)

## Notas

- **Por que depende de 13:** sem os bug fixes (error messages, validate race, hooks), o teste vira flaky porque não dá pra confiar nos erros inline nem na navegação após submit.
- **Por que depende de 14b:** sem o dropdown dependente, o teste pode acabar pegando um transporte não autorizado por accidente e bater 400. Com 14b, o transporte 1 está garantidamente autorizado para Alpha (seed).
- Considerar usar `playwright`'s `page.locator('form').locator(...)` em vez de `getByLabel` se o html helper text quebrar a associação.
- A `idempotencyKey` gerada pelo `OVNew` é por submit — não precisa mockar.

## Resolução

_a preencher ao fechar o ticket_