import { type NextRequest, NextResponse } from "next/server"
import { buildEmailHtml } from "@/lib/emailTemplate"
import {
  enviarCotacaoPorEmail,
  montarDestinatarios,
  type AnexoEmail,
  type ResultadoEnvio,
} from "@/lib/mailer"

// Anexos podem deixar a requisição pesada; a rota precisa rodar em Node.js.
export const runtime = "nodejs"
export const maxDuration = 60

const FIELDS_BY_STEP = {
  Etapa1: {
    title: "Dados da Corretora e Proponente",
    fields: {
      dataInicial: "Data de Vigência Inicial",
      vigenciaFinal: "Data de Vigência Final",
      numeroCotacao: "Número da Cotação",
      nomeCorretora: "Nome da Corretora",
      numeroSusep: "Número da SUSEP",
      emailMatriz: "Email da Matriz da Corretora",
      emailComercial: "Email do Comercial/Assistente",
      nomeComercial: "Nome do Comercial/Assistente",
      whatsappComercial: "WhatsApp de Contato",
      nomeProponente: "Nome do Proponente",
      cnpj: "CNPJ",
      comissaoNegocio: "Comissão do Negócio (%)",
      orgaoPublico: "Segurado é Órgão Público?",
    },
  },
  Etapa2: {
    title: "Situação do Seguro",
    fields: {
      situacaoSeguro: "Situação do Seguro",
      seguradoraAnterior: "Nome da Seguradora Anterior",
      situacaoSinistro: "Situação de Sinistros",
      ocorrenciaSinistro: "Ocorrência de Sinistro nos Últimos 5 Anos - Tipo de Sinistro, Causa e Valor dos Prejuízos",
      clausulaBeneficiaria: "Será necessária a inclusão de cláusula beneficiária?",
      sinistralidade5Anos: "Sinistralidade dos últimos 5 anos",
      possuiuSeguroAnterior: "Possuiu seguro anteriormente?",
      motivoSemSeguro: "Motivo de estar sem seguro até a presente data",
      localEmOperacao: "O local está em operação/atividade?",
      condominioLogistico: "Local fica dentro de condomínio logístico/empresarial e divide o prédio com outras empresas?",
    },
  },
  Etapa3: {
    title: "Localização do Risco",
    fields: {
      cep: "Digite o C.E.P. do Local",
      rua: "LOCAL 1 RUA/AVENIDA",
      numero: "NÚMERO",
      complemento: "COMPLEMENTO",
      bairro: "BAIRRO",
      municipio: "MUNICÍPIO",
      estado: "ESTADO",
    },
  },
  Etapa4: {
    title: "Atividade e Classe de Construção",
    fields: {
      tipoAtividade: "Tipo de Atividade",
      atividadeIndustrialSelecionada: "Selecione a Atividade Industrial",
      atividadeIndustrial: "Descreva o processo industrial e o que fabrica",
      atividadeComercialSelecionada: "Selecione a Atividade de Comércio e Serviços",
      atividadeComercial: "Descreva a mercadoria comercializada e se tem depósito no local",
      classeConstrucao: "Escolha SOMENTE UMA das classes de construção abaixo",
      tipoIsopainel: "Tipo de Isopainel do Local",
    },
  },
  Etapa5: {
    title: "Protecionais - Sistemas de Proteção",
    fields: {
      protecional_alarmeIncendio: "Alarme de incêndio e/ou Detectores de fumaça",
      protecional_alarmeInfravermelho: "Alarme infravermelho ou de impacto",
      protecional_brigadaEmergencia: "Brigada e plano de emergência",
      protecional_cftv: "CFTV - CIRCUITO FECHADO DE TV",
      protecional_concertina: "Concertina e/ou cerca elétrica",
      protecional_diqueContencao: "Dique ou Bacia de contenção para Inflamáveis ou produtos químicos",
      protecional_eclusa: "Eclusa para pedestres e automóveis - duas barreiras de acesso",
      protecional_extintores: "Extintores",
      protecional_guaritaBlindada: "Guarita blindada",
      protecional_mergulhao: "Mergulhão",
      protecional_outrasProtecoes: "Outras proteções adicionais",
      protecional_paraRaios: "Para raios",
      protecional_redeHidrantes20: "Rede de hidrantes com RTI de 20m³ até 60m³",
      protecional_redeHidrantes60: "Rede de hidrantes com RTI de 60m³ até 120m³",
      protecional_redeHidrantes120: "Rede de hidrantes com RTI de mais de 120m³",
      protecional_redeSprinklers: "Rede de sprinklers",
      protecional_sistemaGarra: "Sistema garra de tigre - sistema de desacelerador",
      protecional_vigilanciaArmada: "Vigilância 24 h armada",
      protecional_vigilanciaDesarmada: "Vigilância 24 h desarmada",
    },
  },
  Etapa6: {
    title: "Valores em Risco e Importâncias Seguradas",
    fields: {
      limiteUnico: "Deseja cotar com L.M.I. Único para prédio e conteúdo?",
      valorRiscoPredioConteudo: "Valor em Risco Prédio + Conteúdo (R$)",
      impSeguradaPredioConteudo: "LMI / Imp Segurada Prédio+Conteúdo (R$)",
      lucrosCessantesDespesasFixas: "Garantia de Lucros Cessantes ou Despesas Fixas (R$)",
      valorRiscoPredio: "Valor em Risco Prédio (R$)",
      impSeguradaPredio: "LMI / Imp Segurada Prédio (R$)",
      valorRiscoMMU: "Valor em Risco MMU (Maq.Mov.Ut) (R$)",
      impSeguradaMMU: "LMI / Imp Segurada MMU (Maq.Mov.Ut) (R$)",
      valorRiscoMMP: "Valor em Risco MMP (Mercad/Matéria-Prima) (R$)",
      impSeguradaMMP: "LMI (MMP) Mercad/Matéria-Prima (R$)",
    },
  },
  Etapa7: {
    title: "Coberturas",
    fields: {
      cobertura_0: "Incêndio (Inclusive decorrente de tumulto), queda de raio, explosão e implosão de qualquer natureza e queda de aeronaves",
      cobertura_1: "Alagamento e/ou Inundação",
      cobertura_2: "Anúncios / Letreiros Luminosos",
      cobertura_3: "Concessionária de Veiculos",
      cobertura_4: "Danos Elétricos",
      cobertura_5: "Danos Fabricação (Work Damage)",
      cobertura_6: "Derrame ou Vazamento de Chuveiros Automáticos (Sprinklers) e Rede de Hidrante",
      cobertura_7: "Desmoronamento",
      cobertura_8: "Despesas com Honorários de Peritos – Danos Materiais",
      cobertura_9: "Despesas de Salvamento e Contenção de Sinistros",
      cobertura_10: "Despesas Extraordinarias",
      cobertura_11: "Deterioração de Mercadorias em Ambientes Frigorificados",
      cobertura_12: "Equipamentos Arrendados e/ou Cedidos a Terceiros",
      cobertura_13: "Equipamentos Cine/Foto/TV Operados em Estúdios, Laboratórios ou Reportagens Externas",
      cobertura_14: "Equipamentos Cine/Foto/TV Operados em Estúdios, Laboratórios ou Reportagens Internas",
      cobertura_16: "Equipamentos Eletrônicos COM Roubo",
      cobertura_15: "Equipamentos Eletrônicos SEM Roubo",
      cobertura_17: "Equipamentos em Exposição",
      cobertura_18: "Equipamentos Estacionários",
      cobertura_19: "Equipamentos Móveis (Com Tração Própria)",
      cobertura_20: "Equipamentos Portáteis",
      cobertura_21: "Extravasamento de Materiais em Estado de Fusão",
      cobertura_22: "Fermentação Própria ou Combustão Espontânea",
      cobertura_23: "Fidelidade",
      cobertura_24: "Galpão Vinilona",
      cobertura_25: "Incêndio Resultante de Queimadas em Zonas Rurais",
      cobertura_26: "Lucros Cessantes – Perda de Lucro Bruto (decorrente exclusivamente da garantia básica - Incêndio (Inclusive decorrente de tumulto), queda de raio, explosão e implosão de qualquer natureza e queda de aeronaves)",
      cobertura_55: "Lucros Cessantes decorrente exclusivamente de Danos Elétricos",
      cobertura_34: "Despesas Fixas (decorrente exclusivamente da garantia básica - Incêndio (Inclusive dec de tumulto), queda de raio, explosão e implosão de qualquer natureza e queda de aeronaves)",
      cobertura_35: "Despesas Fixas decorrente de Danos Elétricos",
      cobertura_36: "Despesas Fixas decorrente de Vendaval, Furacão, Ciclone, Tornado, Granizo, Impacto de Veículos Terrestres e Fumaça",
      cobertura_27: "Movimentação Interna de Mercadorias",
      cobertura_56: "Pagamento de Aluguel a Terceiros para Equipamentos",
      cobertura_28: "Pequenas Obras de Engenharia, para Ampliações, Reparos ou Reformas",
      cobertura_29: "Perda e/ou Pagamento de Aluguel",
      cobertura_30: "Quebra de Maquinas",
      cobertura_31: "Quebra de Vidros",
      cobertura_32: "Recomposição de Registros e Documentos",
      cobertura_33: "Remoção de Entulhos",
      cobertura_37: "Responsabilidade Civil - Chapa de Experiência - Danos ao Veículo",
      cobertura_38: "Responsabilidade Civil - Chapa de Experiência - Danos a veículos de terceiros e Danos Materiais ou Corporais a Terceiros",
      cobertura_39: "Responsabilidade Civil - Operações",
      cobertura_40: "Responsabilidade Civil – Dano Morais",
      cobertura_41: "Responsabilidade Civil – Empregador",
      cobertura_42: "Responsabilidade Civil - Estabelecimentos de Ensino",
      cobertura_43: "Responsabilidade Civil - Estabelecimentos de Hospedagem e Similares",
      cobertura_44: "Responsabilidade Civil - Guarda de Veículos de Terceiros – R.C. Garagista (Global) – Veículo Nacional ou Importado",
      cobertura_45: "Responsabilidade Civil - Guarda de Veículos de Terceiros (Incêndio e Roubo) – Nacional ou Importado",
      cobertura_46: "Responsabilidade Civil – Cobertura para Percurso entre o local de recepção e o local de guarda dos veículos – Danos Materiais a veículos de terceiros e Danos Materiais ou Corporais a Terceiros",
      cobertura_48: "Responsabilidade Civil - Portões",
      cobertura_47: "Responsabilidade Civil – Prestação de Serviços em locais de terceiros",
      cobertura_49: "Roubo e Furto Qualificado de Bens nas Dependências do Segurado",
      cobertura_50: "Roubo de Valores no Interior das Dependências do Segurado",
      cobertura_51: "Roubo e Furto Qualificado de Valores em Trânsito fora do estabelecimento",
      cobertura_52: "Tumultos, Greves e Lock-Out",
      cobertura_53: "Vendaval, Furacão, Ciclone, Tornado, Granizo, Impacto de Veículos Terrestres e Fumaça",
      cobertura_54: "Vazamento Acidental de Tanque, Ruptura de Encanamentos ou Tubulações do Próprio Imóvel",
      cobertura_57: "Despesas com instalação em novo local",
      cobertura_58: "Carga, Descarga, Içamento e Descida de Bens Segurados",
      cobertura_59: "Roubo ou Furto Qualificado de Bens de Hospedes",
      cobertura_60: "Despesa com defesa em juízo",
      cobertura_61: "Responsabilidade Civil - Riscos Contingentes de Veículos",
      periodo_26: "Período Indenitário - Lucros Cessantes – Perda de Lucro Bruto (decorrente exclusivamente da garantia básica - Incêndio (Inclusive decorrente de tumulto), queda de raio, explosão e implosão de qualquer natureza e queda de aeronaves) (meses)",
      periodo_55: "Período Indenitário - Lucros Cessantes decorrente exclusivamente de Danos Elétricos (meses)",
      periodo_34: "Período Indenitário - Despesas Fixas (decorrente exclusivamente da garantia básica - Incêndio (Inclusive dec de tumulto), queda de raio, explosão e implosão de qualquer natureza e queda de aeronaves) (meses)",
      periodo_35: "Período Indenitário - Despesas Fixas decorrente de Danos Elétricos (meses)",
      periodo_36: "Período Indenitário - Despesas Fixas decorrente de Vendaval, Furacão, Ciclone, Tornado, Granizo, Impacto de Veículos Terrestres e Fumaça (meses)",
      periodo_29: "Período Indenitário - Perda e/ou Pagamento de Aluguel (meses)",
    },
  },
  Etapa8: {
    title: "Observações e Documentos",
    fields: {
      observacoes: "Observações a Acrescentar",
      clausulasComplementares: "Cláusulas Complementares",
    },
  },
}

