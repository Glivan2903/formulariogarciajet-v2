import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  SITUACAO_SEGURO_OPTIONS,
  SITUACAO_SINISTRO_OPTIONS,
  QUESTOES_ADICIONAIS_SEGURO,
} from "@/lib/constants";
import { FormValues } from "@/lib/schema";

export const Step2_Situacao = () => {
  const { control, watch } = useFormContext<FormValues>();
  const situacaoSeguro = watch("situacaoSeguro");
  const situacaoSinistro = watch("situacaoSinistro");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📋 Situação do Seguro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="situacaoSeguro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Situação do Seguro *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SITUACAO_SEGURO_OPTIONS.map((opcao) => (
                      <SelectItem key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {situacaoSeguro === "renovacao-outra-cia" && (
            <FormField
              control={control}
              name="seguradoraAnterior"
              render={({ field }) => (
                <FormItem className="p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
                  <FormLabel>Nome da Seguradora Anterior *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Porto Seguro" {...field} />
                  </FormControl>
                  <p className="text-blue-800 text-sm font-medium mt-2">
                    📄 Importante: Após finalizar, envie a apólice anterior pelo WhatsApp.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={control}
            name="situacaoSinistro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Situação de Sinistros *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SITUACAO_SINISTRO_OPTIONS.map((opcao) => (
                      <SelectItem key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {situacaoSinistro === "renovacao-com-sinistro" && (
            <FormField
              control={control}
              name="ocorrenciaSinistro"
              render={({ field }) => (
                <FormItem className="p-4 bg-yellow-50 rounded-lg">
                  <FormLabel>Ocorrência de Sinistro nos Últimos 5 Anos</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex.: Vendaval R$ 30.000,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>❓ Informações Complementares do Risco</CardTitle>
          <CardDescription>
            Responda às questões abaixo para completar a análise do risco.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {QUESTOES_ADICIONAIS_SEGURO.map((questao) => (
            <FormField
              key={questao.key}
              control={control}
              name={questao.key as keyof FormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{questao.label}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[70px]"
                      placeholder={questao.placeholder}
                      {...field}
                      value={(field.value as string) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
