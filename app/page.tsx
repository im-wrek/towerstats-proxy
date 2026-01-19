"use client";

import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/${username}`);
      const data = await res.json();
      setResult(data.hardestTower || "No data found");
    } catch {
      setResult("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">TowerStats Scraper</h1>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-4 py-2 border rounded-md"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
          {loading ? "Loading..." : "Fetch"}
        </button>
      </form>

      {result && <p className="mt-6 text-xl">Hardest Tower: {result}</p>}
    </main>
  );
}