function generateQuotationCode(nomeCorretora: string, cnpj: string): string {
  const now = new Date()

  // Extract parts from broker name (first 3 letters, uppercase)
  const namePart = (nomeCorretora || "XXX")
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()

  // Extract last 4 digits from CNPJ
  const cnpjPart = (cnpj || "0000").replace(/[^0-9]/g, "").slice(-4)

  // Date and time parts
  const year = now.getFullYear().toString().slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hour = String(now.getHours()).padStart(2, "0")
  const minute = String(now.getMinutes()).padStart(2, "0")

  // Format: NAME-CNPJ-YYMMDD-HHMM
  return `${namePart}-${cnpjPart}-${year}${month}${day}-${hour}${minute}`
}

function organizeDataBySteps(data: Record<string, any>): Record<string, any> {
  const organizedData: Record<string, any> = {}

  // Iterate through each step
  for (const [stepKey, stepConfig] of Object.entries(FIELDS_BY_STEP)) {
    const stepData: Record<string, any> = {}

    // For each field in this step, get the value or set to null
    for (const [fieldKey, fieldLabel] of Object.entries(stepConfig.fields)) {
      const value = data[fieldKey]

      if (value === undefined || value === "") {
        stepData[fieldLabel] = null
      } else {
        stepData[fieldLabel] = value
      }
    }

    organizedData[stepKey] = stepData
  }

  return organizedData
}

