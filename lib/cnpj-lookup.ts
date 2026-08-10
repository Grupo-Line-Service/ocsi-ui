/**
 * Consulta pública de CNPJ e CEP com FALLBACK entre provedores gratuitos.
 * CNPJ: BrasilAPI → CNPJá (open). CEP: BrasilAPI → ViaCEP. Todos sem chave.
 * Devolve os campos já mapeados para o cadastro.
 *
 * ⚠️ CHAME SEMPRE DO SERVIDOR (Server Action, route handler ou server
 * component). O `import "server-only"` do saas-gestao foi removido aqui porque
 * o pacote não depende do Next, mas a recomendação continua a mesma: no
 * browser isto vira uma requisição cross-origin e o provedor pode barrar.
 */

export type Socio = {
  nome: string;
  qualificacao: string | null;
  entrada: string | null;
  faixa_etaria: string | null;
};
export type CnaeSecundario = { codigo: string; descricao: string };

export type DadosCnpj = {
  razao_social: string;
  nome_fantasia: string | null;
  abertura: string | null;
  emails: string[];
  telefones: string[];
  optante_simples: boolean;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cnae_codigo: string | null;
  cnae_descricao: string | null;
  cnaes_secundarios: CnaeSecundario[];
  natureza_juridica: string | null;
  porte: string | null;
  capital_social: number | null;
  situacao_cadastral: string | null;
  socios: Socio[];
};

function soDigitos(v: unknown): string {
  return String(v ?? "").replace(/\D/g, "");
}
function str(v: unknown): string | null {
  const s = v == null ? "" : String(v).trim();
  return s || null;
}

async function pegarJson(url: string, ms = 8000): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      headers: { accept: "application/json", "user-agent": "GrupoLineService/1.0" },
      cache: "no-store",
      signal: ctrl.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

// ---- BrasilAPI ----
function mapBrasilApi(d: Record<string, unknown>): DadosCnpj {
  const telefones = [str(d.ddd_telefone_1), str(d.ddd_telefone_2)].filter((t): t is string => Boolean(t));
  const emails = [str(d.email)].filter((e): e is string => Boolean(e));
  const qsa = Array.isArray(d.qsa) ? (d.qsa as Record<string, unknown>[]) : [];
  const sec = Array.isArray(d.cnaes_secundarios) ? (d.cnaes_secundarios as Record<string, unknown>[]) : [];
  const cap = Number(d.capital_social);
  return {
    razao_social: str(d.razao_social) ?? "",
    nome_fantasia: str(d.nome_fantasia),
    abertura: str(d.data_inicio_atividade),
    emails,
    telefones,
    optante_simples: d.opcao_pelo_simples === true,
    cep: str(d.cep) ? soDigitos(d.cep) : null,
    logradouro: str(d.logradouro),
    numero: str(d.numero),
    complemento: str(d.complemento),
    bairro: str(d.bairro),
    cidade: str(d.municipio),
    uf: str(d.uf),
    cnae_codigo: str(d.cnae_fiscal),
    cnae_descricao: str(d.cnae_fiscal_descricao),
    cnaes_secundarios: sec.map((c) => ({ codigo: str(c.codigo) ?? "", descricao: str(c.descricao) ?? "" })),
    natureza_juridica: str(d.natureza_juridica),
    porte: str(d.porte),
    capital_social: Number.isFinite(cap) ? cap : null,
    situacao_cadastral: str(d.descricao_situacao_cadastral),
    socios: qsa.map((s) => ({
      nome: str(s.nome_socio) ?? "",
      qualificacao: str(s.qualificacao_socio),
      entrada: str(s.data_entrada_sociedade),
      faixa_etaria: str(s.faixa_etaria),
    })),
  };
}

