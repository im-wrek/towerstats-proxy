"use client";

import { useState } from "react";

export default function Dashboard() {
  const [tracker, setTracker] = useState("etoh");
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${tracker}/${username}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: "Failed to fetch" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">TowerStats Proxy Dashboard</h1>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Tracker (etoh, tds, jtoh...)"
          value={tracker}
          onChange={(e) => setTracker(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={fetchStats}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Fetch
        </button>
      </div>
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        {loading && <p>Loading...</p>}
        {result && result.error && (
          <p className="text-red-500">Error: {result.error}</p>
        )}
        {result && !result.error && (
          <div>
            <p>
              <strong>Username:</strong> {result.username}
            </p>
            <p>
              <strong>Hardest Tower:</strong> {result.hardestTower}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
