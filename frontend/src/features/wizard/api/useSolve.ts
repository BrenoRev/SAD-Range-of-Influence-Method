import { useCallback, useState } from "react";
import { jsonFetch } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import type { components } from "@/shared/types/api";

type DecisionInput = components["schemas"]["DecisionInput"];
type DecisionResult = components["schemas"]["DecisionResult"];

export function useSolve() {
  const [data, setData] = useState<DecisionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const solve = useCallback(
    async (body: DecisionInput, signal?: AbortSignal): Promise<DecisionResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await jsonFetch<DecisionResult>("/api/rim/solve", {
          method: "POST",
          body: JSON.stringify(body),
          signal,
        });
        setData(res);
        return res;
      } catch (e) {
        logger.exception("useSolve", e, {
          endpoint: "POST /api/rim/solve",
          alternatives: body.alternatives.length,
          criteria: body.criteria.length,
        });
        if ((e as Error).name === "AbortError") return null;
        setError(e as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clear = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, error, loading, solve, clear };
}
