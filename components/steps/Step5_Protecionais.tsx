import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { PROTECTION_ITEMS } from "@/lib/constants";
import { FormValues } from "@/lib/schema";

export const Step5_Protecionais = () => {
  const { control, watch } = useFormContext<FormValues>();
  const extintoresValue = watch("protecional_extintores");
  const selecionados = PROTECTION_ITEMS.filter(
    (item) => watch(`protecional_${item.key}` as keyof FormValues) === "sim"
  ).length;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>🛡️ Protecionais - Sistemas de Proteção *</CardTitle>
          <CardDescription>
            Marque todos os sistemas de proteção existentes no local. A
            informação mínima é de Extintores. Quanto mais protecionais forem
            escolhidos, menor será a taxa do seguro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Seleção múltipla</span>
            <span className="font-medium">
              {selecionados} de {PROTECTION_ITEMS.length} selecionados
            </span>
          </div>

          <div className="max-h-[55vh] overflow-y-auto rounded-lg border divide-y">
            {PROTECTION_ITEMS.map((item) => (
              <FormField
                key={item.key}
                control={control}
                name={`protecional_${item.key}` as keyof FormValues}
                render={({ field }) => {
                  const marcado = field.value === "sim";
                  return (
                    <FormItem className="space-y-0">
                      <label
                        className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                          marcado ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <FormControl>
                          <Checkbox
                            checked={marcado}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? "sim" : "nao")
                            }
                            className="mt-0.5"
                          />
                        </FormControl>
                        <span className="flex items-center gap-2 flex-1">
                          <FormLabel
                            className={`text-sm font-normal cursor-pointer ${
                              marcado ? "text-blue-700 font-medium" : ""
                            }`}
                          >
                            {item.label}
                            {item.required && <span className="text-red-500 ml-1">*</span>}
                          </FormLabel>
                          {item.hasRTI && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-blue-500 cursor-help shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Reserva técnica de incêndios = quantidade de água em m³.</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </span>
                      </label>
                      {item.key === "extintores" && extintoresValue === "sim" && (
                        <p className="text-xs text-blue-600 bg-blue-50 px-3 pb-3">
                          Obs: os extintores têm que estar em dia e atualizados.
                        </p>
                      )}
                      <div className="px-3 pb-1">
                        <FormMessage />
                      </div>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
