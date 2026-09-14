import { z } from "zod";
import { COBERTURA_ITEMS } from "@/lib/constants";

// --- 1. Definições de Esquemas Base (ZodObject) ---

export const step1Schema = z.object({
  dataInicial: z
    .string({ required_error: "A data inicial é obrigatória." })
    .min(10, "Data inválida. Use o formato dd/mm/aaaa."),

  vigenciaFinal: z
    .string({ required_error: "A data de vigência final é obrigatória." })
    .min(10, "Data de vigência final é obrigatória."),

  nomeCorretora: z
    .string({ required_error: "O nome da corretora é obrigatório." })
    .min(3, "Nome da corretora é obrigatório."),

  numeroSusep: z
    .string({ required_error: "O número da SUSEP é obrigatório." })
    .min(3, "Número SUSEP é obrigatório."),

  emailMatriz: z
    .string({ required_error: "O e-mail da matriz é obrigatório." })
    .email("E-mail da matriz inválido."),

  emailComercial: z
    .string({ required_error: "O e-mail comercial é obrigatório." })
    .email("E-mail comercial inválido."),

  nomeComercial: z
    .string({ required_error: "O nome do comercial é obrigatório." })
    .min(3, "Nome do comercial é obrigatório."),

  whatsappComercial: z
    .string({ required_error: "O WhatsApp de contato é obrigatório." })
    .min(10, "WhatsApp é obrigatório (mínimo 10 dígitos).")
    .max(15, "WhatsApp inválido (máximo 15 dígitos)."),

  nomeProponente: z
    .string({ required_error: "O nome do proponente é obrigatório." })
    .min(3, "Nome do proponente é obrigatório."),

  cnpj: z
    .string({ required_error: "O CNPJ é obrigatório." })
    .min(14, "CNPJ deve ter 14 (só números) ou 18 (formatado) caracteres.")
    .max(18, "CNPJ deve ter 14 (só números) ou 18 (formatado) caracteres."),

  comissaoNegocio: z.preprocess(
    (val) => (val === "" || val == null ? undefined : Number(val)),
    z
      .number({
        required_error: "A comissão do negócio é obrigatória.",
        invalid_type_error: "Informe um número válido.",
      })
      .min(0, "A comissão deve ser 0 ou maior.")
      .max(100, "A comissão não pode ser maior que 100.")
  ),

  orgaoPublico: z.enum(["sim", "nao"], {
    required_error: "Selecione se o segurado é órgão público.",
    invalid_type_error: "Selecione uma opção válida.",
  }),
});

export const step2SchemaBase = z.object({
  situacaoSeguro: z.string({
    required_error: "Selecione a situação do seguro.", // <-- ALTERAÇÃO
  }),
  seguradoraAnterior: z.string().optional(),
  situacaoSinistro: z.string({
    required_error: "Selecione a situação de sinistro.", // <-- ALTERAÇÃO
  }),
  ocorrenciaSinistro: z
    .string()
    .max(1000, "Descrição muito longa.") // <-- ALTERAÇÃO
    .optional(),

  // Questões adicionais sobre o risco (Etapa 2)
  clausulaBeneficiaria: z.string().max(500, "Resposta muito longa.").optional(),
  sinistralidade5Anos: z.string().max(1000, "Resposta muito longa.").optional(),
  possuiuSeguroAnterior: z.string().max(500, "Resposta muito longa.").optional(),
  motivoSemSeguro: z.string().max(1000, "Resposta muito longa.").optional(),
  localEmOperacao: z.string().max(500, "Resposta muito longa.").optional(),
  condominioLogistico: z.string().max(1000, "Resposta muito longa.").optional(),
});

export const step3Schema = z.object({
  cep: z.string({
    required_error: "O CEP é obrigatório.",
    invalid_type_error: "Informe um CEP válido.",
  }),

  rua: z
    .string({
      required_error: "A rua é obrigatória.",
      invalid_type_error: "Informe uma rua válida.",
    })
    .min(3, "A rua é obrigatória."),

  numero: z.preprocess(
    (val) => (val === "" || val == null ? undefined : String(val)),
    z
      .string({
        required_error: "O número é obrigatório.",
        invalid_type_error: "Informe um número válido.",
      })
      .min(1, "O número é obrigatório.")
  ),

  complemento: z
    .string({
      invalid_type_error: "Informe um complemento válido.",
    })
    .max(100, "O complemento é muito longo.")
    .optional(),

  bairro: z
    .string({
      required_error: "O bairro é obrigatório.",
      invalid_type_error: "Informe um bairro válido.",
    })
    .min(3, "O bairro é obrigatório."),

  municipio: z
    .string({
      required_error: "O município é obrigatório.",
      invalid_type_error: "Informe um município válido.",
    })
    .min(3, "O município é obrigatório."),

  estado: z
    .string({
      required_error: "O estado é obrigatório.",
      invalid_type_error: "Informe um estado válido.",
    })
    .min(2, "O estado é obrigatório.")
    .max(2, "O estado deve conter apenas 2 letras."),
});

