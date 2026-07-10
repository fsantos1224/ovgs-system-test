# Ticket 10 — Performance: Paginação server-side

- **Tipo:** `wayfinder:research`
- **Bloqueado por:** Ticket 1 — Stack Frontend

## Questão

Como garantir performance aceitável na listagem de OVs (potencialmente centenas de itens) usando **apenas paginação server-side** — sem virtualização, sem libs de lista infinita?

## Restrições YAGNI

- Paginação server-side via json-server (`?_page=1&_limit=20`) — zero libs
- Nada de react-window, react-virtualizado, infinite scroll — overkill para backoffice
- Filtros no servidor, não no client (????q=, ?cliente_id=, etc.)

## O que precisa de ser decidido

- Tamanho da página (20? 50?)
- Estrutura de filtros (query params: ?status=CRIADA&cliente_id=1&data_inicio=2025-01-01)
- Padrão de UI para paginação (botões Anterior/Próximo + número da página)
- Como evitar refetch desnecessários (debounce em inputs de filtro)
- Opção de cache manual (ex: guardar última resposta em useState para navegação fluida)

## Exemplo de output esperado (ponytail)

```typescript
const fetchOVs = async (page: number, filters: Record<string, string>) => {
  const params = new URLSearchParams({ _page: String(page), _limit: '20', ...filters });
  const res = await fetch(`/api/ovs?${params}`);
  const total = parseInt(res.headers.get('X-Total-Count') ?? '0', 10);
  return { data: await res.json(), total, totalPages: Math.ceil(total / 20) };
};
```

## Resolução

_[a preencher quando resolvido]_
