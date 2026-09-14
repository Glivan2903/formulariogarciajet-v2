import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SuccessScreenProps {
  onNovaCotacao: () => void;
}

export const SuccessScreen = ({ onNovaCotacao }: SuccessScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
  <CardHeader className="text-center">
    <CardTitle className="text-2xl font-bold text-green-700">
      🎉 PEDIDO DE COTAÇÃO ENVIADO COM SUCESSO!
    </CardTitle>
    <CardDescription className="text-lg mt-4">
      Sua solicitação foi encaminhada e já está sendo processada.
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-6">
    <div className="p-6 bg-blue-50 rounded-lg">
      <h4 className="font-semibold text-center mb-4 text-red-600 text-lg">
        🚨 MUITO IMPORTANTE
      </h4>
      <p className="text-gray-700 leading-relaxed">
        Este é o momento ideal, se renovação, de enviar a apólice anterior,
        arquivos, planilhas, cotações da concorrência, fotografias do risco e
        outros documentos que contribuam para a análise do pedido. O envio será
        feito pelo WhatsApp. Um alerta é gerado e o sistema é aberto para anexar
        os documentos.
      </p>

      <div className="mt-4 space-y-1 text-gray-700">
        <p>● <strong>Canal:</strong> WhatsApp (43) 3028-0500</p>
        <p>● <strong>Menu:</strong> selecione a opção 3 para solicitar informações sobre sua cotação ou outras observações.</p>
      </div>

      <h4 className="font-semibold mt-6 mb-2 text-blue-800">
        ⏱ Prazos para as Cotações
      </h4>
      <ul className="list-disc list-inside text-gray-700 space-y-1">
        <li><strong>LMG até R$ 5 MM:</strong> retorno rápido.</li>
        <li><strong>LMG de R$ 5 MM a R$ 12 MM:</strong> podem ser rápidas, ou mais demoradas dependendo da atividade do risco.</li>
        <li><strong>LMG de R$ 12 MM a R$ 40 MM:</strong> algumas atividades com melhores protecionais terão resposta mais rápida; outras podem exigir prazo adicional.</li>
        <li><strong>De R$ 40 MM a R$ 150 MM:</strong> operamos com cosseguro aceito.</li>
      </ul>
    </div>

    <Button
      onClick={onNovaCotacao}
      className="w-full bg-blue-600 hover:bg-blue-700"
      size="lg"
    >
      Nova Cotação
    </Button>
  </CardContent>
</Card>
    </div>
  );
};
