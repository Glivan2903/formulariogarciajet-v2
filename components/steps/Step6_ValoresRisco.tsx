import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormValues } from "@/lib/schema";
import { CurrencyInput } from "@/components/CurrencyInput";

export const Step6_ValoresRisco = () => {
  const { control, watch } = useFormContext<FormValues>();
  const limiteUnico = watch("limiteUnico");

  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Valores em Risco e Importâncias Seguradas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="limiteUnico"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Deseja cotar com L.M.I. Único para prédio e conteúdo? *</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="sim" /></FormControl><FormLabel>Sim</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="nao" /></FormControl><FormLabel>Não - Valores individuais</FormLabel></FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {limiteUnico === "sim" && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CurrencyInput name="valorRiscoPredioConteudo" label="Valor em Risco Prédio + Conteúdo (R$)" />
              <CurrencyInput name="impSeguradaPredioConteudo" label="LMI / Imp Segurada Prédio+Conteúdo (R$) *" />
            </div>
            <CurrencyInput name="lucrosCessantesDespesasFixas" label="Garantia de Lucros Cessantes ou Despesas Fixas (R$)" />
          </div>
        )}

        {limiteUnico === "nao" && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-semibold">OBS: NÃO COTAMOS SEGUROS SOMENTE DE "CONTEÚDO". SUGERIMOS DESTINAR GARANTIA PARA PRÉDIO.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CurrencyInput name="valorRiscoPredio" label="Valor em Risco Prédio (R$)" />
              <CurrencyInput name="impSeguradaPredio" label="LMI / Imp Segurada Prédio (R$) *" />
              <CurrencyInput name="valorRiscoMMU" label="Valor em Risco MMU (Maq.Mov.Ut) (R$)" />
              <CurrencyInput name="impSeguradaMMU" label="LMI / Imp Segurada MMU (R$)" />
              <CurrencyInput name="valorRiscoMMP" label="Valor em Risco MMP (Mercad/Matéria-Prima) (R$)" />
              <CurrencyInput name="impSeguradaMMP" label="LMI (MMP) Mercad/Matéria-Prima (R$)" />
            </div>
            <CurrencyInput name="lucrosCessantesDespesasFixas" label="Garantia de Lucros Cessantes ou Despesas Fixas (R$)" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
