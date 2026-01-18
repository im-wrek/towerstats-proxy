"use client";

import { useState, useCallback } from "react";

interface HardestTower {
  name: string;
  color: string;
  extra: string;
}

interface TowerStatsResponse {
  success: boolean;
  source?: string;
  hardestTower?: HardestTower | null;
  error?: string;
}

export default function Home() {
  const [tracker, setTracker] = useState("etoh");
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<TowerStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEndpoint = useCallback(async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/${tracker}?username=${encodeURIComponent(username)}`,
        { cache: "no-store" }
      );
      const data: TowerStatsResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [tracker, username]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold">TowerStats Proxy</h1>
        <p className="mb-8 text-gray-500">
          Lightweight API proxy for towerstats.com
        </p>

        <div className="mb-8 rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Test Endpoint</h2>

          <div className="mb-4 flex gap-3">
            <select
              value={tracker}
              onChange={(e) => setTracker(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option value="etoh">ETOH</option>
              <option value="tds">TDS</option>
              <option value="jtoh">JToH</option>
            </select>

            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && testEndpoint()}
              className="rounded-md border px-3 py-2 text-sm flex-1"
            />

            <button
              onClick={testEndpoint}
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:bg-gray-400"
            >
              {loading ? "Loading…" : "Test"}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {result?.hardestTower && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Hardest Tower:</span>
                <span
                  className="font-semibold"
                  style={{ color: result.hardestTower.color }}
                >
                  {result.hardestTower.name}
                </span>
                <span className="text-sm text-gray-500">
                  {result.hardestTower.extra}
                </span>
              </div>

              <pre className="overflow-x-auto rounded-md bg-gray-100 p-4 text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {result && !result.hardestTower && (
            <div className="text-sm text-gray-500">Hardest tower not found.</div>
          )}
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">API Usage</h2>
          <code className="mb-4 block rounded bg-gray-100 p-3 text-sm">
            GET /api/{"{tracker}"}?username={"{"}username{"}"}
          </code>

          <pre className="rounded bg-gray-100 p-3 text-xs">
{`{
  "success": true,
  "hardestTower": {
    "name": "ToM",
    "color": "#FFFE00",
    "extra": "(2.12) - Top 11.78%"
  }
}`}
          </pre>
        </div>
      </div>
    </main>
  );
}
