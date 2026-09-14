import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { FormValues } from "@/lib/schema";
import { useCepSearch } from "@/hooks/useCepSearch";

export const Step3_Localizacao = ({ form }: { form: any }) => {
  const { control, setValue } = useFormContext<FormValues>();
  const { isSearching, searchCep } = useCepSearch(setValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle>📍 Localização do Risco</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="cep"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP do Local *</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="00000-000"
                    {...field}
                    onBlur={() => searchCep(field.value)}
                    disabled={isSearching}
                  />
                </FormControl>
                {isSearching && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
                )}
              </div>
              <p className="text-xs text-gray-500">
                💡 O endereço será preenchido automaticamente após digitar o CEP.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="rua"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rua/Avenida *</FormLabel>
                <FormControl>
                  <Input {...field} className={isSearching ? "bg-gray-50" : ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="complemento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento</FormLabel>
                <FormControl>
                  <Input {...field} className={isSearching ? "bg-gray-50" : ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="bairro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro *</FormLabel>
                <FormControl>
                  <Input {...field} className={isSearching ? "bg-gray-50" : ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="municipio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Município *</FormLabel>
                <FormControl>
                  <Input {...field} className={isSearching ? "bg-gray-50" : ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <FormControl>
                  <Input {...field} className={isSearching ? "bg-gray-50" : ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
