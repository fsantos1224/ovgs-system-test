// Mock API com json-server + middleware custom para regras de negócio.
// Transações simuladas via writes síncronos. Idempotência via header.
// Hardening 2026-07-09: identity gate (F1), allowlist em PATCH (F3),
// DELETE auditado (F5), idempotency canônica (F4+F7), UUID nativo (ticket 24).

const jsonServer = require("json-server");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const server = jsonServer.create();

// UUID helpers — single source of truth no servidor.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (v) => typeof v === "string" && UUID_RE.test(v);
const newId = () => crypto.randomUUID();

// Persistência do banco: data/db.json no volume nomeado.
// Em testes, DATA_FILE pode ser sobrescrito via env var (porta efêmera).
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = process.env.DATA_FILE || path.join(DATA_DIR, "db.json");
if (DATA_FILE === path.join(DATA_DIR, "db.json")) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const seed = path.join(__dirname, "db.seed.json");
    if (fs.existsSync(seed)) fs.copyFileSync(seed, DATA_FILE);
    else fs.writeFileSync(DATA_FILE, JSON.stringify({}));
  }
}
const router = jsonServer.router(DATA_FILE);
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);

// CORS restrito ao frontend que realmente consome a API.
const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://localhost:4173,http://localhost:8080"
).split(",");
server.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, x-user, idempotency-key",
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    if (req.method === "OPTIONS") return res.sendStatus(204);
  }
  next();
});

// ─── F1: Identity gate ────────────────────────────────────────────────
// Recusa qualquer método mutante sem identidade válida via header `x-user`.
// Endpoints read-only (GET) continuam abertos para o json-server padrão.
const MUTANT_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
server.use((req, res, next) => {
  if (!MUTANT_METHODS.has(req.method)) return next();
  const user = req.headers["x-user"];
  if (typeof user !== "string" || user.length === 0 || user.length > 128) {
    return res.status(401).json({
      error: "Identidade obrigatória (header x-user ausente ou inválido).",
    });
  }
  next();
});

// ─── F4+F7: Idempotency hardening ────────────────────────────────────
// Chave do cache é canônica (hash SHA-256 de método+path+body+user), não o
// header cru. Header é validado para evitar DoS por chaves gigantes.
const IDEMPOTENCY_TTL_MS = 60 * 60 * 1000;
const IDEMPOTENCY_MAX_ENTRIES = 1000;
const IDEMPOTENCY_KEY_RE = /^[A-Za-z0-9_-]{1,128}$/;
const idempotencyStore = new Map();

function bodyHash(body) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(body ?? null))
    .digest("hex");
}
function canonicalKey(method, path, body, user) {
  return crypto
    .createHash("sha256")
    .update(`${method}:${path}:${bodyHash(body)}:${user}`)
    .digest("hex");
}
function validateIdempotencyKey(raw) {
  if (typeof raw !== "string") return null;
  return IDEMPOTENCY_KEY_RE.test(raw) ? raw : null;
}
function idempotencyPrune() {
  const now = Date.now();
  for (const [key, entry] of idempotencyStore) {
    if (entry.expiresAt <= now) idempotencyStore.delete(key);
  }
  if (idempotencyStore.size > IDEMPOTENCY_MAX_ENTRIES) {
    const overflow = idempotencyStore.size - IDEMPOTENCY_MAX_ENTRIES;
    const keys = idempotencyStore.keys();
    for (let i = 0; i < overflow; i++)
      idempotencyStore.delete(keys.next().value);
  }
}
setInterval(idempotencyPrune, 5 * 60 * 1000).unref();

