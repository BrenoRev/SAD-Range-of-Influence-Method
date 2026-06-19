export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

// Achata o array de erros do Pydantic/FastAPI (detail[].msg) num texto legível,
// em vez de despejar o JSON cru no Banner.
function humanizeDetail(detail: unknown, status: number): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) =>
        d && typeof d === "object" && typeof (d as { msg?: unknown }).msg === "string"
          ? (d as { msg: string }).msg.replace(/^Value error,\s*/, "")
          : null,
      )
      .filter((m): m is string => Boolean(m));
    if (msgs.length) return msgs.join(" · ");
  }
  return `HTTP ${status}`;
}

export async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!r.ok) {
    const body: unknown = await r.json().catch(() => ({}));
    const detail =
      body && typeof body === "object" && "detail" in body
        ? (body as { detail: unknown }).detail
        : undefined;
    throw new HttpError(r.status, humanizeDetail(detail, r.status));
  }
  return (await r.json()) as T;
}
