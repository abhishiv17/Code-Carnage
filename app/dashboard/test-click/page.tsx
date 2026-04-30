'use client';

import { useState } from 'react';

export default function TestClickPage() {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>🧪 Click Test Page</h1>
      
      <p style={{ marginBottom: 10 }}>Count: <strong>{count}</strong></p>

      <button
        type="button"
        onClick={() => {
          setCount((c) => c + 1);
          addLog('Button clicked!');
        }}
        style={{
          padding: '12px 24px',
          fontSize: 16,
          backgroundColor: '#7c3aed',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          marginBottom: 20,
        }}
      >
        CLICK ME (count: {count})
      </button>

      <div style={{ marginTop: 20 }}>
        <h3>Event Log:</h3>
        {log.length === 0 ? (
          <p style={{ color: '#999' }}>No clicks yet... If clicking does nothing, React hydration is broken.</p>
        ) : (
          log.map((entry, i) => <p key={i} style={{ margin: '4px 0', color: '#22c55e' }}>{entry}</p>)
        )}
      </div>
    </div>
  );
}