// ─── F3: Allowlist de campos por entidade ─────────────────────────────
// Bloqueia mass assignment via PATCH em /clientes, /itens,
// /tiposTransporte, /ordensVenda. Apenas campos declarados sobrevivem.
const ALLOWLIST_BY_ENTITY = {
  clientes: [
    "nome",
    "documento",
    "email",
    "telefone",
    "endereco",
    "ativo",
    "transportesAutorizados",
  ],
  tiposTransporte: ["nome", "modal", "ativo"],
  itens: ["nome", "sku", "categoria", "precoUnitario", "unidadeMedida", "ativo"],
  ordensVenda: [
    "status",
    "dataEntregaPrevista",
    "transporteId",
    "observacoes",
    "itens",
    "valorTotal",
    "janelaAtendimento",
  ],
};
function pick(body, allowlist) {
  if (!body || typeof body !== "object") return {};
  const out = {};
  for (const k of allowlist) {
    if (Object.prototype.hasOwnProperty.call(body, k)) out[k] = body[k];
  }
  return out;
}

// Máquina de estados linear — alinhada com src/domain/types.ts e a spec.
const STATUS_FLOW = [
  "CRIADA",
  "PLANEJADA",
  "AGENDADA",
  "EM_TRANSPORTE",
  "ENTREGUE",
];
const canTransition = (from, to) => {
  const i = STATUS_FLOW.indexOf(from);
  return i >= 0 && STATUS_FLOW[i + 1] === to;
};

const validatorUser = (req) => req.headers["x-user"] || "anonimo";

// POST /ordensVenda — valida regras + cria auditoria + idempotência canônica
server.post("/ordensVenda", (req, res) => {
  const rawKey = req.headers["idempotency-key"];
  const idempotencyKey = validateIdempotencyKey(rawKey);
  if (rawKey && !idempotencyKey) {
    return res
      .status(400)
      .json({ error: "Idempotency-Key inválido (1-128 chars, alfanumérico/underscore/hífen)." });
  }
  const cacheKey = idempotencyKey
    ? canonicalKey(req.method, req.path, req.body, validatorUser(req))
    : null;
  if (cacheKey) {
    const cached = idempotencyStore.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.status(200).json(cached.value);
    }
  }

  const body = req.body;

  if (
    !isUUID(body.clienteId) ||
    !isUUID(body.transporteId) ||
    !Array.isArray(body.itens) ||
    body.itens.length === 0
  ) {
    return res.status(400).json({
      error:
        "clienteId, transporteId (ambos UUID) e ao menos 1 item são obrigatórios",
    });
  }

  const cliente = router.db
    .get("clientes")
    .find({ id: body.clienteId })
    .value();
  const transporte = router.db
    .get("tiposTransporte")
    .find({ id: body.transporteId })
    .value();

  if (!cliente)
    return res.status(400).json({ error: "Cliente não encontrado" });
  if (!cliente.ativo)
    return res.status(400).json({ error: "Cliente inativo" });

  const autorizados = cliente.transportesAutorizados || [];
  if (!autorizados.includes(body.transporteId)) {
    return res.status(400).json({
      error: `Transporte não autorizado para o cliente ${cliente.nome}`,
      clienteId: body.clienteId,
      transporteId: body.transporteId,
      transportesAutorizados: autorizados,
    });
  }
  if (!transporte)
    return res.status(400).json({ error: "Transporte não encontrado" });

  // Valida itens referenciais
  for (const it of body.itens) {
    if (!isUUID(it.itemId)) {
      return res
        .status(400)
        .json({ error: `itemId inválido: ${it.itemId}` });
    }
    const item = router.db.get("itens").find({ id: it.itemId }).value();
    if (!item) {
      return res
        .status(400)
        .json({ error: `Item não encontrado: ${it.itemId}` });
    }
  }

  const novaOV = {
    id: newId(),
    numero: body.numero || `OV-${Date.now()}`,
    clienteId: body.clienteId,
    nomeCliente: cliente.nome,
    dataEmissao: body.dataEmissao || new Date().toISOString(),
    dataEntregaPrevista: body.dataEntregaPrevista || null,
    transporteId: body.transporteId,
    nomeTransporte: transporte.nome,
    status: body.status || "CRIADA",
    itens: body.itens.map((it) => ({ ...it, id: newId() })),
    valorTotal: body.itens.reduce(
      (acc, i) => acc + (i.quantidade || 0) * (i.precoUnitario || 0),
      0,
    ),
    observacoes: body.observacoes || null,
  };

  router.db.get("ordensVenda").push(novaOV).write();

  const evento = {
    id: newId(),
    entidade: "ordemVenda",
    entidadeId: novaOV.id,
    acao: "criacao",
    usuario: validatorUser(req),
    dataHora: new Date().toISOString(),
    detalhes: `OV ${novaOV.numero} criada com status ${novaOV.status}`,
    estadoAnterior: null,
    estadoPosterior: novaOV.status,
  };
  router.db.get("eventosAuditoria").push(evento).write();

  if (cacheKey) {
    idempotencyStore.set(cacheKey, {
      value: novaOV,
      expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
    });
  }

  res.status(201).json(novaOV);
});

