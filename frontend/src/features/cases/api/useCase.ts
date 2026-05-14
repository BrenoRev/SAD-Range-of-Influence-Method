import { useEffect, useState } from "react";
import { jsonFetch } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import type { components } from "@/shared/types/api";

type CaseDetail = components["schemas"]["CaseDetail"];

export function useCase(id: string | null) {
  const [data, setData] = useState<CaseDetail | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    jsonFetch<CaseDetail>(`/api/cases/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then((res) => setData(res))
      .catch((e: Error) => {
        logger.exception("useCase", e, { endpoint: `GET /api/cases/${id}` });
        if (e.name !== "AbortError") setError(e);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  return { data, error, loading };
}

export async function fetchCase(id: string, signal?: AbortSignal): Promise<CaseDetail> {
  return jsonFetch<CaseDetail>(`/api/cases/${encodeURIComponent(id)}`, { signal });
}
