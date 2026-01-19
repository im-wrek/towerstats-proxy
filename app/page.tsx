import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [tracker, setTracker] = useState("");
  const [result, setResult] = useState<any>(null);

  const fetchStats = async () => {
    const res = await fetch(`/api/${tracker}?username=${username}`);
    const data = await res.json();
    setResult(data);
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>TowerStats Proxy</h1>

      <div style={{ maxWidth: 400, margin: "2rem auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <input
          type="text"
          placeholder="Tracker (etoh / tds / etc.)"
          value={tracker}
          onChange={e => setTracker(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <button onClick={fetchStats} style={{ padding: "0.5rem", fontSize: "1rem", cursor: "pointer" }}>
          Fetch Stats
        </button>
      </div>

      {result && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <p><strong>Tracker:</strong> {result.tracker}</p>
          <p><strong>Hardest Tower:</strong> {result.hardestTower}</p>
        </div>
      )}
    </main>
  );
}
