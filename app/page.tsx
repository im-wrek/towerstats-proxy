"use client";

import { useState, useCallback } from "react";

interface HardestTower {
  name: string;
  color: string;
  extra: string;
}

interface TowerStatsResponse {
  success: boolean;
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
    <main className="min-h-screen p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold text-center">TowerStats Proxy</h1>
        <p className="text-center text-gray-500">
          Lightweight proxy for towerstats.com – supports any tracker
        </p>

        <div className="p-6 bg-white shadow rounded-lg space-y-4">
          <div className="flex gap-3">
            <input
              placeholder="Tracker name (e.g., etoh, tds, jtoh)"
              value={tracker}
              onChange={(e) => setTracker(e.target.value)}
              className="flex-1 rounded border px-3 py-2 text-sm"
            />
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && testEndpoint()}
              className="flex-1 rounded border px-3 py-2 text-sm"
            />
            <button
              onClick={testEndpoint}
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:bg-gray-400"
            >
              {loading ? "Loading…" : "Test"}
            </button>
          </div>

          {error && (
            <div className="text-red-700 bg-red-100 p-2 rounded">{error}</div>
          )}

          {result?.hardestTower && (
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <span className="font-semibold">Hardest Tower:</span>
                <span
                  className="font-bold"
                  style={{ color: result.hardestTower.color }}
                >
                  {result.hardestTower.name}
                </span>
                <span className="text-gray-500">{result.hardestTower.extra}</span>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {result && !result.hardestTower && (
            <div className="text-gray-500">Hardest tower not found.</div>
          )}
        </div>
      </div>
    </main>
  );
}