// ---- CNPJá (open) ----
function mapCnpja(d: Record<string, unknown>): DadosCnpj {
  const company = (d.company ?? {}) as Record<string, unknown>;
  const address = (d.address ?? {}) as Record<string, unknown>;
  const phones = Array.isArray(d.phones) ? (d.phones as Record<string, unknown>[]) : [];
  const emails = Array.isArray(d.emails) ? (d.emails as Record<string, unknown>[]) : [];
  const members = Array.isArray(company.members) ? (company.members as Record<string, unknown>[]) : [];
  const side = Array.isArray(d.sideActivities) ? (d.sideActivities as Record<string, unknown>[]) : [];
  const main = (d.mainActivity ?? {}) as Record<string, unknown>;
  const nature = (company.nature ?? {}) as Record<string, unknown>;
  const size = (company.size ?? {}) as Record<string, unknown>;
  const simples = (company.simples ?? {}) as Record<string, unknown>;
  const statusObj = (d.status ?? {}) as Record<string, unknown>;
  const cap = Number(company.equity);
  return {
    razao_social: str(company.name) ?? "",
    nome_fantasia: str(d.alias),
    abertura: str(d.founded),
    emails: emails.map((e) => str(e.address)).filter((e): e is string => Boolean(e)),
    telefones: phones
      .map((p) => `(${str(p.area) ?? ""}) ${str(p.number) ?? ""}`.trim())
      .filter((p) => p !== "()"),
    optante_simples: (simples.optant as boolean) === true,
    cep: str(address.zip) ? soDigitos(address.zip) : null,
    logradouro: str(address.street),
    numero: str(address.number),
    complemento: str(address.details),
    bairro: str(address.district),
    cidade: str(address.city),
    uf: str(address.state),
    cnae_codigo: str(main.id),
    cnae_descricao: str(main.text),
    cnaes_secundarios: side.map((a) => ({ codigo: str(a.id) ?? "", descricao: str(a.text) ?? "" })),
    natureza_juridica: str(nature.text),
    porte: str(size.text),
    capital_social: Number.isFinite(cap) ? cap : null,
    situacao_cadastral: str(statusObj.text),
    socios: members.map((m) => {
      const person = (m.person ?? {}) as Record<string, unknown>;
      const role = (m.role ?? {}) as Record<string, unknown>;
      return { nome: str(person.name) ?? "", qualificacao: str(role.text), entrada: str(m.since), faixa_etaria: str(person.age) };
    }),
  };
}

export async function buscarCnpj(cnpjBruto: string): Promise<DadosCnpj | { erro: string }> {
  const cnpj = soDigitos(cnpjBruto);
  if (cnpj.length !== 14) return { erro: "CNPJ deve ter 14 dígitos." };

  // 1) BrasilAPI
  const r1 = await pegarJson(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
  if (r1?.ok) return mapBrasilApi((await r1.json()) as Record<string, unknown>);
  if (r1?.status === 404) return { erro: "CNPJ não encontrado na Receita." };

  // 2) CNPJá (fallback)
  const r2 = await pegarJson(`https://open.cnpja.com/office/${cnpj}`);
  if (r2?.ok) return mapCnpja((await r2.json()) as Record<string, unknown>);
  if (r2?.status === 404) return { erro: "CNPJ não encontrado na Receita." };

  return { erro: "Consulta indisponível no momento (limite dos serviços). Tente de novo em instantes." };
}

export type DadosCep = {
  logradouro: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
};

export async function buscarCep(cepBruto: string): Promise<DadosCep | { erro: string }> {
  const cep = soDigitos(cepBruto);
  if (cep.length !== 8) return { erro: "CEP deve ter 8 dígitos." };

  // 1) BrasilAPI
  const r1 = await pegarJson(`https://brasilapi.com.br/api/cep/v2/${cep}`);
  if (r1?.ok) {
    const d = (await r1.json()) as Record<string, unknown>;
    return { logradouro: str(d.street), bairro: str(d.neighborhood), cidade: str(d.city), uf: str(d.state) };
  }

  // 2) ViaCEP (fallback)
  const r2 = await pegarJson(`https://viacep.com.br/ws/${cep}/json/`);
  if (r2?.ok) {
    const d = (await r2.json()) as Record<string, unknown>;
    if (d.erro) return { erro: "CEP não encontrado." };
    return { logradouro: str(d.logradouro), bairro: str(d.bairro), cidade: str(d.localidade), uf: str(d.uf) };
  }

  return { erro: "Não foi possível consultar o CEP agora." };
}
