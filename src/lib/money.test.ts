import { describe, it, expect } from "vitest";
import { parseBRLtoCents } from "./money";

describe("parseBRLtoCents", () => {
  it("formato BRL com prefixo R$", () => {
    expect(parseBRLtoCents("R$ 1.500,00")).toBe(150000);
    expect(parseBRLtoCents("R$ 0,99")).toBe(99);
  });

  it("formato pt-BR sem prefixo", () => {
    expect(parseBRLtoCents("1.500,00")).toBe(150000);
    expect(parseBRLtoCents("1500,00")).toBe(150000);
  });

  it("valor simples sem separador de milhar", () => {
    expect(parseBRLtoCents("1500,00")).toBe(150000);
    expect(parseBRLtoCents("99,90")).toBe(9990);
  });

  it("decimal com ponto (formato en)", () => {
    expect(parseBRLtoCents("1500.00")).toBe(150000);
  });

  it("valor inteiro sem decimal", () => {
    expect(parseBRLtoCents("1500")).toBe(150000);
  });

  it("tolerante a espaços extras", () => {
    expect(parseBRLtoCents("  R$  1.500,00  ")).toBe(150000);
  });

  it("retorna null para entrada inválida", () => {
    expect(parseBRLtoCents("")).toBeNull();
    expect(parseBRLtoCents("abc")).toBeNull();
    expect(parseBRLtoCents("R$")).toBeNull();
    expect(parseBRLtoCents("1.500.00,00")).toBeNull();
  });

  it("rejeita 3+ casas decimais (input mal-formado)", () => {
    expect(parseBRLtoCents("R$ 1,005")).toBeNull();
    expect(parseBRLtoCents("R$ 1,123")).toBeNull();
  });
});
