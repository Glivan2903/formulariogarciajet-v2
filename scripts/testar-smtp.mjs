/**
 * Testa as credenciais SMTP do .env.local sem precisar preencher o formulário.
 *
 *   node scripts/testar-smtp.mjs                    -> só testa a conexão/login
 *   node scripts/testar-smtp.mjs voce@email.com     -> conecta e envia um e-mail real
 */
import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";

const raiz = process.cwd();
const arquivoEnv = path.join(raiz, ".env.local");

if (!fs.existsSync(arquivoEnv)) {
  console.error("✖ .env.local não encontrado. Copie o .env.example e preencha as credenciais.");
  process.exit(1);
}

// Leitura simples do .env.local (sem dependências extras)
for (const linha of fs.readFileSync(arquivoEnv, "utf8").split("\n")) {
  const limpa = linha.trim();
  if (!limpa || limpa.startsWith("#")) continue;
  const separador = limpa.indexOf("=");
  if (separador === -1) continue;
  const chave = limpa.slice(0, separador).trim();
  const valor = limpa.slice(separador + 1).trim().replace(/^["']|["']$/g, "");
  if (valor) process.env[chave] = valor;
}

const { SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
const porta = Number(process.env.SMTP_PORT || 587);
const seguro = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : porta === 465;

const faltando = Object.entries({ SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM })
  .filter(([, valor]) => !valor)
  .map(([chave]) => chave);

if (faltando.length > 0) {
  console.error(`✖ Faltam variáveis no .env.local: ${faltando.join(", ")}`);
  process.exit(1);
}

console.log("Configuração lida do .env.local:");
console.log(`  Servidor .......... ${SMTP_HOST}:${porta} (${seguro ? "SSL/TLS" : "STARTTLS"})`);
console.log(`  Usuário ........... ${SMTP_USER}`);
console.log(`  Senha ............. ${"*".repeat(Math.min(SMTP_PASS.length, 12))}`);
console.log(`  Remetente ......... ${EMAIL_FROM}`);
console.log("");

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: porta,
  secure: seguro,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
});

try {
  console.log("→ Testando conexão e autenticação...");
  await transporter.verify();
  console.log("✔ Conexão e login OK.\n");
} catch (erro) {
  console.error("✖ Falhou:", erro.message);
  console.error("\nCausas mais comuns:");
  console.error("  • Usuário/senha incorretos (na Locaweb o usuário é o e-mail completo)");
  console.error("  • Porta e SMTP_SECURE incompatíveis (465 = true, 587 = false)");
  console.error("  • Caixa com verificação em duas etapas exigindo senha de aplicativo");
  process.exit(1);
}

const destino = process.argv[2];

if (!destino) {
  console.log("Nenhum destinatário informado — nenhum e-mail foi enviado.");
  console.log("Para enviar um e-mail real: node scripts/testar-smtp.mjs voce@email.com");
  process.exit(0);
}

try {
  console.log(`→ Enviando e-mail de teste para ${destino}...`);
  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to: destino,
    subject: "Teste de SMTP - Formulário de Seguro Incêndio",
    html: `<p>Se você está lendo isto, o envio por e-mail do formulário está funcionando.</p>
           <p>Servidor: <strong>${SMTP_HOST}:${porta}</strong><br>
           Enviado em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>`,
    attachments: [
      { filename: "anexo-de-teste.txt", content: "Anexo de teste do formulário de cotação." },
    ],
  });
  console.log(`✔ Enviado. ID: ${info.messageId}`);
  console.log(`  Aceitos: ${info.accepted.join(", ") || "nenhum"}`);
  if (info.rejected.length > 0) console.log(`  Rejeitados: ${info.rejected.join(", ")}`);
} catch (erro) {
  console.error("✖ Falha no envio:", erro.message);
  process.exit(1);
}
