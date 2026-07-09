export function parseBRLtoCents(input: string): number | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (trimmed === "") return null;

  const cleaned = trimmed.replace(/^R\$/i, "").replace(/\s+/g, "");
  if (cleaned === "") return null;

  let normalized: string;
  if (cleaned.includes(",")) {
    const lastComma = cleaned.lastIndexOf(",");
    const intSection = cleaned.slice(0, lastComma);
    // pt-BR aceita no máximo UM separador de milhar (.) na parte inteira,
    // ou nenhum. "1.500.00" ou "1.500.00,00" são mal-formados.
    if ((intSection.match(/\./g) ?? []).length > 1) return null;
    normalized = intSection.replace(/\./g, "") +
      cleaned.slice(lastComma).replace(",", ".");
  } else {
    // Sem vírgula: se houver mais de um ".", é separador de milhar inválido.
    if ((cleaned.match(/\./g) ?? []).length > 1) return null;
    normalized = cleaned;
  }

  // Decimal com até 2 casas, ou inteiro puro.
  // Rejeita "1.500.00", "1,005" (3 casas), "abc", "1.500,00,00".
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null;

  // Parse via string para evitar float imprecision no arredondamento.
  const [intPart, fracPart = ""] = normalized.replace("-", "").split(".");
  const cents = Number(intPart) * 100 + Number((fracPart + "00").slice(0, 2));
  if (!Number.isFinite(cents)) return null;

  return normalized.startsWith("-") ? -cents : cents;
}
