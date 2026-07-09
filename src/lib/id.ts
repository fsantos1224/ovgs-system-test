// UUID helper. Padrão de IDs em todo o projeto: UUID v4 via crypto nativo.
export function newId(): string {
  return crypto.randomUUID();
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(id: unknown): id is string {
  return typeof id === "string" && UUID_RE.test(id);
}
