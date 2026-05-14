import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/shared/components/ui/Toast";
import { HelpButton } from "@/shared/components/ui/HelpButton";
import { logger } from "@/shared/lib/logger";
import { useWizard } from "@/features/wizard/context";
import { fetchCase } from "@/features/cases/api/useCase";
import { useCases } from "./api/useCases";
import { CaseCard } from "./components/CaseCard";
import { FactCell } from "./components/FactCell";
import { StartFromScratchCta } from "./components/StartFromScratchCta";
import { ResumeBanner } from "./components/ResumeBanner";

export function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: cases, loading, error } = useCases();
  const { reset, loadFromCase, hasSavedSnapshot, resumeSaved } = useWizard();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const onStart = () => {
    reset();
    navigate("/wizard/1");
    toast("Nova decisão iniciada", "info");
  };

  const onCase = async (id: string) => {
    setLoadingId(id);
    try {
      const detail = await fetchCase(id);
      loadFromCase(detail);
      toast(`Caso carregado: ${detail.title}`, "ok");
      navigate("/wizard/4");
    } catch (e) {
      logger.exception("Home.onCase", e, { caseId: id });
      toast(`Falha ao carregar caso: ${(e as Error).message}`, "danger");
    } finally {
      setLoadingId(null);
    }
  };

  const onResume = () => {
    const ok = resumeSaved();
    if (ok) {
      toast("Decisão salva carregada", "info");
      navigate("/wizard/1");
    } else {
      toast("Nenhuma decisão salva encontrada", "danger");
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[40px] font-semibold leading-none tracking-tight text-ink sm:text-[48px]">
              RIM
            </div>
            <h1 className="mt-2 text-[20px] font-semibold leading-tight text-ink sm:text-[22px]">
              Método do Ideal de Referência
            </h1>
          </div>
          <HelpButton />
        </div>

        <p className="mt-5 max-w-xl text-[15px] text-ink">
          Classifique suas opções contra um ideal definido, com total transparência.
        </p>

        {hasSavedSnapshot ? <ResumeBanner onResume={onResume} /> : null}

        <StartFromScratchCta onStart={onStart} />

        <div className="mt-12">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[16px] font-semibold text-ink">Ou explore um caso</h3>
            <span className="text-[12px] text-muted">
              {cases ? `${cases.length} exemplo${cases.length === 1 ? "" : "s"} pré-preenchido${cases.length === 1 ? "" : "s"}` : ""}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] text-muted">
            Clique em um cartão para carregar todos os dados e ir direto para o resultado.
          </p>

          {loading ? (
            <div className="mt-4 text-[13px] text-muted">Carregando casos…</div>
          ) : error ? (
            <div className="mt-4 text-[13px] text-danger">
              Falha ao buscar casos: {error.message}. Verifique se o backend está em
              http://localhost:8000.
            </div>
          ) : cases && cases.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {cases.map((c) => (
                <CaseCard
                  key={c.id}
                  summary={c}
                  onClick={() => void onCase(c.id)}
                  disabled={loadingId !== null}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 text-[13px] text-muted">Nenhum caso disponível.</div>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 border-t border-line pt-10 sm:grid-cols-3">
          <FactCell
            label="Etapa 1"
            title="Liste as opções"
            body="Qualquer coisa que dê para comparar lado a lado: notebooks, propostas, fornecedores."
          />
          <FactCell
            label="Etapas 2–3"
            title="Defina o que importa"
            body="Adicione critérios com faixas realistas e um valor ideal, e atribua pesos a cada um."
          />
          <FactCell
            label="Etapa 4"
            title="Receba a classificação"
            body="Cada opção ganha um score R e suas distâncias ao ideal e ao anti-ideal."
          />
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-6 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="font-mono text-ink">CIN0192</span> · Sistemas de Apoio à Decisão
          </span>
          <span>
            Referência: Cables, Lamata e Verdegay (2016).{" "}
            <a
              className="underline hover:text-ink"
              href="https://doi.org/10.1016/j.ins.2015.12.011"
              target="_blank"
              rel="noreferrer"
            >
              10.1016/j.ins.2015.12.011
            </a>
          </span>
        </div>

      </div>
    </div>
  );
}
