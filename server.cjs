// Mock API com json-server + middleware custom para regras de negócio.
// Transações simuladas via writes síncronas. Idempotência via header.

const jsonServer = require("json-server");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const server = jsonServer.create();

// Persistência do banco: data/db.json no volume nomeado.
// Em testes, DATA_FILE pode ser sobrescrito via env var (porta efêmera).
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = process.env.DATA_FILE || path.join(DATA_DIR, "db.json");
if (DATA_FILE === path.join(DATA_DIR, "db.json")) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const seed = path.join(__dirname, "db.json");
    if (fs.existsSync(seed)) fs.copyFileSync(seed, DATA_FILE);
    else fs.writeFileSync(DATA_FILE, JSON.stringify({}));
  }
}
const router = jsonServer.router(DATA_FILE);
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);
// CORS restrito ao frontend que realmente consome a API.
// Em Docker: nginx serve frontend em :80 (interno) e :8080 (host).
// Em dev: Vite serve em :5173 ou :4173.
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

// Idempotency store (in-memory, reseta ao reiniciar o servidor).
// Bound por TTL + tamanho máximo para evitar DoS via keys arbitrários.
const IDEMPOTENCY_TTL_MS = 60 * 60 * 1000; // 1h
const IDEMPOTENCY_MAX_ENTRIES = 1000;
const idempotencyStore = new Map();

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

// Máquina de estados linear — alinhado com src/domain/types.ts e especificação do desafio.
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

