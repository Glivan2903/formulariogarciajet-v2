import nodemailer, { type Transporter } from "nodemailer";

export interface AnexoEmail {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface DestinatarioEmail {
  /** Identificador usado apenas nos logs e na resposta da API */
  tipo: string;
  email: string;
}

export interface ResultadoEnvio {
  tipo: string;
  email: string;
  ok: boolean;
  erro?: string;
}

const MAX_TENTATIVAS = 3;

let transporterCache: Transporter | null = null;

/**
 * Cria (uma única vez) o transporte SMTP a partir das variáveis de ambiente.
 * Lança erro se a configuração estiver incompleta, para que a rota caia no fallback.
 */
export const getTransporter = (): Transporter => {
  if (transporterCache) return transporterCache;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP não configurado. Defina SMTP_HOST, SMTP_USER e SMTP_PASS no .env.local."
    );
  }

  transporterCache = nodemailer.createTransport({
    host,
    port,
    // Porta 465 usa TLS implícito; 587 usa STARTTLS.
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465,
    auth: { user, pass },
  });

  return transporterCache;
};

const espera = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Lista os destinatários da cotação: 1 endereço fixo + os dois informados na Etapa 1. */
export const montarDestinatarios = (
  emailMatriz?: string,
  emailComercial?: string
): DestinatarioEmail[] => {
  const fixo = process.env.EMAIL_DESTINATARIO_FIXO;

  const candidatos: DestinatarioEmail[] = [
    { tipo: "matriz-fixo", email: (fixo || "").trim() },
    { tipo: "corretora", email: (emailMatriz || "").trim() },
    { tipo: "comercial", email: (emailComercial || "").trim() },
  ];

  // Remove vazios e endereços repetidos (evita enviar o mesmo e-mail duas vezes
  // quando a corretora informa o mesmo endereço nos dois campos).
  const vistos = new Set<string>();
  return candidatos.filter((destinatario) => {
    const chave = destinatario.email.toLowerCase();
    if (!chave || vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
};

interface OpcoesEnvio {
  destinatarios: DestinatarioEmail[];
  assunto: string;
  html: string;
  anexos: AnexoEmail[];
}

/**
 * Envia a cotação para cada destinatário de forma independente, com até
 * MAX_TENTATIVAS tentativas por endereço. A falha de um não impede os demais.
 */
export const enviarCotacaoPorEmail = async ({
  destinatarios,
  assunto,
  html,
  anexos,
}: OpcoesEnvio): Promise<ResultadoEnvio[]> => {
  const transporter = getTransporter();
  const remetente = process.env.EMAIL_FROM;

  if (!remetente) {
    throw new Error("EMAIL_FROM não configurado no .env.local.");
  }

  const resultados: ResultadoEnvio[] = [];

  for (const destinatario of destinatarios) {
    let ultimoErro = "";

    for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
      try {
        await transporter.sendMail({
          from: remetente,
          to: destinatario.email,
          subject: assunto,
          html,
          attachments: anexos,
        });

        resultados.push({ ...destinatario, ok: true });
        ultimoErro = "";
        break;
      } catch (erro) {
        ultimoErro = erro instanceof Error ? erro.message : "Erro desconhecido";
        console.error(
          `[E-mail] Falha ao enviar para ${destinatario.email} (tentativa ${tentativa}/${MAX_TENTATIVAS}):`,
          ultimoErro
        );

        if (tentativa < MAX_TENTATIVAS) {
          await espera(tentativa * 1000);
        }
      }
    }

    if (ultimoErro) {
      resultados.push({ ...destinatario, ok: false, erro: ultimoErro });
    }
  }

  return resultados;
};
