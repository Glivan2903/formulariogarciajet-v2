"use client";

import SeguroIncendioForm from "@/components/SeguroIncendioForm";

/**
 * Esta é a página principal que será acedida pelos utilizadores.
 * A sua única responsabilidade é importar e renderizar o componente
 * do formulário de seguro que criámos.
 */
export default function SeguroIncendioPage() {
  return (
    // O formulário já tem o seu próprio layout de fundo (gradiente),
    // pelo que pode ser renderizado diretamente.
    <SeguroIncendioForm />
  );
}
