import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ATIVIDADES_INDUSTRIAIS,
  ATIVIDADES_COMERCIAIS,
  CLASSE_CONSTRUCAO_OPTIONS,
} from "@/lib/constants";
import { FormValues } from "@/lib/schema";
import { Input } from "../ui/input";

export const Step4_Atividade = () => {
  const {
    control,
    watch,
    register,
    setValue,
    trigger,
    getValues,
    formState,
  } = useFormContext<FormValues>();

  const tipoAtividade = watch("tipoAtividade");
  const classeConstrucao = watch("classeConstrucao");

  // Re-trigger validation when tipoAtividade muda (as regras condicionais dependem disso)
  useEffect(() => {
    // dispara validação dos campos relacionados
    trigger(["atividadeIndustrialSelecionada", "atividadeComercialSelecionada"]);
  }, [tipoAtividade, trigger]);

  // Registro dos inputs invisíveis (sempre montados)
  // Usamos validate dinâmico para depender de tipoAtividade atual
  useEffect(() => {
    // Re-register não é necessário — register é chamado no JSX abaixo.
    // Esse useEffect é só para debug/observability opcional:
    // console.log("Valores atuais:", getValues());
  }, [getValues]);

  return (
    <div className="space-y-6">
      {/* ATIVIDADE */}
      <Card>
        <CardHeader>
          <CardTitle>🏭 Atividade</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tipo de atividade */}
          <FormField
            control={control}
            name="tipoAtividade"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Tipo de Atividade *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(v) => {
                      field.onChange(v);
                      // opcional: limpar campos do outro grupo ao mudar tipo
                      if (v === "industrial") {
                        setValue("atividadeComercialSelecionada", "", {
                          shouldValidate: false,
                          shouldDirty: true,
                        });
                      } else if (v === "comercio-servicos") {
                        setValue("atividadeIndustrialSelecionada", "", {
                          shouldValidate: false,
                          shouldDirty: true,
                        });
                      }
                    }}
                    value={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="industrial" />
                      </FormControl>
                      <FormLabel>Industrial</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="comercio-servicos" />
                      </FormControl>
                      <FormLabel>Comércio e Serviços</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ---------- HIDDEN INPUTS (sempre montados) ---------- */}
          {/* Registro dos inputs invisíveis para que RHF valide corretamente.
              Usamos validate que checa o tipo atual (capturado em render). */}
          <input
            // input para o select industrial (sempre presente, fica fora da UI)
            {...register("atividadeIndustrialSelecionada", {
              validate: (val) =>
                tipoAtividade !== "industrial" ||
                (!!val && val !== "") ||
                "Selecione a atividade industrial.",
            })}
            // escondido mas acessível para a API do RHF (não use type="hidden" com required)
            style={{ position: "absolute", left: -9999, width: 1, height: 1 }}
            tabIndex={-1}
            aria-hidden={true}
            defaultValue=""
          />
          <input
            {...register("atividadeComercialSelecionada", {
              validate: (val) =>
                tipoAtividade !== "comercio-servicos" ||
                (!!val && val !== "") ||
                "Selecione a atividade de comércio/serviços.",
            })}
            style={{ position: "absolute", left: -9999, width: 1, height: 1 }}
            tabIndex={-1}
            aria-hidden={true}
            defaultValue=""
          />
          {/* ----------------------------------------------------- */}

          {/* Se industrial -> Select visual que sincroniza com o input registrado */}
          {tipoAtividade === "industrial" && (
            <div className="space-y-4">
              <FormField
                control={control}
                name="atividadeIndustrialSelecionada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecione a Atividade Industrial *</FormLabel>

                    <Select
                      onValueChange={(value) => {
                        // atualiza RHF (campo registrado) e força validação imediata
                        setValue("atividadeIndustrialSelecionada", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        // também atualiza o field caso algum wrapper dependa dele
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {ATIVIDADES_INDUSTRIAIS.map((atividade, index) => (
                          <SelectItem key={index} value={atividade}>
                            {atividade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Exibe mensagem de erro do RHF (resolver ou register) */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="atividadeIndustrial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Descreva o processo industrial e o que fabrica
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o processo..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Se comércio e serviços -> Select visual que sincroniza com o input registrado */}
          {tipoAtividade === "comercio-servicos" && (
            <div className="space-y-4">
              <FormField
                control={control}
                name="atividadeComercialSelecionada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Selecione a Atividade de Comércio e Serviços *
                    </FormLabel>

                    <Select
                      onValueChange={(value) => {
                        setValue("atividadeComercialSelecionada", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {ATIVIDADES_COMERCIAIS.map((atividade, index) => (
                          <SelectItem key={index} value={atividade}>
                            {atividade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="atividadeComercial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Descreva a mercadoria e se tem depósito
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a mercadoria..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* CLASSE DE CONSTRUÇÃO */}
      <Card>
        <CardHeader>
          <CardTitle>🏗️ Classe de Construção</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="classeConstrucao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escolha SOMENTE UMA das classes *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLASSE_CONSTRUCAO_OPTIONS.map((opcao) => (
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

          {(classeConstrucao === "isopainel-25" ||
            classeConstrucao === "isopainel-mais-25") && (
            <FormField
              control={control}
              name="tipoIsopainel"
              render={({ field }) => (
                <FormItem className="p-4 bg-yellow-50 rounded-lg">
                  <FormLabel>Tipo de Isopainel do Local</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descreva o tipo de isopainel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