// PATCH /ordensVenda/:id — valida transição + cria auditoria + allowlist
server.patch("/ordensVenda/:id", (req, res) => {
  const { id } = req.params;
  if (!isUUID(id)) {
    return res.status(400).json({ error: "id deve ser UUID" });
  }
  const ov = router.db.get("ordensVenda").find({ id }).value();
  if (!ov) return res.status(404).json({ error: "OV não encontrada" });

  // F3: restringe body ao allowlist
  req.body = pick(req.body, ALLOWLIST_BY_ENTITY.ordensVenda);

  const { status: novoStatus } = req.body;

  if (novoStatus && !canTransition(ov.status, novoStatus)) {
    return res.status(422).json({
      error: `Transição inválida: ${ov.status} → ${novoStatus}`,
      statusAtual: ov.status,
      statusSolicitado: novoStatus,
      transicoesValidas: STATUS_FLOW.filter((s) => canTransition(ov.status, s)),
    });
  }

  // transporteId, se informado, precisa ser UUID válido
  if (req.body.transporteId && req.body.transporteId !== ov.transporteId) {
    if (!isUUID(req.body.transporteId)) {
      return res.status(400).json({ error: "transporteId deve ser UUID" });
    }
    const novoTp = router.db
      .get("tiposTransporte")
      .find({ id: req.body.transporteId })
      .value();
    if (!novoTp) {
      return res.status(400).json({ error: "Transporte não encontrado" });
    }
  }

  router.db.get("ordensVenda").find({ id }).assign(req.body).write();
  const ovAtualizada = router.db.get("ordensVenda").find({ id }).value();

  if (novoStatus) {
    router.db
      .get("eventosAuditoria")
      .push({
        id: newId(),
        entidade: "ordemVenda",
        entidadeId: id,
        acao: "alteracao_status",
        usuario: validatorUser(req),
        dataHora: new Date().toISOString(),
        detalhes: `Status alterado de ${ov.status} para ${novoStatus}`,
        estadoAnterior: ov.status,
        estadoPosterior: novoStatus,
      })
      .write();
  }

  if (
    req.body.dataEntregaPrevista &&
    req.body.dataEntregaPrevista !== ov.dataEntregaPrevista
  ) {
    router.db
      .get("eventosAuditoria")
      .push({
        id: newId(),
        entidade: "ordemVenda",
        entidadeId: id,
        acao: "alteracao_agendamento",
        usuario: validatorUser(req),
        dataHora: new Date().toISOString(),
        detalhes: `Agendamento alterado: data prevista de ${ov.dataEntregaPrevista || "—"} para ${req.body.dataEntregaPrevista}`,
        estadoAnterior: ov.dataEntregaPrevista || null,
        estadoPosterior: req.body.dataEntregaPrevista,
      })
      .write();
  }

  if (req.body.transporteId && req.body.transporteId !== ov.transporteId) {
    const novoTp = router.db
      .get("tiposTransporte")
      .find({ id: req.body.transporteId })
      .value();
    router.db
      .get("eventosAuditoria")
      .push({
        id: newId(),
        entidade: "ordemVenda",
        entidadeId: id,
        acao: "alteracao_transporte",
        usuario: validatorUser(req),
        dataHora: new Date().toISOString(),
        detalhes: `Transporte alterado de ${ov.nomeTransporte} para ${novoTp?.nome || req.body.transporteId}`,
        estadoAnterior: ov.transporteId,
        estadoPosterior: req.body.transporteId,
      })
      .write();
  }

  res.json(ovAtualizada);
});

