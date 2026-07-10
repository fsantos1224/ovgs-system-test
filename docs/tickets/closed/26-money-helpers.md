# Ticket 26 — Money helpers (BRL display + parser)

- **Tipo:** `wayfinder:task`
- **Bloqueado por:** Nenhum

## Questão

Inputs e displays monetários hoje não têm máscara explícita. `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` resolve o display mas não cobre o caminho inverso (parsear "R$ 1.500,00" → cents para futura inserção manual). Schema atual armazena em **centavos (inteiro)** — display correto, input via `type="number"` continua funcionando.

Adicionar helper `parseBRLtoCents()` como utility forward-looking para quando forms com input decimal forem introduzidos.

## Restrições YAGNI

- Só `parseBRLtoCents(str): number | null` — não criar `formatBRLDisplay` (já coberto por `Intl`)
- Sem lib (`currency.js`, `dinero.js`) — regex + aritmética cobrem
- Sem migração de schema para decimal — schema continua inteiro

## Cenários de aceitação

- [ ] `src/lib/money.ts` com `parseBRLtoCents(str: string): number | null`
- [ ] Helper aceita `R$ 1.500,00`, `1.500,00`, `150000` (cents), `1500.00` (decimal com `.`) e retorna `150000` ou `null` para input inválido
- [ ] Helper cobre separador de milhar (`.`) e decimal (`,`) pt-BR
- [ ] Unit test em `src/lib/money.test.ts` com 8 cenários (válidos + inválidos + edge cases)
- [ ] Doc drift (README + MAP) se houver

## Notas

- Decisão de **não** criar `<MoneyInput>`: schema atual em centavos + input `type="number"` cobre todos os fluxos editáveis. Componente só faz sentido se o schema virar decimal (out de scope).
- Helper coberto por unit test puro (regex + parse) — sem DOM/network.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**Evidência no código:**

- `src/lib/money.ts:1-30` — `parseBRLtoCents(input: string): number | null`
- Aceita: `R$ 1.500,00`, `1.500,00`, `1500,00`, `R$ 0,99`, `1500` (cents), `1500.00`, espaços extras
- Rejeita: vazio, caracteres não-numéricos, 3+ casas decimais, separadores de milhar múltiplos (`1.500.00,00`)
- Parse via string split (evita float imprecision em `Math.round(0.1*100)`)
- `src/lib/money.test.ts:1-40` — 8 cenários cobrindo: BRL prefixado, sem prefixo, sem milhar, decimal com `.`, inteiro puro, espaços extras, inválidos, casas decimais >2

**Verificação:** `npm test` → **36/36** passando (9 unit types + **8 unit money** + 19 integration).
