const KEY = process.env.DUNE_API_KEY ?? "";
const BASE = "https://api.dune.com/api/v1";

const HEADERS = {
  "X-Dune-API-Key": KEY,
  "Content-Type": "application/json",
};

interface ExecuteResponse {
  execution_id: string;
  state: string;
}

interface ResultRow {
  [key: string]: string | number | boolean | null;
}

interface ResultsResponse {
  state: string;
  result?: {
    rows: ResultRow[];
  };
}

export type DuneResult = ResultRow[];

export async function executeDuneQuery(
  queryId: number,
  params?: Record<string, string>
): Promise<DuneResult | null> {
  if (!KEY) return null;
  try {
    const execRes = await fetch(`${BASE}/query/${queryId}/execute`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(params ? { query_parameters: params } : {}),
    });
    if (!execRes.ok) return null;
    const execJson: ExecuteResponse = await execRes.json();
    const { execution_id } = execJson;

    // Poll up to 10s
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 1000));
      const pollRes = await fetch(`${BASE}/execution/${execution_id}/results`, {
        headers: HEADERS,
      });
      if (!pollRes.ok) return null;
      const pollJson: ResultsResponse = await pollRes.json();
      if (pollJson.state === "QUERY_STATE_COMPLETED") {
        return pollJson.result?.rows ?? null;
      }
      if (pollJson.state === "QUERY_STATE_FAILED") return null;
    }
    return null;
  } catch {
    return null;
  }
}

export interface ProtocolRevenue {
  protocol: string;
  revenue7d: number;
}

export async function fetchProtocolRevenue(): Promise<ProtocolRevenue[] | null> {
  if (!KEY) return null;
  try {
    const rows = await executeDuneQuery(3306924);
    if (!rows) return null;
    return rows
      .filter((r) => r.protocol && r.fees_usd != null)
      .map((r) => ({
        protocol: String(r.protocol).toLowerCase(),
        revenue7d: Number(r.fees_usd),
      }))
      .slice(0, 50);
  } catch {
    return null;
  }
}