// Mapa de nomes de entidade para auditoria
const AUDIT_ENTITY = {
  clientes: "cliente",
  tiposTransporte: "transporte",
  itens: "item",
};
const AUDIT_EXCLUDE = ["eventosAuditoria", "ordensVenda"];

// Captura estado anterior antes de PATCH/DELETE em entidades auditáveis.
// Aplica F3 allowlist quando a request é mutante contra uma entidade
// conhecida — antes do router default. Para POST em entidade auditável,
// também força `id = newId()` para garantir UUID em vez do auto-increment
// padrão do json-server.
server.use((req, res, next) => {
  const parts = req.path.split("/").filter(Boolean);
  const entity = parts[0];

  if (req.method === "POST" && AUDIT_ENTITY[entity] && req.body) {
    if (!req.body.id) req.body.id = newId();
  }

  if (req.method === "PATCH" || req.method === "DELETE") {
    const id = parts[1];
    if (AUDIT_ENTITY[entity] && id) {
      const before = router.db.get(entity).find({ id }).value();
      if (before) req.__before = JSON.stringify(before);
    }
    if (req.method === "PATCH" && ALLOWLIST_BY_ENTITY[entity]) {
      req.body = pick(req.body, ALLOWLIST_BY_ENTITY[entity]);
    }
  }
  next();
});

// Intercepta respostas do json-server para auditoria automática.
// Inclui POST/PATCH/DELETE (F5: DELETE antes ficava fora do gatilho).
const _render = router.render.bind(router);
router.render = (req, res) => {
  const parts = req.path.split("/").filter(Boolean);
  const entity = parts[0];
  const method = req.method;
  const auditName = AUDIT_ENTITY[entity];

  if (auditName && !AUDIT_EXCLUDE.includes(entity)) {
    const data = res.locals.data;
    let acao;
    if (method === "POST") acao = "criacao";
    else if (method === "PATCH") acao = "alteracao";
    else if (method === "DELETE") acao = "exclusao";
    else acao = null;

    if (acao) {
      let estadoAnterior = null;
      if (method !== "POST") {
        try {
          estadoAnterior = req.__before ? JSON.parse(req.__before) : null;
        } catch {
          estadoAnterior = null;
        }
      }

      const detalhes =
        method === "POST"
          ? `${auditName.charAt(0).toUpperCase() + auditName.slice(1)} ${data?.nome || data?.id || ""} criado`
          : method === "DELETE"
            ? `${auditName.charAt(0).toUpperCase() + auditName.slice(1)} ${data?.nome || parts[1]} excluído`
            : `${auditName.charAt(0).toUpperCase() + auditName.slice(1)} ${data?.nome || data?.id} alterado: ${Object.keys(req.body ?? {}).filter((k) => k !== "id").join(", ")}`;

      const evento = {
        id: newId(),
        entidade: auditName,
        entidadeId: String(data?.id ?? parts[1] ?? ""),
        acao,
        usuario: validatorUser(req),
        dataHora: new Date().toISOString(),
        detalhes,
        estadoAnterior:
          method === "DELETE" ? estadoAnterior : estadoAnterior
            ? JSON.stringify(estadoAnterior)
            : null,
        estadoPosterior:
          method === "DELETE"
            ? null
            : JSON.stringify(method === "PATCH" ? req.body : data),
      };

      router.db.get("eventosAuditoria").push(evento).write();
    }
  }

  _render(req, res);
};

// POST /reset — dev-only. Bloqueia em produção.
server.post("/reset", (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" });
  }
  idempotencyStore.clear();
  res.json({ message: "Idempotency store cleared" });
});

server.use(router);

const PORT = parseInt(process.env.PORT || "3001", 10);
server.listen(PORT, () => {
  console.log(`XPTO Mock API rodando em http://localhost:${PORT}`);
});
