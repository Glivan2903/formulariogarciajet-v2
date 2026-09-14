import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface CurrencyInputProps {
  name: string;
  label: string;
  placeholder?: string;
}

// Formata o valor decimal em moeda BRL
const formatCurrency = (value: string | number): string => {
  if (value === null || value === undefined || value === "") return "";
  
  let num: number;
  if (typeof value === "number") {
    num = value;
  } else {
    // Remove tudo que não for número ou vírgula/ponto e converte
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) return "";
    num = parseInt(cleaned, 10) / 100;
  }

  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

// Converte string formatada de volta para número decimal
const parseCurrency = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, "").replace(",", ".").replace("R$", "").trim());
};

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ name, label, placeholder }) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const [displayValue, setDisplayValue] = useState(() => formatCurrency(field.value));

        // Sincroniza se o valor do RHF mudar (ex: reset)
        useEffect(() => {
          setDisplayValue(formatCurrency(field.value));
        }, [field.value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const rawValue = e.target.value;
          // Remove tudo que não é número
          const numericValue = rawValue.replace(/\D/g, "");
          setDisplayValue(formatCurrency(numericValue));
        };

        const handleBlur = () => {
          const numericValue = parseCurrency(displayValue); // valor decimal correto
          field.onChange(numericValue); // atualiza RHF
          setDisplayValue(formatCurrency(numericValue)); // exibe corretamente formatado
        };

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                placeholder={placeholder || "R$ 0,00"}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
