// Testes unitários — funções puras do domínio, sem mock de network
import { describe, it, expect } from "vitest";
import { canTransition, canUseTransporte, statusLabel } from "./types";

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

describe("canUseTransporte", () => {
  it("permite transporte presente na lista", () => {
    expect(canUseTransporte({ transportesAutorizados: ["1", "3"] }, "3")).toBe(true);
  });

  it("rejeita transporte ausente", () => {
    expect(canUseTransporte({ transportesAutorizados: ["1"] }, "2")).toBe(false);
  });

  it("retorna false para cliente nulo/indefinido", () => {
    expect(canUseTransporte(null, "1")).toBe(false);
    expect(canUseTransporte(undefined, "1")).toBe(false);
  });
});
