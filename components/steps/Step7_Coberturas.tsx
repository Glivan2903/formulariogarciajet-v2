  import { useFormContext } from "react-hook-form";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
  import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import { CurrencyInput } from "@/components/CurrencyInput";
  import { COBERTURA_ITEMS } from "@/lib/constants";
  import { FormValues } from "@/lib/schema";

  export const Step7_Coberturas = () => {
    const { control, watch } = useFormContext<FormValues>();

    return (
      <Card>
        <CardHeader>
          <CardTitle>🔒 Coberturas - Informe uma Importância Segurada para:</CardTitle>
          <CardDescription>Preencha os valores desejados. Deixe em branco (R$ 0,00) para não contratar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COBERTURA_ITEMS.map((item) => {
                const coverageValue = watch(item.coberturaKey as keyof FormValues);
                const hasValidValue = !!coverageValue && +coverageValue > 0;
                
                return (
                  <div key={item.coberturaKey} className="space-y-2 p-3 border rounded-lg">
                    <CurrencyInput
                      name={item.coberturaKey}
                      label={item.name}
                    />
                    {item.needsPeriod && hasValidValue && (
                      <FormField
                        control={control}
                        name={item.periodoKey as keyof FormValues}
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormLabel className="text-sm font-medium">Período Indenitário (1-12 meses)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="12"
                                placeholder="Meses"
                                name={field.name}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                value={(field.value as number | undefined) ?? ""}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
