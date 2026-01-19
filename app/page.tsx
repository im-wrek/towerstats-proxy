"use client";

import { useState } from "react";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [tracker, setTracker] = useState("etoh");
  const [hardestTower, setHardestTower] = useState<{
    hex: string | null;
    tower: string | null;
    extraText: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHardestTower = async () => {
    setLoading(true);
    setError(null);
    setHardestTower(null);

    try {
      const res = await fetch(`/api?username=${username}&tracker=${tracker}`);
      const data = await res.json();

      if (res.ok) {
        setHardestTower(data.hardest_tower);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (e) {
      setError("Failed to fetch API");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-yellow-400">TowerStats Proxy</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700 flex-1"
        />
        <select
          value={tracker}
          onChange={(e) => setTracker(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="etoh">ETOH</option>
          <option value="jtoh">JTOH</option>
          <option value="etohxxl">ETOH XXL</option>
          <option value="tea">TEA</option>
        </select>
        <button
          onClick={fetchHardestTower}
          className="px-4 py-2 bg-yellow-400 text-gray-900 rounded font-bold hover:bg-yellow-500 transition"
        >
          Get Hardest Tower
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {hardestTower && (
        <div className="p-4 bg-gray-800 rounded border border-gray-700">
          <p>
            <span
              style={{ color: hardestTower.hex || "#fff" }}
              className="font-bold text-lg"
            >
              {hardestTower.tower}
            </span>{" "}
            - {hardestTower.extraText}
          </p>
          <p className="text-gray-400 text-sm">
            Hex: {hardestTower.hex || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}
