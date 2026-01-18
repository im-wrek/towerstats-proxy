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
    <main className="p-8">
      <h1>TowerStats Proxy</h1>

      <div>
        <select value={tracker} onChange={(e) => setTracker(e.target.value)}>
          <option value="etoh">ETOH</option>
          <option value="tds">TDS</option>
          <option value="jtoh">JToH</option>
        </select>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button onClick={testEndpoint}>{loading ? "Loading…" : "Test"}</button>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {result?.hardestTower && (
        <div>
          <div>
            Hardest Tower:{" "}
            <span style={{ color: result.hardestTower.color }}>
              {result.hardestTower.name}
            </span>{" "}
            {result.hardestTower.extra}
          </div>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {result && !result.hardestTower && <div>Hardest tower not found.</div>}
    </main>
  );
}
