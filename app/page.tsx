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
  cached?: boolean;
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
      const res = await fetch(`/api/${tracker}?username=${encodeURIComponent(username)}`, { cache: "no-store" });
      const data: TowerStatsResponse = await res.json();
      if (!data.success) setError(data.error || "Unknown error");
      else setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [tracker, username]);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>TowerStats Proxy Tester</h1>

      <div style={{ margin: "1rem 0" }}>
        <select value={tracker} onChange={(e) => setTracker(e.target.value)}>
          <option value="etoh">ETOH</option>
          <option value="tds">TDS</option>
          <option value="jtoh">JToH</option>
        </select>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && testEndpoint()}
          style={{ marginLeft: "0.5rem" }}
        />

        <button onClick={testEndpoint} disabled={loading} style={{ marginLeft: "0.5rem" }}>
          {loading ? "Loading…" : "Test"}
        </button>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {result?.hardestTower && (
        <div style={{ marginTop: "1rem" }}>
          <strong>Hardest Tower:</strong>{" "}
          <span style={{ color: result.hardestTower.color }}>{result.hardestTower.name}</span>{" "}
          {result.hardestTower.extra}
          {result.cached && <span> (cached)</span>}
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {result && !result.hardestTower && <div>No hardest tower found.</div>}
    </main>
  );
}
