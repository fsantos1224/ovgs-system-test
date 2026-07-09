// Testes unitários — funções puras do domínio, sem mock de network
import { describe, it, expect } from "vitest";
import { canTransition, statusLabel } from "./types";

describe("canTransition", () => {
  it("permite transição sequencial CRIADA → PLANEJADA", () => {
    expect(canTransition("CRIADA", "PLANEJADA")).toBe(true);
  });

  it("rejeita salto de estado CRIADA → ENTREGUE", () => {
    expect(canTransition("CRIADA", "ENTREGUE")).toBe(false);
  });

  it("permite transição completa até ENTREGUE", () => {
    expect(canTransition("PLANEJADA", "AGENDADA")).toBe(true);
    expect(canTransition("AGENDADA", "EM_TRANSPORTE")).toBe(true);
    expect(canTransition("EM_TRANSPORTE", "ENTREGUE")).toBe(true);
  });

  it("rejeita transição de estado final", () => {
    expect(canTransition("ENTREGUE", "CRIADA")).toBe(false);
  });

  it("rejeita transição para o mesmo estado", () => {
    expect(canTransition("CRIADA", "CRIADA")).toBe(false);
  });
});

describe("statusLabel", () => {
  it("retorna label em português", () => {
    expect(statusLabel("CRIADA")).toBe("Criada");
    expect(statusLabel("EM_TRANSPORTE")).toBe("Em Transporte");
  });
});
