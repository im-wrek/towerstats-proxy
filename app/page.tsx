"use client";

import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/${username}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>TowerStats Proxy</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        style={{ padding: "0.5rem", marginRight: "1rem" }}
      />
      <button onClick={fetchStats} disabled={loading}>
        {loading ? "Loading..." : "Fetch Stats"}
      </button>

      {data && (
        <pre style={{ marginTop: "2rem", whiteSpace: "pre-wrap" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}
