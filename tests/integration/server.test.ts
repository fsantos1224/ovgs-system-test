// Testes de integração do server.cjs.
// Usa spawn do subprocesso em vez de supertest-in-memory para exercitar o
// json-server real (idempotency store, filesystem writes, CORS).

import { spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync, copyFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..");

let proc: ChildProcess;
let baseUrl: string;
let tmpDataDir: string;

// IDs carregados via API no beforeAll (UUIDs do seed)
let ids: {
  alphaId: string;
  alphaTransporteId: string;
  betaId: string;
  betaTransporteId: string;
  gammaId: string;
  itemId: string;
};

async function waitForReady(url: string, timeoutMs = 10_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Servidor não respondeu em ${timeoutMs}ms`);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

beforeAll(async () => {
  const port = 4100 + Math.floor(Math.random() * 1000);
  baseUrl = `http://127.0.0.1:${port}`;

  tmpDataDir = mkdtempSync(join(tmpdir(), "XPTO-int-"));
  const seedSrc = join(ROOT, "db.seed.json");
  const seedDst = join(tmpDataDir, "db.json");
  copyFileSync(seedSrc, seedDst);

  proc = spawn("node", ["server.cjs"], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_FILE: seedDst,
      NODE_ENV: "test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  proc.stderr?.on("data", (d) => process.stderr.write(`[server] ${d}`));

  await waitForReady(`${baseUrl}/clientes`);

  // Carrega IDs via API para evitar hardcoded UUIDs
  const [clientes, transportes, itens] = await Promise.all([
    fetch(`${baseUrl}/clientes`).then((r) => r.json()),
    fetch(`${baseUrl}/tiposTransporte`).then((r) => r.json()),
    fetch(`${baseUrl}/itens`).then((r) => r.json()),
  ]);
  const alpha = clientes.find((c: { nome: string }) =>
    c.nome.startsWith("Empresa Alpha"),
  );
  const beta = clientes.find((c: { nome: string }) =>
    c.nome.startsWith("Beta"),
  );
  const gamma = clientes.find((c: { nome: string }) =>
    c.nome.startsWith("Gamma"),
  );
  ids = {
    alphaId: alpha.id,
    alphaTransporteId: alpha.transportesAutorizados[0],
    betaId: beta.id,
    betaTransporteId: beta.transportesAutorizados[0],
    gammaId: gamma.id,
    itemId: itens.find((i: { ativo: boolean }) => i.ativo).id,
  };
}, 30_000);

afterAll(() => {
  proc?.kill("SIGTERM");
  if (tmpDataDir && existsSync(tmpDataDir)) {
    rmSync(tmpDataDir, { recursive: true, force: true });
  }
});

describe("Identity gate (F1)", () => {
  it("POST sem header x-user retorna 401", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });

  it("PATCH sem header x-user retorna 401", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda/qualquer`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PLANEJADA" }),
    });
    expect(res.status).toBe(401);
  });

  it("GET sem header continua aberto (read-only)", async () => {
    const res = await fetch(`${baseUrl}/clientes`);
    expect(res.status).toBe(200);
  });

  it("registra usuário real, não fallback 'admin'", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "alice@xpto.local",
      },
      body: JSON.stringify({
        clienteId: ids.alphaId,
        transporteId: ids.alphaTransporteId,
        itens: [{ itemId: ids.itemId, quantidade: 1, precoUnitario: 50 }],
      }),
    });
    expect(res.status).toBe(201);
    const ov = await res.json();
    const audit = await fetch(
      `${baseUrl}/eventosAuditoria?entidadeId=${ov.id}&entidade=ordemVenda&acao=criacao`,
    ).then((r) => r.json());
    expect(audit[0].usuario).toBe("alice@xpto.local");
    expect(audit[0].usuario).not.toBe("admin");
  });
});

describe("UUIDs (ticket 24)", () => {
  it("seed usa UUIDs em todos os ids e referências", async () => {
    expect(ids.alphaId).toMatch(UUID_RE);
    expect(ids.alphaTransporteId).toMatch(UUID_RE);
    expect(ids.itemId).toMatch(UUID_RE);
  });

  it("OV criada tem id UUID e itens com id UUID", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "qa@XPTO.local",
      },
      body: JSON.stringify({
        clienteId: ids.alphaId,
        transporteId: ids.alphaTransporteId,
        itens: [{ itemId: ids.itemId, quantidade: 2, precoUnitario: 50 }],
      }),
    });
    expect(res.status).toBe(201);
    const ov = await res.json();
    expect(ov.id).toMatch(UUID_RE);
    expect(ov.itens[0].id).toMatch(UUID_RE);
  });

  it("rejeita POST com clienteId não-UUID", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "qa@XPTO.local",
      },
      body: JSON.stringify({
        clienteId: "1",
        transporteId: ids.alphaTransporteId,
        itens: [{ itemId: ids.itemId, quantidade: 1, precoUnitario: 50 }],
      }),
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /ordensVenda — regras de negócio", () => {
  it("retorna 400 quando cliente é inativo (Gamma)", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "admin@XPTO.local",
      },
      body: JSON.stringify({
        clienteId: ids.gammaId,
        transporteId: ids.alphaTransporteId,
        itens: [{ itemId: ids.itemId, quantidade: 10, precoUnitario: 50 }],
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/inativo/i);
  });

  it("retorna 400 quando transporte não é autorizado (Beta + transporte Alpha)", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "admin@XPTO.local",
      },
      body: JSON.stringify({
        clienteId: ids.betaId,
        transporteId: ids.alphaTransporteId,
        itens: [{ itemId: ids.itemId, quantidade: 10, precoUnitario: 50 }],
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/não autorizado/i);
    expect(body.transportesAutorizados).toEqual([ids.betaTransporteId]);
  });

  it("cria OV válida com transporte autorizado", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "admin@XPTO.local",
      },
      body: JSON.stringify({
        clienteId: ids.alphaId,
        transporteId: ids.alphaTransporteId,
        itens: [{ itemId: ids.itemId, quantidade: 10, precoUnitario: 50 }],
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toMatch(UUID_RE);
    expect(body.status).toBe("CRIADA");
    expect(body.valorTotal).toBe(500);
  });
});

describe("POST /ordensVenda — idempotência (F4+F7)", () => {
  it("retorna o mesmo body para o mesmo Idempotency-Key", async () => {
    const key = crypto.randomUUID().replace(/-/g, "x");
    const payload = {
      clienteId: ids.alphaId,
      transporteId: ids.alphaTransporteId,
      itens: [{ itemId: ids.itemId, quantidade: 5, precoUnitario: 30 }],
    };
    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "admin@XPTO.local",
        "idempotency-key": key,
      },
      body: JSON.stringify(payload),
    } as const;
    const first = await fetch(`${baseUrl}/ordensVenda`, opts);
    const second = await fetch(`${baseUrl}/ordensVenda`, opts);
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    const a = await first.json();
    const b = await second.json();
    expect(b.id).toBe(a.id);
  });

  it("rejeita Idempotency-Key com tamanho inválido (>128 chars) com 400", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "admin@XPTO.local",
        "idempotency-key": "A".repeat(200),
      },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("rejeita Idempotency-Key com chars inválidos com 400", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "admin@XPTO.local",
        "idempotency-key": "key with spaces",
      },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe("PATCH /ordensVenda/:id — máquina de estados", () => {
  let ovId: string;

  beforeAll(async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "admin@XPTO.local",
      },
      body: JSON.stringify({
        clienteId: ids.alphaId,
        transporteId: ids.alphaTransporteId,
        itens: [{ itemId: ids.itemId, quantidade: 1, precoUnitario: 50 }],
      }),
    });
    ovId = (await res.json()).id;
  });

  it("rejeita transição pulando um estado (CRIADA → AGENDADA)", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda/${ovId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user": "admin@XPTO.local",
      },
      body: JSON.stringify({ status: "AGENDADA" }),
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.transicoesValidas).toEqual(["PLANEJADA"]);
  });

  it("permite transição válida CRIADA → PLANEJADA", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda/${ovId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user": "admin@XPTO.local",
      },
      body: JSON.stringify({ status: "PLANEJADA" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("PLANEJADA");
  });

  it("ignora campos fora do allowlist (F3) — não altera id nem clienteId via PATCH", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda/${ovId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user": "admin@XPTO.local",
      },
      body: JSON.stringify({
        id: "uuid-intruso-tentando-sobrescrever",
        clienteId: "uuid-cliente-intruso",
        observacoes: "tentando bypassar allowlist",
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    // id e clienteId preservados
    expect(body.id).toBe(ovId);
    expect(body.clienteId).toBe(ids.alphaId);
    // observacao (allowlisted) aplicada
    expect(body.observacoes).toBe("tentando bypassar allowlist");
  });
});

describe("DELETE auditado (F5)", () => {
  it("DELETE em cliente gera evento de auditoria com acao=exclusao", async () => {
    // cria cliente novo
    const created = await fetch(`${baseUrl}/clientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "qa@xpto.local",
      },
      body: JSON.stringify({
        nome: "Cliente Teste DELETE",
        documento: "00.000.000/0001-00",
        email: "del@xpto.local",
        telefone: "(00) 0000-0000",
        endereco: "Rua X, 0",
        ativo: true,
        transportesAutorizados: [],
      }),
    });
    expect(created.status).toBe(201);
    const cliente = await created.json();
    expect(cliente.id).toMatch(UUID_RE);

    const del = await fetch(`${baseUrl}/clientes/${cliente.id}`, {
      method: "DELETE",
      headers: { "x-user": "qa@xpto.local" },
    });
    expect(del.ok).toBe(true);

    const audit = await fetch(
      `${baseUrl}/eventosAuditoria?entidadeId=${cliente.id}&entidade=cliente&acao=exclusao`,
    ).then((r) => r.json());
    expect(audit.length).toBeGreaterThan(0);
    expect(audit[0].acao).toBe("exclusao");
    expect(audit[0].usuario).toBe("qa@xpto.local");
    expect(audit[0].estadoAnterior).not.toBeNull();
    expect(audit[0].estadoPosterior).toBeNull();
  });

  it("DELETE em /ordensVenda NÃO cria evento de exclusão (regra de negócio)", async () => {
    const ov = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "qa@xpto.local",
      },
      body: JSON.stringify({
        clienteId: ids.alphaId,
        transporteId: ids.alphaTransporteId,
        itens: [{ itemId: ids.itemId, quantidade: 1, precoUnitario: 50 }],
      }),
    }).then((r) => r.json());
    await fetch(`${baseUrl}/ordensVenda/${ov.id}`, {
      method: "DELETE",
      headers: { "x-user": "qa@xpto.local" },
    });
    const audit = await fetch(
      `${baseUrl}/eventosAuditoria?entidadeId=${ov.id}&entidade=ordemVenda&acao=exclusao`,
    ).then((r) => r.json());
    expect(audit.length).toBe(0);
    // Confirma que existe apenas o evento de criação
    const criacao = await fetch(
      `${baseUrl}/eventosAuditoria?entidadeId=${ov.id}&entidade=ordemVenda&acao=criacao`,
    ).then((r) => r.json());
    expect(criacao.length).toBeGreaterThan(0);
  });
});

describe("Auditoria — eventos gerados automaticamente", () => {
  it("criação de OV gera evento com estadoAnterior=null e estadoPosterior=CRIADA", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "qa@XPTO.local",
      },
      body: JSON.stringify({
        clienteId: ids.alphaId,
        transporteId: ids.alphaTransporteId,
        itens: [{ itemId: ids.itemId, quantidade: 1, precoUnitario: 50 }],
      }),
    });
    const ov = await res.json();

    const auditRes = await fetch(
      `${baseUrl}/eventosAuditoria?entidadeId=${ov.id}&entidade=ordemVenda&acao=criacao`,
    );
    const eventos = await auditRes.json();
    expect(eventos.length).toBeGreaterThan(0);
    const ev = eventos[0];
    expect(ev.usuario).toBe("qa@XPTO.local");
    expect(ev.estadoAnterior).toBeNull();
    expect(ev.estadoPosterior).toBe("CRIADA");
  });
});