// POST /ordensVenda — valida regras + cria auditoria + idempotência
server.post("/ordensVenda", (req, res) => {
  const idempotencyKey = req.headers["idempotency-key"];
  if (idempotencyKey) {
    const cached = idempotencyStore.get(idempotencyKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.status(200).json(cached.value);
    }
  }

  const body = req.body;

  if (!body.clienteId || !body.transporteId || !body.itens?.length) {
    return res.status(400).json({
      error: "clienteId, transporteId e ao menos 1 item são obrigatórios",
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
  if (!cliente.ativo) return res.status(400).json({ error: "Cliente inativo" });

  // Regra central do domínio Cliente (CONTEXT.md): transporte precisa estar
  // autorizado para o cliente. Backward-compat: clientes sem o campo são
  // tratados como sem nenhum transporte autorizado.
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

  const ordens = router.db.get("ordensVenda").value();
  const novaOV = {
    id: String(ordens.length + 1),
    numero: body.numero || `OV-${Date.now()}`,
    clienteId: body.clienteId,
    nomeCliente: cliente.nome,
    dataEmissao: body.dataEmissao || new Date().toISOString(),
    dataEntregaPrevista: body.dataEntregaPrevista || null,
    transporteId: body.transporteId,
    nomeTransporte: transporte.nome,
    status: body.status || "CRIADA",
    itens: body.itens,
    valorTotal: body.itens.reduce(
      (acc, i) => acc + (i.quantidade || 0) * (i.precoUnitario || 0),
      0,
    ),
    observacoes: body.observacoes || null,
  };

  // "Transação" simulada — writes síncronas, se algo falhar o erro 500 impede partial writes
  router.db.get("ordensVenda").push(novaOV).write();

  const evento = {
    id: String(router.db.get("eventosAuditoria").value().length + 1),
    entidade: "ordemVenda",
    entidadeId: novaOV.id,
    acao: "criacao",
    usuario: req.headers["x-user"] || "admin",
    dataHora: new Date().toISOString(),
    detalhes: `OV ${novaOV.numero} criada com status ${novaOV.status}`,
    estadoAnterior: null,
    estadoPosterior: novaOV.status,
  };
  router.db.get("eventosAuditoria").push(evento).write();

  if (idempotencyKey)
    idempotencyStore.set(idempotencyKey, {
      value: novaOV,
      expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
    });

  res.status(201).json(novaOV);
});

// PATCH /ordensVenda/:id — valida transição de status + cria auditoria
server.patch("/ordensVenda/:id", (req, res) => {
  const { id } = req.params;
  const ov = router.db.get("ordensVenda").find({ id }).value();

  if (!ov) return res.status(404).json({ error: "OV não encontrada" });

  const { status: novoStatus } = req.body;

  if (novoStatus && !canTransition(ov.status, novoStatus)) {
    return res.status(422).json({
      error: `Transição inválida: ${ov.status} → ${novoStatus}`,
      statusAtual: ov.status,
      statusSolicitado: novoStatus,
      transicoesValidas: STATUS_FLOW.filter((s) => canTransition(ov.status, s)),
    });
  }

  router.db.get("ordensVenda").find({ id }).assign(req.body).write();
  const ovAtualizada = router.db.get("ordensVenda").find({ id }).value();

  if (novoStatus) {
    router.db
      .get("eventosAuditoria")
      .push({
        id: String(router.db.get("eventosAuditoria").value().length + 1),
        entidade: "ordemVenda",
        entidadeId: id,
        acao: "alteracao_status",
        usuario: req.headers["x-user"] || "admin",
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
        id: String(router.db.get("eventosAuditoria").value().length + 1),
        entidade: "ordemVenda",
        entidadeId: id,
        acao: "alteracao_agendamento",
        usuario: req.headers["x-user"] || "admin",
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
        id: String(router.db.get("eventosAuditoria").value().length + 1),
        entidade: "ordemVenda",
        entidadeId: id,
        acao: "alteracao_transporte",
        usuario: req.headers["x-user"] || "admin",
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

// Captura estado anterior antes de PATCH em entidades auditáveis
server.use((req, res, next) => {
  if (req.method === "PATCH") {
    const parts = req.path.split("/").filter(Boolean);
    const entity = parts[0];
    const id = parts[1];
    if (AUDIT_ENTITY[entity] && id) {
      const before = router.db.get(entity).find({ id }).value();
      if (before) req.__before = JSON.stringify(before);
    }
  }
  next();
});

// Intercepta respostas do json-server para adicionar auditoria em CRUD
const _render = router.render.bind(router);
router.render = (req, res) => {
  const parts = req.path.split("/").filter(Boolean);
  const entity = parts[0];
  const method = req.method;
  const auditName = AUDIT_ENTITY[entity];

  if (
    auditName &&
    !AUDIT_EXCLUDE.includes(entity) &&
    (method === "POST" || method === "PATCH")
  ) {
    const data = res.locals.data;
    const acao = method === "POST" ? "criacao" : "alteracao";

    let estadoAnterior = null;
    if (method === "PATCH" && data?.id) {
      estadoAnterior = req.__before || null;
    }

    let detalhes;
    if (method === "POST") {
      detalhes = `${auditName.charAt(0).toUpperCase() + auditName.slice(1)} ${data.nome || data.id || ""} criado`;
    } else {
      const bodyKeys = Object.keys(req.body).filter((k) => k !== "id");
      detalhes = `${auditName.charAt(0).toUpperCase() + auditName.slice(1)} ${data.nome || data.id} alterado: ${bodyKeys.join(", ")}`;
    }

    const evento = {
      id: String(router.db.get("eventosAuditoria").value().length + 1),
      entidade: auditName,
      entidadeId: String(data.id),
      acao,
      usuario: req.headers["x-user"] || "admin",
      dataHora: new Date().toISOString(),
      detalhes,
      estadoAnterior,
      estadoPosterior: JSON.stringify(method === "PATCH" ? req.body : data),
    };

    router.db.get("eventosAuditoria").push(evento).write();
  }

  _render(req, res);
};

// POST /reset — limpa o cache de idempotência
server.post("/reset", (_req, res) => {
  idempotencyStore.clear();
  res.json({ message: "Idempotency store cleared" });
});

server.use(router);

const PORT = parseInt(process.env.PORT || "3001", 10);
server.listen(PORT, () => {
  console.log(`XPTO Mock API rodando em http://localhost:${PORT}`);
});
