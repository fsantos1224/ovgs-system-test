// Testes de integração do server.cjs.
// Usa spawn do subprocesso em vez de supertest-in-memory para exercitar o
// json-server real (idempotency store, filesystem writes, CORS).

import { spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync, copyFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..");
const REPO = ROOT;

let proc: ChildProcess;
let baseUrl: string;
let tmpDataDir: string;

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

beforeAll(async () => {
  // Porta efêmera para evitar conflito com dev server / E2E.
  const port = 4100 + Math.floor(Math.random() * 1000);
  baseUrl = `http://127.0.0.1:${port}`;

  // Diretório temporário com db.json seedado a partir do repo.
  tmpDataDir = mkdtempSync(join(tmpdir(), "ovgs-int-"));
  const seedSrc = join(REPO, "db.json");
  const seedDst = join(tmpDataDir, "db.json");
  copyFileSync(seedSrc, seedDst);

  // DATA_FILE customizado para isolar do volume Docker.
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
}, 30_000);

afterAll(() => {
  proc?.kill("SIGTERM");
  if (tmpDataDir && existsSync(tmpDataDir)) {
    rmSync(tmpDataDir, { recursive: true, force: true });
  }
});

describe("POST /ordensVenda — regras de negócio", () => {
  it("retorna 400 quando cliente é inativo", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user": "admin@ovgs.local" },
      body: JSON.stringify({
        clienteId: "3", // Gamma — ativo: false
        transporteId: "1",
        itens: [{ itemId: "1", quantidade: 10, precoUnitario: 0.5 }],
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/inativo/i);
  });

  it("retorna 400 quando transporte não é autorizado para o cliente", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user": "admin@ovgs.local" },
      body: JSON.stringify({
        clienteId: "2", // Beta — só autorizado [2]
        transporteId: "1", // rodoviário
        itens: [{ itemId: "1", quantidade: 10, precoUnitario: 0.5 }],
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/não autorizado/i);
    expect(body.transportesAutorizados).toEqual(["2"]);
  });

  it("cria OV válida com transporte autorizado", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user": "admin@ovgs.local" },
      body: JSON.stringify({
        clienteId: "1", // Alpha — autorizados [1, 3]
        transporteId: "1",
        itens: [{ itemId: "1", quantidade: 10, precoUnitario: 0.5 }],
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.status).toBe("CRIADA");
    expect(body.valorTotal).toBe(5);
  });
});

describe("POST /ordensVenda — idempotência", () => {
  it("retorna o mesmo body para o mesmo Idempotency-Key", async () => {
    const key = crypto.randomUUID();
    const payload = {
      clienteId: "1",
      transporteId: "1",
      itens: [{ itemId: "2", quantidade: 5, precoUnitario: 0.3 }],
    };
    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": "admin@ovgs.local",
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
});

describe("PATCH /ordensVenda/:id — máquina de estados", () => {
  let ovId: string;

  beforeAll(async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user": "admin@ovgs.local" },
      body: JSON.stringify({
        clienteId: "1",
        transporteId: "1",
        itens: [{ itemId: "1", quantidade: 1, precoUnitario: 0.5 }],
      }),
    });
    ovId = (await res.json()).id;
  });

  it("rejeita transição pulando um estado (CRIADA → AGENDADA)", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda/${ovId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user": "admin@ovgs.local" },
      body: JSON.stringify({ status: "AGENDADA" }),
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.transicoesValidas).toEqual(["PLANEJADA"]);
  });

  it("permite transição válida CRIADA → PLANEJADA", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda/${ovId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user": "admin@ovgs.local" },
      body: JSON.stringify({ status: "PLANEJADA" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("PLANEJADA");
  });
});

describe("Auditoria — eventos gerados automaticamente", () => {
  it("criação de OV gera evento em eventosAuditoria", async () => {
    const res = await fetch(`${baseUrl}/ordensVenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user": "qa@ovgs.local" },
      body: JSON.stringify({
        clienteId: "1",
        transporteId: "1",
        itens: [{ itemId: "1", quantidade: 1, precoUnitario: 0.5 }],
      }),
    });
    const ov = await res.json();

    const auditRes = await fetch(
      `${baseUrl}/eventosAuditoria?entidadeId=${ov.id}&entidade=ordemVenda&acao=criacao`,
    );
    const eventos = await auditRes.json();
    expect(eventos.length).toBeGreaterThan(0);
    const ev = eventos[0];
    expect(ev.usuario).toBe("qa@ovgs.local");
    expect(ev.estadoAnterior).toBeNull();
    expect(ev.estadoPosterior).toBe("CRIADA");
  });
});