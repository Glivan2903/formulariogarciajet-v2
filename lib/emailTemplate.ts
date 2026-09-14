import {
  SITUACAO_SEGURO_OPTIONS,
  SITUACAO_SINISTRO_OPTIONS,
  CLASSE_CONSTRUCAO_OPTIONS,
} from "@/lib/constants";

// Títulos de cada etapa no corpo do e-mail (mesmos usados no formulário)
const TITULOS: Record<string, string> = {
  Etapa1: "🏢 Dados da Corretora e Proponente",
  Etapa2: "📋 Situação do Seguro",
  Etapa3: "📍 Localização do Risco",
  Etapa4: "🏭 Atividade e 🏗️ Classe de Construção",
  Etapa5: "🛡️ Protecionais - Sistemas de Proteção",
  Etapa6: "💰 Valores em Risco e Importâncias Seguradas",
  Etapa7: "🔒 Coberturas - Importâncias Seguradas",
  Etapa8: "📎 Observações e Documentos",
};

// Traduz os valores internos dos selects/radios para o texto que o corretor viu na tela
const ROTULOS_DE_VALOR: Record<string, string> = {
  sim: "Sim",
  nao: "Não",
  industrial: "Industrial",
  "comercio-servicos": "Comércio e Serviços",
  ...Object.fromEntries(SITUACAO_SEGURO_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(SITUACAO_SINISTRO_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CLASSE_CONSTRUCAO_OPTIONS.map((o) => [o.value, o.label])),
};

const escapeHtml = (texto: string): string =>
  texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Datas vindas do input date chegam como "aaaa-mm-dd" e precisam ser lidas como
// data local, senão o fuso empurra o dia para trás na exibição.
const formatarData = (valor: unknown): string => {
  const texto = String(valor).trim();

  // Já está em dd/mm/aaaa (formato produzido pelo próprio formulário).
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return texto;

  // Vindo do input date: "aaaa-mm-dd" precisa ser lido como data local,
  // senão o fuso empurra o dia para trás na exibição.
  const soData = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (soData) {
    const [, ano, mes, dia] = soData;
    return `${dia}/${mes}/${ano}`;
  }

  const data = new Date(texto);
  return isNaN(data.getTime()) ? texto : data.toLocaleDateString("pt-BR");
};

const formatarMoeda = (valor: unknown): string => {
  const numero =
    typeof valor === "string"
      ? parseFloat(valor.replace(/[^\d,.-]/g, "").replace(",", "."))
      : Number(valor);

  if (isNaN(numero)) return String(valor);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const ehNumerico = (valor: unknown): boolean => {
  if (typeof valor === "number") return !isNaN(valor);
  if (typeof valor !== "string") return false;
  return valor.trim() !== "" && !isNaN(Number(valor.replace(",", ".")));
};

const ehCampoDeData = (label: string): boolean =>
  /vig[êe]ncia\s+(in[íi]cio|inicial|final)/i.test(label);

const ehPeriodoIndenitario = (label: string): boolean =>
  /^Per[íi]odo Indenit[áa]rio/i.test(label);

// Monta uma linha da tabela. Campos vazios, nulos ou zerados não entram no e-mail.
const montarLinha = (label: string, valor: unknown, etapa: string): string => {
  if (valor === null || valor === undefined || valor === "") return "";
  if (valor === 0 || valor === "0") return "";

  let valorFormatado: string;

  if (ehCampoDeData(label)) {
    valorFormatado = formatarData(valor);
  } else if (ehPeriodoIndenitario(label)) {
    valorFormatado = `${valor} ${Number(valor) === 1 ? "mês" : "meses"}`;
  } else if (typeof valor === "string" && ROTULOS_DE_VALOR[valor]) {
    valorFormatado = ROTULOS_DE_VALOR[valor];
  } else if ((etapa === "Etapa6" || etapa === "Etapa7") && ehNumerico(valor)) {
    valorFormatado = formatarMoeda(valor);
  } else {
    valorFormatado = String(valor);
  }

  const rotuloLimpo = ehCampoDeData(label)
    ? label.replace(/^Data de /i, "")
    : label;

  return `<tr><td class="label">${escapeHtml(rotuloLimpo)}</td><td class="valor">${escapeHtml(
    valorFormatado
  ).replace(/\n/g, "<br>")}</td></tr>`;
};

const montarEtapa = (etapa: string, dados: Record<string, unknown>): string => {
  if (!dados || typeof dados !== "object") return "";

  const linhas = Object.keys(dados)
    .map((chave) => montarLinha(chave, dados[chave], etapa))
    .join("");

  if (linhas.trim() === "") return "";

  return `
    <h2>${TITULOS[etapa] || etapa}</h2>
    <table>${linhas}</table>
  `;
};

const montarBlocoAnexos = (anexos: string[]): string => {
  if (anexos.length === 0) return "";

  const itens = anexos
    .map((nome) => `<li>${escapeHtml(nome)}</li>`)
    .join("");

  return `
    <h2>📎 Arquivos Anexados</h2>
    <p style="color:#555; font-size:13px; margin:6px 0 10px;">
      Os arquivos abaixo seguem anexados a este e-mail.
    </p>
    <ul class="anexos">${itens}</ul>
  `;
};

interface OpcoesEmail {
  organizedData: Record<string, Record<string, unknown>>;
  quotationCode: string;
  anexos?: string[];
  logoUrl?: string;
}

export const buildEmailHtml = ({
  organizedData,
  quotationCode,
  anexos = [],
  logoUrl,
}: OpcoesEmail): string => {
  const etapasOrdenadas = Object.keys(organizedData).sort(
    (a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""))
  );

  const conteudo = etapasOrdenadas
    .map((etapa) => montarEtapa(etapa, organizedData[etapa]))
    .join("");

  const geradoEm = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  return `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<title>Nova Cotação - ${escapeHtml(quotationCode)}</title>
<style>
  body { font-family: "Segoe UI", Arial, sans-serif; background:#f4f6f8; color:#222; margin:0; padding:20px; }
  .container { max-width: 900px; margin:auto; background:#fff; border-radius:12px; padding:30px; box-shadow:0 6px 20px rgba(0,0,0,0.06); }
  .topo { text-align:center; border-bottom:1px solid #eee; padding-bottom:18px; margin-bottom:20px; }
  .topo img { max-height:70px; display:block; margin:0 auto 8px; }
  h1 { color:#0052cc; font-size:20px; margin:0; }
  h2 { color:#0052cc; border-bottom:2px solid #eee; padding-bottom:5px; margin-top:30px; font-size:16px; }
  .cotacao { display:inline-block; margin-top:10px; padding:6px 14px; background:#0052cc; color:#fff; border-radius:6px; font-weight:600; letter-spacing:0.5px; }
  table { width:100%; border-collapse:collapse; margin-top:10px; }
  td { padding:10px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
  .label { width:35%; font-weight:600; color:#444; background:#fafafa; border-right:1px solid #f1f1f1; }
  .valor { width:65%; color:#111; }
  .anexos { margin:0; padding-left:20px; color:#111; }
  .anexos li { padding:3px 0; }
  .footer { text-align:center; font-size:12px; color:#777; border-top:1px solid #eee; padding-top:10px; margin-top:30px; }
</style>
</head>
<body>
  <div class="container">
    <div class="topo">
      ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="Logo">` : ""}
      <h1>Resumo das Informações Recebidas</h1>
      <div class="cotacao">Cotação ${escapeHtml(quotationCode)}</div>
      <p style="font-size:13px; color:#777;">Gerado automaticamente em ${geradoEm}</p>
    </div>

    ${conteudo}
    ${montarBlocoAnexos(anexos)}

    <div class="footer">E-mail automático • © ${new Date().getFullYear()}</div>
  </div>
</body>
</html>`;
};
