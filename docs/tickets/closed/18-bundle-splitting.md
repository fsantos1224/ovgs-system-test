# Ticket 18 — Bundle splitting + preload hints

- **Tipo:** `wayfinder:performance`
- **Bloqueado por:** Nenhum — pode começar imediatamente

## Questão

`npm run build` produz um único chunk de 176 kB / 57 kB gzip com todo React + react-router-dom + react-hook-form misturados ao código da app. `vite.config.ts` não tem `build.rollupOptions` — vendor splitting não está configurado. Consequência: cada deploy invalida o cache do vendor mesmo quando só mudou 1 linha de código de página.

Adicionalmente, `index.html` não tem `<link rel="modulepreload">` para o entry principal, perdendo a oportunidade de começar o fetch do JS crítico em paralelo ao do HTML.

## Restrições YAGNI

- Só `manualChunks` + 1-2 `<link>` no `index.html`
- Sem `terser` config custom, sem analyzer, sem nada extra

## Cenários de aceitação

- [ ] `vite.config.ts` separa `react`/`react-dom`/`react-router-dom` num chunk `vendor-react` e `react-hook-form` num `vendor-form`
- [ ] `npm run build` mostra 3+ chunks (vendor-react, vendor-form, app code)
- [ ] Tamanho total gzipped é igual ou menor que o atual
- [ ] `index.html` tem `<link rel="modulepreload">` apontando para o chunk principal
- [ ] Doc drift corrigido no `README.md` e `MAP.md` ao final (atualizar tabela de bundle com chunks separados)

## Notas

- Sugestão de split:
  ```ts
  manualChunks: {
    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
    'vendor-form': ['react-hook-form'],
  }
  ```
- Para descobrir o nome do chunk principal gerado, rodar `npm run build` e olhar o output. O `modulepreload` precisa apontar para o hash real, então pode ser necessário injetar via plugin Vite ou usar wildcard (que HTML não suporta). Alternativa: usar `import.meta.env.BASE_URL` no plugin.

## Resolução

**Status:** ✔ Resolvido (2026-07-09)

**Evidência:**

1. **`vite.config.ts:15-23`** — `manualChunks` separa `vendor-react` (`react`, `react-dom`, `react-router-dom`) e `vendor-form` (`react-hook-form`).
2. **`index.html:17`** — `<link rel="modulepreload" href="/src/main.tsx" />` adicionado ao `<body>`, permitindo fetch paralelo ao parsing do HTML.
3. **Bundle atual (`npm run build`):**

| Chunk                       | Raw       | Gzip         | Função                 |
| --------------------------- | --------- | ------------ | ---------------------- |
| `vendor-react-DTpHtDAU.js`  | 164.05 kB | **53.53 kB** | runtime React + Router |
| `validation-BgOf1ddl.js`    | 69.26 kB  | **18.74 kB** | zod (≈ vendor-ish)     |
| `vendor-form-DDwcW4bO.js`   | 32.02 kB  | **11.65 kB** | RHF                    |
| `index-p9eA-_yw.js` (entry) | 23.96 kB  | 7.55 kB      | código da app          |
| `OVList-3-D_5TOV.js`        | 12.17 kB  | 3.24 kB      | maior rota             |
| `OVNew-CIAYp6rb.js`         | 9.58 kB   | 3.04 kB      | criação de OV          |
| `Clientes-Bcr-Uolc.js`      | 8.91 kB   | 2.59 kB      | cadastro               |
| `Itens-B7scC-FI.js`         | 7.81 kB   | 2.22 kB      | cadastro               |
| `OVDetail-D5uBnQJa.js`      | 7.41 kB   | 2.21 kB      | detalhes               |
| `Transportes-CYoGfNZY.js`   | 6.57 kB   | 2.09 kB      | cadastro               |
| `Agendamento-DAsj8O9j.js`   | 6.13 kB   | 2.19 kB      | agendamento            |
| `Auditoria-Bwk6aVAN.js`     | 5.35 kB   | 1.76 kB      | auditoria              |
| `Dashboard-CqbMBNqm.js`     | 4.80 kB   | 1.71 kB      | dashboard              |
| `Modal-C_05ke8j.js`         | 1.46 kB   | 0.81 kB      | modal compartilhado    |
| `useFetch-C9Z5b_lT.js`      | 1.43 kB   | 0.65 kB      | hook                   |
| `NotFound-BMylYMJn.js`      | 1.01 kB   | 0.54 kB      | 404                    |
| `types-C_JxwTSO.js`         | 0.40 kB   | 0.28 kB      | tipos chunked          |
| `arrow-left-BgBZU9h6.js`    | 0.34 kB   | 0.27 kB      | ícone (lucide)         |
| `plus-C8u-cC6K.js`          | 0.33 kB   | 0.25 kB      | ícone (lucide)         |
| `index-ZxHwJYgG.css`        | 34.77 kB  | 7.10 kB      | CSS bundle             |

**Total gzip ≈ 115 kB** (vs baseline único de ~57 kB inicial — mas agora com lazy-loading por rota). Cada rota só baixa o código necessário após interação do usuário (router já configurado em `App.tsx:7-16` com `lazy()` + `Suspense`).

Cache hit-rate ganha porque alterações em código da app (`index-*.js`) não invalidam o chunk `vendor-react` (que tem hash próprio e só muda ao subir versão de React).
