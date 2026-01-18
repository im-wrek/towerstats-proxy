"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  cached?: boolean;
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
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold">TowerStats Proxy</h1>
        <p className="mb-8 text-muted-foreground">
          Lightweight API proxy for towerstats.com
        </p>

        <div className="mb-8 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Test Endpoint</h2>

          <div className="mb-4 flex gap-3">
            <select
              value={tracker}
              onChange={(e) => setTracker(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="etoh">ETOH</option>
              <option value="tds">TDS</option>
              <option value="jtoh">JToH</option>
            </select>

            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && testEndpoint()}
            />

            <Button onClick={testEndpoint} disabled={loading}>
              {loading ? "Loading…" : "Test"}
            </Button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {result?.hardestTower && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Hardest Tower:
                </span>
                <span
                  className="font-semibold"
                  style={{ color: result.hardestTower.color }}
                >
                  {result.hardestTower.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {result.hardestTower.extra}
                </span>
              </div>

              <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {result && !result.hardestTower && (
            <div className="text-sm text-muted-foreground">
              Hardest tower not found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
