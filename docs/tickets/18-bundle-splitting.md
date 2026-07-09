# Ticket 18 — Bundle splitting + preload hints

- **Tipo:** `wayfinder:performance`
- **Bloqueado por:** Nenhum — pode começar imediatamente

## Questão

`npm run build` produz um único chunk de 176 kB / 57 kB gzip com todo React + react-router-dom + react-hook-form misturados ao código da app. `vite.config.ts` não tem `build.rollupOptions` — vendor splitting não está configurado. Consequência: cada deploy invalida o cache do vendor mesmo quando só mudou 1 linha de código de página.

Adicionalmente, `index.html` não tem `<link rel="modulepreload">` para o entry principal, perdendo a oportunidade de começar o fetch do JS crítico em paralelo ao do HTML.

## Restrições YAGNI

- `🐴` Só `manualChunks` + 1-2 `<link>` no `index.html`
- `🐴` Sem `terser` config custom, sem analyzer, sem nada extra

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

_a preencher ao fechar o ticket_