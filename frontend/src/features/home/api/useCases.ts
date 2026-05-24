import { useEffect, useRef, useState } from "react";
import { jsonFetch } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import type { components } from "@/shared/types/api";

type CaseSummary = components["schemas"]["CaseSummary"];

let cachedCases: CaseSummary[] | null = null;

export function useCases() {
  const [data, setData] = useState<CaseSummary[] | null>(cachedCases);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(cachedCases === null);
  const aborted = useRef(false);

  useEffect(() => {
    if (cachedCases) {
      setData(cachedCases);
      setLoading(false);
      return;
    }
    aborted.current = false;
    const controller = new AbortController();
    setLoading(true);
    jsonFetch<CaseSummary[]>("/api/cases", { signal: controller.signal })
      .then((res) => {
        if (aborted.current) return;
        cachedCases = res;
        setData(res);
      })
      .catch((e: Error) => {
        logger.exception("useCases", e, { endpoint: "GET /api/cases" });
        if (aborted.current || e.name === "AbortError") return;
        setError(e);
      })
      .finally(() => {
        if (!aborted.current) setLoading(false);
      });
    return () => {
      aborted.current = true;
      controller.abort();
    };
  }, []);

  return { data, error, loading };
}
