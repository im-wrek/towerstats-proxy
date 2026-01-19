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

      if (res.ok) setHardestTower(data.hardest_tower);
      else setError(data.error || "Unknown error");
    } catch {
      setError("Failed to fetch API");
    }

    setLoading(false);
  };

  return (
    <div>
      <style>{`
        body { margin:0; font-family:sans-serif; background: linear-gradient(180deg,#0f172a,#1e293b); color:white; }
        .container { max-width:500px; margin:2rem auto; padding:2rem; background:rgba(30,41,59,0.9); border-radius:1rem; text-align:center; }
        input, select { padding:0.75rem; margin:0.5rem 0; border-radius:0.5rem; border:1px solid #4b5563; background:#1f2937; color:white; width:100%; }
        button { padding:0.75rem 1.5rem; margin-top:0.5rem; border-radius:0.5rem; border:none; font-weight:bold; background:#facc15; color:#111827; cursor:pointer; }
        button:hover { background:#fbbf24; transform:translateY(-1px); }
        .result { margin-top:1.5rem; padding:1rem; background:#374151; border-radius:0.75rem; }
      `}</style>

      <div className="container">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#facc15' }}>TowerStats Proxy</h1>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <select value={tracker} onChange={(e) => setTracker(e.target.value)}>
          <option value="etoh">ETOH</option>
          <option value="jtoh">JTOH</option>
          <option value="etohxxl">ETOH XXL</option>
          <option value="tea">TEA</option>
        </select>
        <button onClick={fetchHardestTower}>Get Hardest Tower</button>

        {loading && <p style={{ marginTop:'1rem', color:'#9ca3af' }}>Loading...</p>}
        {error && <p style={{ marginTop:'1rem', color:'#f87171' }}>{error}</p>}

        {hardestTower && (
          <div className="result">
            <p style={{
              fontSize:'1.5rem', fontWeight:'bold',
              background: hardestTower.hex ? `linear-gradient(90deg, ${hardestTower.hex}, #ffffff)` : 'none',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
            }}>{hardestTower.tower}</p>
            <p style={{ color:'#9ca3af' }}>{hardestTower.extraText}</p>
            <p style={{ color:'#6b7280', fontSize:'0.875rem' }}>Hex: {hardestTower.hex || "N/A"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