export const step4SchemaBase = z.object({
  tipoAtividade: z.enum(["industrial", "comercio-servicos"], {
    required_error: "Selecione o tipo de atividade.",
  }),
  atividadeIndustrialSelecionada: z.string().optional(),
  atividadeIndustrial: z
    .string()
    .max(255, "Descrição muito longa.") // <-- ALTERAÇÃO
    .optional(),
  atividadeComercialSelecionada: z.string().optional(),
  atividadeComercial: z
    .string()
    .max(255, "Descrição muito longa.") // <-- ALTERAÇÃO
    .optional(),
  classeConstrucao: z.string({
    required_error: "Selecione a classe de construção.",
  }),
  tipoIsopainel: z
    .string()
    .max(100, "Descrição muito longa.") // <-- ALTERAÇÃO
    .optional(),
});

export const step5Schema = z.object({
  protecional_extintores: z
    .enum(["sim", "nao"], {
      required_error: "É obrigatório marcar a proteção Extintores.",
    })
    .refine((valor) => valor === "sim", {
      message: "É obrigatório marcar a proteção Extintores.",
    }),
  // Adicionando max() para campos de texto opcionais
  protecional_alarmeIncendio: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_alarmeInfravermelho: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_brigadaEmergencia: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_cftv: z.string().max(255, "Descrição muito longa.").optional(), // <-- ALTERAÇÃO
  protecional_concertina: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_diqueContencao: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_eclusa: z.string().max(255, "Descrição muito longa.").optional(), // <-- ALTERAÇÃO
  protecional_guaritaBlindada: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_mergulhao: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_outrasProtecoes: z
    .string()
    .max(500, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_paraRaios: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_redeHidrantes20: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_redeHidrantes60: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_redeHidrantes120: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_redeSprinklers: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_sistemaGarra: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_vigilanciaArmada: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
  protecional_vigilanciaDesarmada: z
    .string()
    .max(255, "Descrição muito longa.")
    .optional(), // <-- ALTERAÇÃO
});

export const step6SchemaBase = z.object({
  limiteUnico: z.enum(["sim", "nao"], {
    required_error: "Selecione se o Limite Único se aplica.", // <-- ALTERAÇÃO
  }),
  // Usando z.coerce.number() para consistência e min(0)
  valorRiscoPredioConteudo: z.coerce
    .number()
    .min(0, "Valor deve ser positivo.")
    .optional(), // <-- ALTERAÇÃO
  impSeguradaPredioConteudo: z.coerce
    .number()
    .min(0, "Valor deve ser positivo.")
    .optional(), // <-- ALTERAÇÃO
  valorRiscoPredio: z.coerce
    .number()
    .min(0, "Valor deve ser positivo.")
    .optional(), // <-- ALTERAÇÃO
  impSeguradaPredio: z.coerce
    .number()
    .min(0, "Valor deve ser positivo.")
    .optional(), // <-- ALTERAÇÃO
  valorRiscoMMU: z.coerce
    .number()
    .min(0, "Valor deve ser positivo.")
    .optional(), // <-- ALTERAÇÃO
  impSeguradaMMU: z.coerce
    .number()
    .min(0, "Valor deve ser positivo.")
    .optional(), // <-- ALTERAÇÃO
  valorRiscoMMP: z.coerce
    .number()
    .min(0, "Valor deve ser positivo.")
    .optional(), // <-- ALTERAÇÃO
  impSeguradaMMP: z.coerce
    .number()
    .min(0, "Valor deve ser positivo.")
    .optional(), // <-- ALTERAÇÃO
  lucrosCessantesDespesasFixas: z.coerce
    .number()
    .min(0, "Valor deve ser positivo.")
    .optional(), // <-- ALTERAÇÃO
});

export const step7Schema = z.object({
  // Todos estes são opcionais, então z.string().optional() está correto.
  // Adicionar .max() se houver limite de caracteres.
  cobertura_0: z.number().optional(), // <-- ALTERAÇÃO
  periodo_0: z.number().optional(), // <-- ALTERAÇÃO
  cobertura_1: z.number().optional(),
  periodo_1: z.number().optional(),
  cobertura_2: z.number().optional(),
  periodo_2: z.number().optional(),
  cobertura_3: z.number().optional(),
  periodo_3: z.number().optional(),
  cobertura_4: z.number().optional(),
  periodo_4: z.number().optional(),
  cobertura_5: z.number().optional(),
  periodo_5: z.number().optional(),
  cobertura_6: z.number().optional(),
  periodo_6: z.number().optional(),
  cobertura_7: z.number().optional(),
  periodo_7: z.number().optional(),
  cobertura_8: z.number().optional(),
  periodo_8: z.number().optional(),
  cobertura_9: z.number().optional(),
  periodo_9: z.number().optional(),
  cobertura_10: z.number().optional(),
  periodo_10: z.number().optional(),
  cobertura_11: z.number().optional(),
  periodo_11: z.number().optional(),
  cobertura_12: z.number().optional(),
  periodo_12: z.number().optional(),
  cobertura_13: z.number().optional(),
  periodo_13: z.number().optional(),
  cobertura_14: z.number().optional(),
  periodo_14: z.number().optional(),
  cobertura_15: z.number().optional(),
  periodo_15: z.number().optional(),
  cobertura_16: z.number().optional(),
  periodo_16: z.number().optional(),
  cobertura_17: z.number().optional(),
  periodo_17: z.number().optional(),
  cobertura_18: z.number().optional(),
  periodo_18: z.number().optional(),
  cobertura_19: z.number().optional(),
  periodo_19: z.number().optional(),
  cobertura_20: z.number().optional(),
  periodo_20: z.number().optional(),
  cobertura_21: z.number().optional(),
  periodo_21: z.number().optional(),
  cobertura_22: z.number().optional(),
  periodo_22: z.number().optional(),
  cobertura_23: z.number().optional(),
  periodo_23: z.number().optional(),
  cobertura_24: z.number().optional(),
  periodo_24: z.number().optional(),
  cobertura_25: z.number().optional(),
  periodo_25: z.number().optional(),
  cobertura_26: z.number().optional(),
  periodo_26: z.number().optional(),
  cobertura_27: z.number().optional(),
  periodo_27: z.number().optional(),
  cobertura_28: z.number().optional(),
  periodo_28: z.number().optional(),
  cobertura_29: z.number().optional(),
  periodo_29: z.number().optional(),
  cobertura_30: z.number().optional(),
  periodo_30: z.number().optional(),
  cobertura_31: z.number().optional(),
  periodo_31: z.number().optional(),
  cobertura_32: z.number().optional(),
  periodo_32: z.number().optional(),
  cobertura_33: z.number().optional(),
  periodo_33: z.number().optional(),
  cobertura_34: z.number().optional(),
  periodo_34: z.number().optional(),
  cobertura_35: z.number().optional(),
  periodo_35: z.number().optional(),
  cobertura_36: z.number().optional(),
  periodo_36: z.number().optional(),
  cobertura_37: z.number().optional(),
  periodo_37: z.number().optional(),
  cobertura_38: z.number().optional(),
  periodo_38: z.number().optional(),
  cobertura_39: z.number().optional(),
  periodo_39: z.number().optional(),
  cobertura_40: z.number().optional(),
  periodo_40: z.number().optional(),
  cobertura_41: z.number().optional(),
  periodo_41: z.number().optional(),
  cobertura_42: z.number().optional(),
  periodo_42: z.number().optional(),
  cobertura_43: z.number().optional(),
  periodo_43: z.number().optional(),
  cobertura_44: z.number().optional(),
  periodo_44: z.number().optional(),
  cobertura_45: z.number().optional(),
  periodo_45: z.number().optional(),
  cobertura_46: z.number().optional(),
  periodo_46: z.number().optional(),
  cobertura_47: z.number().optional(),
  periodo_47: z.number().optional(),
  cobertura_48: z.number().optional(),
  periodo_48: z.number().optional(),
  cobertura_49: z.number().optional(),
  periodo_49: z.number().optional(),
  cobertura_50: z.number().optional(),
  periodo_50: z.number().optional(),
  cobertura_51: z.number().optional(),
  periodo_51: z.number().optional(),
  cobertura_52: z.number().optional(),
  periodo_52: z.number().optional(),
  cobertura_53: z.number().optional(),
  periodo_53: z.number().optional(),
  cobertura_54: z.number().optional(),
  periodo_54: z.number().optional(),
  cobertura_55: z.number().optional(),
  periodo_55: z.number().optional(),
  cobertura_56: z.number().optional(),
  periodo_56: z.number().optional(),
  cobertura_57: z.number().optional(),
  periodo_57: z.number().optional(),
  cobertura_58: z.number().optional(),
  periodo_58: z.number().optional(),
  cobertura_59: z.number().optional(),
  periodo_59: z.number().optional(),
  cobertura_60: z.number().optional(),
  periodo_60: z.number().optional(),
  cobertura_61: z.number().optional(),
  periodo_61: z.number().optional(),
});

export const step8Schema = z.object({
  observacoes: z
    .string()
    .max(5000, "Limite de 5000 caracteres atingido.") // <-- ALTERAÇÃO
    .optional(),
  clausulasComplementares: z
    .string()
    .max(5000, "Limite de 5000 caracteres atingido.") // <-- ALTERAÇÃO
    .optional(),
  // Arquivos anexados na Etapa 8. Vão para o e-mail, não para o JSON da cotação.
  anexos: z.array(z.custom<File>()).optional(),
});

// --- 2. Array de Esquemas de Passos (Apenas ZodObject) ---
export const stepSchemas = [
  step1Schema,
  step2SchemaBase,
  step3Schema,
  step4SchemaBase,
  step5Schema,
  step6SchemaBase,
  step7Schema,
  step8Schema,
];

// --- 3. Esquema Mestre (com Refinamentos) ---
export const formSchema = z
  .object({})
  .merge(step1Schema)
  .merge(step2SchemaBase)
  .merge(step3Schema)
  .merge(step4SchemaBase)
  .merge(step5Schema)
  .merge(step6SchemaBase)
  .merge(step7Schema)
  .merge(step8Schema)
  
export type FormValues = z.infer<typeof formSchema>;
