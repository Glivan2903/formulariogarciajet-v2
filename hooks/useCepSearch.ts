import { useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";
import { FormValues } from "../lib/schema";

export const useCepSearch = (setValue: UseFormSetValue<FormValues>) => {
  const [isSearching, setIsSearching] = useState(false);

  const searchCep = async (cep: string) => {
    const cleanedCep = cep.replace(/[^0-9]/g, "");
    if (cleanedCep.length !== 8) {
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setValue("rua", data.logradouro);
        setValue("complemento", data.complemento);
        setValue("bairro", data.bairro);
        setValue("municipio", data.localidade);
        setValue("estado", data.uf);
        toast.success("Endereço encontrado!");
      } else {
        toast.error("CEP não encontrado", {
          description: "Por favor, verifique o CEP ou preencha o endereço manualmente.",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP", {
        description: "Houve um problema na comunicação com a API de CEP.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return { isSearching, searchCep };
};
