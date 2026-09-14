"use client";

import { useState } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form"; // Importado SubmitHandler
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Step1_Corretora } from "./steps/Step1_Corretora";
import { Step2_Situacao } from "./steps/Step2_Situacao";
import { Step3_Localizacao } from "./steps/Step3_Localizacao";
import { Step4_Atividade } from "./steps/Step4_Atividade";
import { Step5_Protecionais } from "./steps/Step5_Protecionais";
import { Step6_ValoresRisco } from "./steps/Step6_ValoresRisco";
import { Step7_Coberturas } from "./steps/Step7_Coberturas";
import { Step8_Observacoes } from "./steps/Step8_Observacoes";
import { SuccessScreen } from "./steps/SuccessScreen";
import { formSchema, stepSchemas, FormValues } from "@/lib/schema";

const steps = [
  "Dados da Corretora e Proponente",
  "Situação do Seguro",
  "Localização do Risco",
  "Atividade",
  "Protecionais",
  "Valores em Risco",
  "Coberturas",
  "Observações e Documentos",
];

export default function SeguroIncendioForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState<{
    canal: "email" | "webhook";
    quotationCode: string;
    nomeCorretora: string;
    nomeProponente: string;
  } | null>(null);

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      orgaoPublico: "nao",
      tipoAtividade: "comercio-servicos",
      situacaoSeguro: "seguro-novo",
      situacaoSinistro: "sem-sinistros-1-ano",
      limiteUnico: "nao",
      protecional_extintores: undefined,
      protecional_alarmeIncendio: "nao",
      protecional_alarmeInfravermelho: "nao",
      protecional_brigadaEmergencia: "nao",
      protecional_cftv: "nao",
      protecional_concertina: "nao",
      protecional_diqueContencao: "nao",
      protecional_eclusa: "nao",
      protecional_guaritaBlindada: "nao",
      protecional_mergulhao: "nao",
      protecional_outrasProtecoes: "nao",
      protecional_paraRaios: "nao",
      protecional_redeHidrantes20: "nao",
      protecional_redeHidrantes60: "nao",
      protecional_redeHidrantes120: "nao",
      protecional_redeSprinklers: "nao",
      protecional_sistemaGarra: "nao",
      protecional_vigilanciaArmada: "nao",
      protecional_vigilanciaDesarmada: "nao",
      atividadeIndustrialSelecionada: "",
      atividadeComercialSelecionada: "",
      anexos: [],
    },
  });

  const nextStep = async () => {
    const currentSchema = stepSchemas[currentStep];
    // Assegura que currentSchema é um ZodObject
    if (currentSchema && "shape" in currentSchema) {
      const fields = Object.keys(currentSchema.shape) as (keyof FormValues)[];
      const isValid = await methods.trigger(fields, { shouldFocus: true });

      if (currentStep === 0 && methods.getValues("orgaoPublico") === "sim") {
        toast.error("Não é possível prosseguir.", {
          description:
            "Infelizmente não realizamos cotações de seguro para órgãos públicos.",
        });
        return;
      }

      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      } else {
        toast.error("Formulário incompleto", {
          description:
            "Por favor, preencha todos os campos obrigatórios (*) antes de avançar.",
        });
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);

    // Os anexos viajam como arquivos no FormData, fora do JSON da cotação.
    const { anexos = [], ...dadosCotacao } = data;

    toast.info("Enviando o seu pedido de cotação...", {
      description:
        anexos.length > 0
          ? `Anexando ${anexos.length} ${
              anexos.length === 1 ? "arquivo" : "arquivos"
            }. Isto pode demorar alguns segundos.`
          : "Isto pode demorar alguns segundos.",
    });

    try {
      const payload = {
        formType: "seguro_incendio",
        timestamp: new Date().toISOString(),
        ...dadosCotacao,
      };

      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));
      anexos.forEach((arquivo) => formData.append("anexos", arquivo));

      const response = await fetch("/api/submit-form", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      // Só consideramos enviado se a rota confirmar a entrega (e-mail ou fallback).
      if (!response.ok || !result?.success) {
        throw new Error(
          result?.details || result?.error || "Não foi possível enviar a cotação."
        );
      }

      setResultadoEnvio({
        canal: result.canal,
        quotationCode: result.quotationCode,
        nomeCorretora: data.nomeCorretora,
        nomeProponente: data.nomeProponente,
      });
      setIsCompleted(true);

      if (result.canal === "webhook") {
        toast.warning("Cotação enviada pelo canal alternativo.", {
          description: result.avisoAnexos
            ? "O envio por e-mail falhou e os anexos não seguiram. Por favor, reenvie os arquivos pelo WhatsApp."
            : "O envio por e-mail falhou, mas o pedido foi registrado.",
          duration: 12000,
        });

        // O e-mail (com os anexos) não saiu, então os documentos precisam ir
        // manualmente pelo WhatsApp — abrimos já no clique do utilizador para
        // não ser bloqueado como pop-up.
        const whatsappNumber = "554330280500";
        const message = `Segue o pedido NÚMERO *${result.quotationCode}* de cotação DO SEGURO DE INCÊNDIO da Corretora *${data.nomeCorretora}*, proponente *${data.nomeProponente}* e Documentos, fotos, cópia de apólices da concorrência a seguir.`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          message
        )}`;
        window.open(whatsappUrl, "_blank");
      } else {
        toast.success("Formulário enviado com sucesso!");

        if (result.falhas?.length > 0) {
          toast.warning("Um dos e-mails não pôde ser entregue.", {
            description: `Verifique o endereço: ${result.falhas
              .map((falha: { email: string }) => falha.email)
              .join(", ")}`,
            duration: 12000,
          });
        }
      }
    } catch (error) {
      console.error("[Formulário Envio] Erro:", error);
      toast.error("Erro ao enviar formulário", {
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted && resultadoEnvio) {
    return (
      <SuccessScreen
        canal={resultadoEnvio.canal}
        quotationCode={resultadoEnvio.quotationCode}
        nomeCorretora={resultadoEnvio.nomeCorretora}
        nomeProponente={resultadoEnvio.nomeProponente}
        onNovaCotacao={() => {
          methods.reset();
          setCurrentStep(0);
          setIsCompleted(false);
          setResultadoEnvio(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Questionário para Cotação de Seguro Incêndio
            </CardTitle>
            <CardDescription className="text-lg">
              Vamos dar início ao processo de cotação do seguro e para isso as
              informações devem ser as mais exatas possíveis
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Etapa {currentStep + 1} de {steps.length}:{" "}
                  {steps[currentStep]}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}%
                </span>
              </div>
              <Progress value={((currentStep + 1) / steps.length) * 100} />
            </div>
          </CardContent>
        </Card>

        {/* O FormProvider passa 'methods' para todos os componentes filhos */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="mb-6">
              {/* CORRIGIDO: Remove a prop 'form' de todos os passos */}
              {currentStep === 0 && <Step1_Corretora />}
              {currentStep === 1 && <Step2_Situacao />}
              {currentStep === 2 && <Step3_Localizacao form={methods} />}
              {currentStep === 3 && <Step4_Atividade />}
              {currentStep === 4 && <Step5_Protecionais />}
              {currentStep === 5 && <Step6_ValoresRisco />}
              {currentStep === 6 && <Step7_Coberturas />}
              {currentStep === 7 && <Step8_Observacoes />}
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between">
                  <Button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 0 || isSubmitting}
                    variant="outline"
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    onClick={
                      currentStep === steps.length - 1
                        ? methods.handleSubmit(onSubmit)
                        : nextStep
                    }
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </span>
                    ) : currentStep === steps.length - 1 ? (
                      "Finalizar e Enviar"
                    ) : (
                      "Próximo"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </FormProvider>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
            <div>
              <p className="font-semibold text-gray-900">
                Enviando seu pedido de cotação...
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {(methods.watch("anexos")?.length ?? 0) > 0
                  ? "Anexando os documentos, isso pode levar alguns segundos."
                  : "Isto pode levar alguns segundos."}
                {" "}Aguarde, não feche nem atualize esta página.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
