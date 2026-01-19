"use client";

import { useState } from "react";

export default function Home() {
  const [tracker, setTracker] = useState("");
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!tracker || !username) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/${tracker}?username=${username}`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-8">TowerStats Proxy</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-xl">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Tracker (e.g. etoh / tds / jtoh)"
          value={tracker}
          onChange={(e) => setTracker(e.target.value)}
        />
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? "Fetching…" : "Fetch"}
        </button>
      </div>

      {result && (
        <div className="bg-white shadow-md rounded p-6 w-full max-w-xl">
          {result.success ? (
            <>
              <p className="text-2xl font-semibold text-indigo-700">
                Hardest Tower: {result.hardestTower?.name}
              </p>
              <p className="text-gray-600">{result.hardestTower?.extra}</p>
            </>
          ) : (
            <p className="text-red-500">{result.error}</p>
          )}
        </div>
      )}
    </main>
  );
}
