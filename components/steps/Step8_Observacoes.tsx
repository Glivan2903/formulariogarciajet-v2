import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { MAX_UPLOAD_MB, TIPOS_ANEXO_ACEITOS } from "@/lib/constants";
import { FormValues } from "@/lib/schema";

const LIMITE_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

const formatarTamanho = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const Step8_Observacoes = () => {
  const { control, watch, setValue } = useFormContext<FormValues>();
  const inputRef = useRef<HTMLInputElement>(null);

  const anexos = (watch("anexos") as File[] | undefined) ?? [];
  const totalBytes = anexos.reduce((soma, arquivo) => soma + arquivo.size, 0);

  const adicionarArquivos = (lista: FileList | null) => {
    if (!lista || lista.length === 0) return;

    const novos = Array.from(lista);
    const jaExiste = (arquivo: File) =>
      anexos.some((atual) => atual.name === arquivo.name && atual.size === arquivo.size);

    const novosArquivos = novos.filter((arquivo) => !jaExiste(arquivo));
    const duplicados = novos.length - novosArquivos.length;

    if (duplicados > 0) {
      toast.info(
        duplicados === 1
          ? "Um arquivo já estava anexado e foi ignorado."
          : `${duplicados} arquivos já estavam anexados e foram ignorados.`
      );
    }

    if (novosArquivos.length === 0) return;

    const novoTotal = novosArquivos.reduce((soma, arquivo) => soma + arquivo.size, totalBytes);

    if (novoTotal > LIMITE_BYTES) {
      toast.error("Limite de anexos excedido", {
        description: `O total de arquivos não pode passar de ${MAX_UPLOAD_MB} MB. Envie os arquivos maiores pelo WhatsApp após finalizar.`,
      });
      return;
    }

    setValue("anexos", [...anexos, ...novosArquivos], { shouldDirty: true });
  };

  const removerArquivo = (indice: number) => {
    setValue(
      "anexos",
      anexos.filter((_, posicao) => posicao !== indice),
      { shouldDirty: true }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📎 Observações e Documentos</CardTitle>
        <CardDescription>
          Adicione informações complementares e anexe os documentos do risco.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações a Acrescentar</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[100px]"
                  placeholder="Digite observações adicionais sobre o risco..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="clausulasComplementares"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cláusulas Complementares</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[80px]"
                  placeholder="Digite cláusulas complementares..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div>
            <FormLabel>Anexar Documentos</FormLabel>
            <p className="text-sm text-gray-500 mt-1">
              Apólice anterior, planilhas, cotações da concorrência e fotografias do
              risco. Os arquivos seguem anexados no e-mail da cotação.
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept={TIPOS_ANEXO_ACEITOS}
            className="hidden"
            onChange={(evento) => {
              adicionarArquivos(evento.target.files);
              // Permite reanexar o mesmo arquivo depois de removê-lo.
              evento.target.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
            <span className="block text-sm font-medium text-gray-700">
              Clique para selecionar os arquivos
            </span>
            <span className="block text-xs text-gray-500 mt-1">
              PDF, imagens, Word ou Excel — até {MAX_UPLOAD_MB} MB no total
            </span>
          </button>

          {anexos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {anexos.length} {anexos.length === 1 ? "arquivo anexado" : "arquivos anexados"}
                </span>
                <span className="font-medium">
                  {formatarTamanho(totalBytes)} de {MAX_UPLOAD_MB} MB
                </span>
              </div>

              <ul className="divide-y rounded-lg border">
                {anexos.map((arquivo, indice) => (
                  <li
                    key={`${arquivo.name}-${arquivo.size}`}
                    className="flex items-center gap-3 p-3"
                  >
                    <Paperclip className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="flex-1 text-sm truncate" title={arquivo.name}>
                      {arquivo.name}
                    </span>
                    <span className="text-xs text-gray-500 shrink-0">
                      {formatarTamanho(arquivo.size)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerArquivo(indice)}
                      aria-label={`Remover ${arquivo.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg">
          <p className="text-green-800 font-semibold text-center mb-2">
            Envio de Documentos via WhatsApp
          </p>
          <p className="text-green-700 text-sm text-center">
            Arquivos grandes ou que não couberam aqui podem ser enviados pelo
            WhatsApp, para onde você será redirecionado após finalizar.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
