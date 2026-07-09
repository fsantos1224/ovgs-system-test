# Ticket 4 — Estado: useState + fetch nativo

- **Tipo:** `wayfinder:grilling`
- **Bloqueado por:** Ticket 3 - Domínio e Máquina de Estados

## Questão

Como gerir o estado da aplicação usando **apenas `useState`/`useReducer` + `fetch` nativo** — sem TanStack Query, sem Zustand, sem Redux?

## Restrições YAGNI

- `🐴` Zero libs de estado. Nada de TanStack Query, Zustand, Redux, Context API global.
- Se precisar de partilhar estado entre componentes, usar props + lifting state up.
- Apenas `fetch` nativo para chamadas à API (json-server).

## O que precisa de ser decidido

- Padrão de custom hooks para data fetching (ex: `useOVs()`, `useClientes()`, `useCreateOV()`)
- Quando subir estado vs mantê-lo local no componente
- Loading states e error handling — como estruturar sem libs
- Abordagem para refresh após mutação (ex: após criar OV, refetch a lista)

## Exemplo de output esperado (ponytail)

```typescript
// 🐴: fetch nativo + useState, sem TanStack Query
const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error, refetch: () => setLoading(true) };
};
```

## Resolução

*[a preencher quando resolvido]*