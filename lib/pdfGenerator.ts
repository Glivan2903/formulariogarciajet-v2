import jsPDF from "jspdf";
import { FormValues } from "./schema";
import { COBERTURA_ITEMS } from "./constants";
import { toast } from "sonner";

// Função para formatar um valor monetário (R$ 1.000,00) para um número (1000.00)
const parseCurrency = (value: string | undefined | null): number => {
    if (!value) return 0;
    return parseFloat(value.replace("R$", "").replace(/\./g, "").replace(",", "."));
};

export const generatePDF = async (formData: FormValues): Promise<string | null> => {
  console.log("[v0] Starting PDF generation...");
  try {
    const doc = new jsPDF();
    let yPosition = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const maxLineWidth = pageWidth - margin * 2;

    const addPageIfNeeded = (spaceNeeded: number) => {
        if (yPosition + spaceNeeded > 280) { // 280 (margem inferior)
            doc.addPage();
            yPosition = 20; // Reset com margem superior
        }
    };

    const addTitle = (title: string) => {
        addPageIfNeeded(15);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), margin, yPosition);
        yPosition += 10;
    };

    const addLine = (label: string, value: string | number | undefined | null) => {
        if (!value) value = "N/A";
        addPageIfNeeded(5);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(label, margin, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(String(value), 80, yPosition);
        yPosition += 5;
    };
    
    const addMultiLineText = (title: string, text: string | undefined | null) => {
        if (!text) return;
        addPageIfNeeded(15 + (text.length / 80) * 5); // Estimativa de altura
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text, maxLineWidth);
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * 5 + 5;
    };

    // --- Início do Documento ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("FORMULÁRIO DE SEGURO INCÊNDIO", pageWidth / 2, 15, { align: 'center' });
    yPosition = 30;

    // --- 1. Informações da Corretora ---
    addTitle("INFORMAÇÕES DA CORRETORA");
    addLine("Nome da Corretora:", formData.nomeCorretora);
    addLine("Número SUSEP:", formData.numeroSusep);
    addLine("Email Matriz:", formData.emailMatriz);
    addLine("Email Comercial:", formData.emailComercial);
    addLine("Nome Comercial:", formData.nomeComercial);
    addLine("WhatsApp Comercial:", formData.whatsappComercial);
    
    // --- 2. Informações do Proponente ---
    addTitle("INFORMAÇÕES DO PROPONENTE");
    addLine("Nome do Proponente:", formData.nomeProponente);
    addLine("CNPJ:", formData.cnpj);
    addLine("Comissão do Negócio:", `${formData.comissaoNegocio || 0}%`);
    addLine("Órgão Público:", formData.orgaoPublico === 'sim' ? "Sim" : "Não");

    // --- 3. Situação do Seguro ---
    addTitle("SITUAÇÃO DO SEGURO");
    addLine("Situação:", formData.situacaoSeguro);
    if (formData.situacaoSeguro === "renovacao-outra-cia") {
        addLine("Seguradora Anterior:", formData.seguradoraAnterior);
    }
    addLine("Situação Sinistro:", formData.situacaoSinistro);
    if (formData.situacaoSinistro === "renovacao-com-sinistro") {
        addMultiLineText("Detalhes do Sinistro:", formData.ocorrenciaSinistro);
    }
    
    // --- 4. Localização ---
    addTitle("LOCALIZAÇÃO DO RISCO");
    addLine("CEP:", formData.cep);
    addLine("Endereço:", `${formData.rua || ""}, ${formData.numero || ""}`);
    addLine("Complemento:", formData.complemento);
    addLine("Bairro:", formData.bairro);
    addLine("Município:", formData.municipio);
    addLine("Estado:", formData.estado);

    // --- 5. Atividade ---
    addTitle("ATIVIDADE");
    addLine("Tipo de Atividade:", formData.tipoAtividade);
    if (formData.tipoAtividade === "industrial") {
        addLine("Atividade Industrial:", formData.atividadeIndustrialSelecionada);
        addMultiLineText("Descrição do Processo:", formData.atividadeIndustrial);
    } else {
        addLine("Atividade Comercial:", formData.atividadeComercialSelecionada);
        addMultiLineText("Descrição da Mercadoria:", formData.atividadeComercial);
    }
    addLine("Classe de Construção:", formData.classeConstrucao);
    if (formData.classeConstrucao?.includes("isopainel")) {
        addLine("Tipo de Isopainel:", formData.tipoIsopainel);
    }

    // --- 6. Protecionais ---
    addTitle("SISTEMAS DE PROTEÇÃO");
    Object.keys(formData).forEach(key => {
        if (key.startsWith("protecional_") && formData[key as keyof FormValues] === "sim") {
            const label = key.replace("protecional_", ""); // Simplificado, idealmente usaria um map
            addLine(`- ${label}`, "Sim");
        }
    });

    // --- 7. Valores em Risco ---
    addTitle("VALORES EM RISCO");
    addLine("LMI Único:", formData.limiteUnico === 'sim' ? "Sim" : "Não");
    if (formData.limiteUnico === "sim") {
        addLine("Valor Risco Prédio + Conteúdo:", formData.valorRiscoPredioConteudo);
        addLine("LMI Prédio + Conteúdo:", formData.impSeguradaPredioConteudo);
    } else {
        addLine("Valor Risco Prédio:", formData.valorRiscoPredio);
        addLine("LMI Prédio:", formData.impSeguradaPredio);
        addLine("Valor Risco MMU:", formData.valorRiscoMMU);
        addLine("LMI MMU:", formData.impSeguradaMMU);
        addLine("Valor Risco MMP:", formData.valorRiscoMMP);
        addLine("LMI MMP:", formData.impSeguradaMMP);
    }
    addLine("Lucros Cessantes/Despesas Fixas:", formData.lucrosCessantesDespesasFixas);

    // --- 8. Coberturas ---
    addTitle("COBERTURAS CONTRATADAS");
    COBERTURA_ITEMS.forEach(cobertura => {
        const valueKey = cobertura.coberturaKey as keyof FormValues;
        const periodKey = cobertura.periodoKey as keyof FormValues;
        const coverageValue = parseCurrency(formData[valueKey] as string);
        
        if (coverageValue > 0) {
            let text = `• ${cobertura.name}: ${formData[valueKey]}`;
            if (cobertura.needsPeriod) {
                const periodValue = formData[periodKey] as string;
                text += periodValue ? ` (${periodValue} meses)` : " (Período não informado)";
            }
            addPageIfNeeded(5);
            doc.text(text, margin, yPosition);
            yPosition += 5;
        }
    });

    // --- 9. Observações ---
    addTitle("OBSERVAÇÕES E CLÁUSULAS");
    addMultiLineText("Observações:", formData.observacoes);
    addMultiLineText("Cláusulas Complementares:", formData.clausulasComplementares);

    // --- Geração do PDF ---
    const pdfBase64 = doc.output("datauristring");
    console.log("[v0] PDF generated successfully as base64");
    return pdfBase64;
  } catch (error) {
    console.error("[v0] Error creating PDF:", error);
    toast.error("Erro ao gerar PDF", { description: "Não foi possível criar o documento." });
    return null;
  }
};
