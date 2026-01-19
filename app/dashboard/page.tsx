"use client";

import { useState } from "react";

export default function Dashboard() {
  const [tracker, setTracker] = useState("");
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!tracker || !username) return;

    setLoading(true);
    const res = await fetch(`/api/${tracker}?username=${username}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">TowerStats Proxy</h1>
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Tracker (e.g., etoh)"
          value={tracker}
          onChange={(e) => setTracker(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={fetchStats}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Loading…" : "Fetch"}
        </button>
      </div>

      {result && (
        <div className="bg-white p-6 rounded shadow w-full max-w-md">
          {result.success ? (
            <>
              <p className="font-semibold text-lg text-indigo-700">
                Hardest Tower: {result.hardestTower?.name || "None"}
              </p>
              <p className="text-gray-500">{result.hardestTower?.extra}</p>
            </>
          ) : (
            <p className="text-red-500">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
