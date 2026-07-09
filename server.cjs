// Mock API com json-server + middleware custom para regras de negócio.
// Transações simuladas via writes síncronas. Idempotência via header.

const jsonServer = require("json-server");
const crypto = require("crypto");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);
server.use(require("cors")());

// Idempotency store (in-memory, reseta ao reiniciar o servidor)
const idempotencyStore = new Map();

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
  if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
    return res.status(200).json(idempotencyStore.get(idempotencyKey));
  }

  const body = req.body;

  if (!body.clienteId || !body.transporteId || !body.itens?.length) {
    return res
      .status(400)
      .json({
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
  };
  router.db.get("eventosAuditoria").push(evento).write();

  if (idempotencyKey) idempotencyStore.set(idempotencyKey, novaOV);

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
      })
      .write();
  }

  res.json(ovAtualizada);
});

// POST /reset — limpa o cache de idempotência
server.post("/reset", (_req, res) => {
  idempotencyStore.clear();
  res.json({ message: "Idempotency store cleared" });
});

server.use(router);

server.listen(3001, () => {
  console.log("OVGS Mock API rodando em http://localhost:3001");
});