interface DadosRecebidos {
  body: Record<string, any>
  anexos: AnexoEmail[]
}

/**
 * Aceita tanto multipart/form-data (formulário com anexos) quanto JSON puro,
 * para não quebrar integrações que ainda postem o payload antigo.
 */
async function lerRequisicao(request: NextRequest): Promise<DadosRecebidos> {
  const contentType = request.headers.get("content-type") || ""

  if (!contentType.includes("multipart/form-data")) {
    return { body: await request.json(), anexos: [] }
  }

  const formData = await request.formData()
  const payload = formData.get("payload")
  const body = payload ? JSON.parse(String(payload)) : {}

  const anexos: AnexoEmail[] = []
  for (const item of formData.getAll("anexos")) {
    if (item instanceof File && item.size > 0) {
      anexos.push({
        filename: item.name,
        content: Buffer.from(await item.arrayBuffer()),
        contentType: item.type || undefined,
      })
    }
  }

  return { body, anexos }
}

/** Fluxo antigo, mantido como plano B quando nenhum e-mail consegue sair. */
async function enviarParaWebhook(organizedData: Record<string, any>) {
  const webhookUrl =
    process.env.N8N_WEBHOOK_URL ||
    "https://n8n.jetsalesbrasil.com/webhook/a45a7c61-c49e-4820-9daf-9ac590ec4d5a"

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(organizedData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Webhook respondeu ${response.status}: ${errorText}`)
  }

  return await response.json().catch(() => ({}))
}

export async function POST(request: NextRequest) {
  try {
    const { body, anexos } = await lerRequisicao(request)

    console.log("[Cotação] Campos recebidos:", Object.keys(body).length)
    console.log("[Cotação] Anexos recebidos:", anexos.length)

    const quotationCode = generateQuotationCode(body.nomeCorretora, body.cnpj)
    const organizedData = organizeDataBySteps({
      ...body,
      numeroCotacao: quotationCode,
    })

    console.log("[Cotação] Código gerado:", quotationCode)

    const assunto = `Nova Cotação - ${quotationCode}`
    const html = buildEmailHtml({
      organizedData,
      quotationCode,
      anexos: anexos.map((anexo) => anexo.filename),
      logoUrl: process.env.EMAIL_LOGO_URL,
    })

    const destinatarios = montarDestinatarios(body.emailMatriz, body.emailComercial)

    let resultados: ResultadoEnvio[] = []
    let erroEmail: string | null = null

    try {
      resultados = await enviarCotacaoPorEmail({
        destinatarios,
        assunto,
        html,
        anexos,
      })
    } catch (erro) {
      // Falha de configuração/conexão do SMTP: nenhum e-mail chegou a sair.
      erroEmail = erro instanceof Error ? erro.message : "Erro desconhecido no SMTP"
      console.error("[Cotação] SMTP indisponível:", erroEmail)
    }

    const enviados = resultados.filter((resultado) => resultado.ok)
    const falhas = resultados.filter((resultado) => !resultado.ok)

    // Fallback: só aciona o webhook se NENHUM e-mail tiver sido entregue,
    // evitando que o n8n reenvie a cotação para quem já recebeu.
    if (enviados.length === 0) {
      console.warn("[Cotação] Nenhum e-mail entregue. Acionando fallback do webhook.")

      try {
        const dataWebhook = await enviarParaWebhook({
          ...organizedData,
          Anexos: anexos.map((anexo) => anexo.filename),
        })

        return NextResponse.json({
          success: true,
          canal: "webhook",
          quotationCode,
          data: dataWebhook,
          avisoAnexos: anexos.length > 0,
          falhas: falhas.map(({ tipo, email, erro }) => ({ tipo, email, erro })),
          erroEmail,
        })
      } catch (erroWebhook) {
        const detalhe =
          erroWebhook instanceof Error ? erroWebhook.message : "Erro desconhecido"
        console.error("[Cotação] Fallback do webhook também falhou:", detalhe)

        return NextResponse.json(
          {
            error: "Não foi possível enviar a cotação por e-mail nem pelo webhook.",
            details: detalhe,
            erroEmail,
          },
          { status: 502 }
        )
      }
    }

    if (falhas.length > 0) {
      console.warn(
        "[Cotação] Envio parcial. Endereços com falha:",
        falhas.map((falha) => falha.email).join(", ")
      )
    }

    return NextResponse.json({
      success: true,
      canal: "email",
      quotationCode,
      enviados: enviados.map(({ tipo, email }) => ({ tipo, email })),
      falhas: falhas.map(({ tipo, email, erro }) => ({ tipo, email, erro })),
    })
  } catch (error) {
    console.error("[Cotação] Erro na rota:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
