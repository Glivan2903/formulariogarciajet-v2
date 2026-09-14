import { useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormValues } from "@/lib/schema";

export const Step1_Corretora = () => {
  const { control, setValue, watch } = useFormContext<FormValues>();
  const orgaoPublico = watch("orgaoPublico");

  const handleDataInicialBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value; 
    if (!value) return;

    const dataInicial = new Date(value);
    if (isNaN(dataInicial.getTime())) return;

    setValue("dataInicial", value);

    const dataFinal = new Date(dataInicial);
    dataFinal.setFullYear(dataFinal.getFullYear() + 1);

    const diaFinal = String(dataFinal.getDate()).padStart(2, "0");
    const mesFinal = String(dataFinal.getMonth() + 1).padStart(2, "0");
    const anoFinal = dataFinal.getFullYear();

    setValue("vigenciaFinal", `${diaFinal}/${mesFinal}/${anoFinal}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          🏢 Dados da Corretora e Proponente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField
            control={control}
            name="dataInicial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vigência início *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="dd/mm/aaaa"
                    {...field}
                    onChange={handleDataInicialBlur}
                    type="date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="vigenciaFinal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vigência final</FormLabel>
                <FormControl>
                  <Input
                    readOnly
                    className="opacity-70 cursor-not-allowed bg-gray-100"
                    placeholder=""
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="nomeCorretora"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Corretora *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="numeroSusep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da SUSEP *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="emailMatriz"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email da Matriz *</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="emailComercial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email do Comercial *</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="nomeComercial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Comercial *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="whatsappComercial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp de Contato *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="nomeProponente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Proponente *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="comissaoNegocio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comissão do Negócio (%) *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="orgaoPublico"
            render={({ field }) => (
              <FormItem className="space-y-3 col-span-full">
                <FormLabel>Segurado é Órgão Público? *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="sim" />
                      </FormControl>
                      <FormLabel>Sim</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="nao" />
                      </FormControl>
                      <FormLabel>Não</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
                {orgaoPublico === "sim" && (
                  <div className="p-4 bg-red-50 border-2 border-red-400 rounded-lg">
                    <p className="text-red-800 font-semibold text-center">
                      Atenção: Infelizmente não realizamos cotações de seguro
                      para órgãos públicos.
                    </p>
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
