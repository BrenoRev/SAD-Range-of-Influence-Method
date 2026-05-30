import { useCallback, useState } from "react";
import { jsonFetch } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import type { components } from "@/shared/types/api";

type SensitivityRequest = components["schemas"]["SensitivityRequest"];
type SensitivityResult = components["schemas"]["SensitivityResult"];

export function useSensitivity() {
  const [data, setData] = useState<SensitivityResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (req: SensitivityRequest, signal?: AbortSignal): Promise<SensitivityResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await jsonFetch<SensitivityResult>("/api/rim/sensitivity", {
          method: "POST",
          body: JSON.stringify(req),
          signal,
        });
        setData(res);
        return res;
      } catch (e) {
        logger.exception("useSensitivity", e, {
          endpoint: "POST /api/rim/sensitivity",
          criterionIndex: req.criterion_index,
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

  return { data, error, loading, run };
}
