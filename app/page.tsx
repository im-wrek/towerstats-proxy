"use client";

import { useState, useCallback, useEffect } from "react";

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

// Dynamic tracker list (can be updated manually or via fetching)
const defaultTrackers = ["etoh", "cscd", "tea", "atos", "ctt", "etohxl"]; // example

export default function Home() {
  const [trackers, setTrackers] = useState<string[]>(defaultTrackers);
  const [tracker, setTracker] = useState(trackers[0]);
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<TowerStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional: fetch tracker list from a JSON endpoint if TowerStats supports it
  useEffect(() => {
    // fetch("/api/trackers").then(...);
  }, []);

  const testEndpoint = useCallback(async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/${tracker}?username=${encodeURIComponent(username)}`, {
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
    <main className="min-h-screen bg-gray-50 p-6 sm:p-12 flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">TowerStats Proxy</h1>
          <p className="text-gray-500">Lightweight API proxy for towerstats.com</p>
        </header>

        {/* Test Endpoint Card */}
        <section className="bg-white shadow-md rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Test Endpoint</h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={tracker}
              onChange={(e) => setTracker(e.target.value)}
              className="flex-1 rounded-md border px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400"
            >
              {trackers.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>

            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && testEndpoint()}
              className="flex-2 rounded-md border px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={testEndpoint}
              disabled={loading}
              className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Loading…" : "Test"}
            </button>
          </div>

          {error && <div className="text-red-600 font-medium">{error}</div>}

          {result?.hardestTower && (
            <div className="bg-gray-50 rounded-md p-4 mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Hardest Tower</h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold" style={{ color: result.hardestTower.color }}>
                  {result.hardestTower.name}
                </span>
                <span className="text-gray-500">{result.hardestTower.extra}</span>
              </div>

              <pre className="mt-3 overflow-x-auto bg-gray-100 p-3 rounded text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {result && !result.hardestTower && (
            <div className="text-gray-500 mt-2">Hardest tower not found.</div>
          )}
        </section>

        {/* API Usage Card */}
        <section className="bg-white shadow-md rounded-xl p-6 space-y-2">
          <h2 className="text-xl font-semibold text-gray-700">API Usage</h2>
          <p className="text-gray-500">GET request format:</p>
          <code className="block bg-gray-100 p-3 rounded text-sm">
            GET /api/{"{tracker}"}?username={"{"}username{"}"}
          </code>
          <pre className="bg-gray-100 p-3 rounded text-xs">
{`{
  "success": true,
  "hardestTower": {
    "name": "ToM",
    "color": "#FFFE00",
    "extra": "(2.12) - Top 11.78%"
  }
}`}
          </pre>
        </section>
      </div>
    </main>
  );
}
