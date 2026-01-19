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
  const [tracker, setTracker] = useState("");
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<TowerStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEndpoint = useCallback(async () => {
    if (!username.trim() || !tracker.trim()) {
      setError("Enter a tracker and username");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/${tracker}?username=${username}`, {
        cache: "no-store",
      });
      const data: TowerStatsResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [tracker, username]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">TowerStats Proxy Dashboard</h1>
        <p className="text-gray-500 mb-6">
          Live tower stats for any TowerStats tracker.
        </p>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="flex gap-3 mb-4">
            <input
              className="flex-1 rounded border px-3 py-2"
              placeholder="Tracker"
              value={tracker}
              onChange={(e) => setTracker(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && testEndpoint()}
            />
            <input
              className="flex-1 rounded border px-3 py-2"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && testEndpoint()}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
              disabled={loading}
              onClick={testEndpoint}
            >
              {loading ? "Loading…" : "Fetch"}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-3">{error}</div>
          )}

          {result?.hardestTower && (
            <div className="p-4 rounded-md bg-gray-100 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: result.hardestTower.color }}>
                  {result.hardestTower.name}
                </span>
                <span className="text-gray-500">{result.hardestTower.extra}</span>
              </div>
              <pre className="text-xs overflow-x-auto bg-white p-2 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
