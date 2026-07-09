# Ticket 6 — RBAC: Papéis, Permissões e UI Condicional

- **Tipo:** `wayfinder:grilling`
- **Bloqueado por:** Ticket 1 - Stack Frontend

## Questão

Como modelar o sistema de autorização RBAC (Role-Based Access Control) no frontend usando **apenas um objeto de configuração + um hook** — sem libs externas?

## Restrições YAGNI

- `🐴` Sem libs de autorização (CASL, etc.)
- Sem framework de permissões — objeto de configuração + hook custom
- UI-level (esconder botões) + operação-level (rejeitar chamadas mock)

## O que precisa de ser decidido

- Quais papéis (roles)? Proposta: `admin`, `manager`, `operator`, `viewer`
- Hierarquia? `admin > manager > operator > viewer` ou permissões independentes?
- Quais actions por role? (ex: `create_ov`, `schedule`, `audit`, `manage_clients`)
- Onde guardar o role do user logado? (Context, localStorage)
- Como o hook `usePermission()` expõe o can/check
- Como os mocks (json-server) validam permissões

## Exemplo de output esperado (ponytail)

```typescript
// 🐴: objeto de configuração + hook — sem lib de autorização
const PERMISSIONS = {
  admin: ['create_ov', 'read_ov', 'update_ov', 'delete_ov', 'schedule', 'audit', 'manage_clients', 'manage_transport', 'manage_items'],
  manager: ['create_ov', 'read_ov', 'update_ov', 'schedule', 'audit'],
  operator: ['create_ov', 'read_ov', 'update_ov'],
  viewer: ['read_ov'],
} as const;

const usePermission = () => {
  const role = useCurrentUser(); // localStorage mock
  const actions = PERMISSIONS[role] ?? [];
  return {
    can: (action: string) => actions.includes(action),
    role,
  };
};
```

## Resolução

*[a preencher quando resolvido]*