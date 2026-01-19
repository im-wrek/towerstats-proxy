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
    } catch {
      setError("Failed to fetch API");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-yellow-400 text-center">
        TowerStats Proxy
      </h1>
      <p className="text-gray-300 text-center mb-4">
        Get the hardest tower for any tracker instantly
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full mb-6">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 rounded-lg bg-gray-700 border border-gray-600 flex-1 text-white placeholder-gray-400 focus:outline-yellow-400 focus:ring focus:ring-yellow-500"
        />
        <select
          value={tracker}
          onChange={(e) => setTracker(e.target.value)}
          className="p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-yellow-400 focus:ring focus:ring-yellow-500"
        >
          <option value="etoh">ETOH</option>
          <option value="jtoh">JTOH</option>
          <option value="etohxxl">ETOH XXL</option>
          <option value="tea">TEA</option>
        </select>
        <button
          onClick={fetchHardestTower}
          className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition"
        >
          Get Hardest Tower
        </button>
      </div>

      {loading && <p className="text-gray-300 text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {hardestTower && (
        <div className="bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-600 w-full text-center">
          <p className="text-2xl font-bold mb-2">
            <span
              style={{ color: hardestTower.hex || "#fff" }}
              className="font-extrabold"
            >
              {hardestTower.tower}
            </span>
          </p>
          <p className="text-gray-400 mb-2">{hardestTower.extraText}</p>
          <p className="text-gray-500 text-sm">Hex: {hardestTower.hex || "N/A"}</p>
        </div>
      )}
    </div>
  );
}
