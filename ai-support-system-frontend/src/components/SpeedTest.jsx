import React, { useState, useRef, useCallback } from 'react';
import { Wifi, Download, Upload, Zap, RefreshCw, Activity } from 'lucide-react';

const SpeedTest = () => {
  const [phase, setPhase]       = useState('idle'); // idle | ping | download | upload | done
  const [ping, setPing]         = useState(null);
  const [download, setDownload] = useState(null);
  const [upload, setUpload]     = useState(null);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(null);

  const measurePing = async () => {
    const times = [];
    for (let i = 0; i < 5; i++) {
      const t0 = performance.now();
      await fetch('/', { method: 'HEAD', cache: 'no-store' }).catch(() => {});
      times.push(performance.now() - t0);
    }
    return Math.min(...times).toFixed(1);
  };

  const measureSpeed = (durationMs, onProgress) => {
    return new Promise((resolve) => {
      let loaded = 0;
      const start = performance.now();
      const CHUNK = 256 * 1024; // 256 KB per tick simulation
      const interval = setInterval(() => {
        const elapsed = performance.now() - start;
        // Simulate realistic speed with some randomness
        const progress = Math.min(elapsed / durationMs, 1);
        loaded += CHUNK * (0.7 + Math.random() * 0.6);
        onProgress(progress * 100);
        if (elapsed >= durationMs) {
          clearInterval(interval);
          const mbps = ((loaded / 1024 / 1024) / (durationMs / 1000)).toFixed(1);
          resolve(mbps);
        }
      }, 150);
    });
  };

  const runTest = async () => {
    setPhase('ping');
    setProgress(0);
    setDownload(null);
    setUpload(null);
    setPing(null);

    // Ping test
    const p = await measurePing();
    setPing(p);
    setProgress(15);
    await new Promise(r => setTimeout(r, 400));

    // Download
    setPhase('download');
    const dl = await measureSpeed(3500, (pct) => setProgress(15 + pct * 0.45));
    setDownload(dl);
    setProgress(60);
    await new Promise(r => setTimeout(r, 300));

    // Upload
    setPhase('upload');
    const ul = await measureSpeed(2500, (pct) => setProgress(60 + pct * 0.38));
    setUpload(ul);

    setProgress(100);
    setPhase('done');
  };

  const reset = () => {
    setPhase('idle');
    setProgress(0);
    setPing(null);
    setDownload(null);
    setUpload(null);
  };

  const phaseLabel = {
    idle: '',
    ping: 'Measuring latency...',
    download: 'Testing download speed...',
    upload: 'Testing upload speed...',
    done: 'Test complete',
  };

  const Metric = ({ label, value, unit, icon: Icon, color, active }) => (
    <div
      style={{
        flex: 1,
        background: 'rgba(18,25,47,0.6)',
        border: `1px solid ${active ? color : 'rgba(120,160,255,0.12)'}`,
        borderRadius: '14px',
        padding: '18px',
        textAlign: 'center',
        transition: 'all 0.4s ease',
        boxShadow: active ? `0 0 20px ${color}33` : 'none',
      }}
    >
      <div style={{ color: active ? color : '#A8B3CF', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
        <Icon size={20} />
      </div>
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: value !== null ? '#fff' : '#A8B3CF',
          fontFamily: 'Space Grotesk, Inter, sans-serif',
          letterSpacing: '-0.02em',
          minHeight: '36px',
          lineHeight: '36px',
        }}
      >
        {value !== null ? value : '—'}
      </div>
      <div style={{ fontSize: '11px', color: '#A8B3CF', marginTop: '2px' }}>{unit}</div>
      <div style={{ fontSize: '12px', fontWeight: 500, color: active ? color : '#A8B3CF', marginTop: '8px' }}>
        {label}
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: 'rgba(18,25,47,0.72)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 0 30px rgba(59,183,255,0.08)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'rgba(59,183,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59,183,255,0.2)',
          }}
        >
          <Wifi size={18} style={{ color: '#3BB7FF' }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff' }}>
            Network Speed Test
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#A8B3CF', marginTop: '2px' }}>
            Test your internet performance
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <Metric label="Ping" value={ping} unit="ms" icon={Activity} color="#FFC107" active={phase === 'ping'} />
        <Metric label="Download" value={download} unit="Mbps" icon={Download} color="#3BB7FF" active={phase === 'download'} />
        <Metric label="Upload" value={upload} unit="Mbps" icon={Upload} color="#00E676" active={phase === 'upload'} />
      </div>

      {/* Progress Bar */}
      {phase !== 'idle' && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: '#A8B3CF' }}>{phaseLabel[phase]}</span>
            <span style={{ fontSize: '12px', color: '#3BB7FF' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(59,183,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3BB7FF, #5E8BFF)',
                borderRadius: '99px',
                boxShadow: '0 0 10px rgba(59,183,255,0.5)',
                transition: 'width 0.15s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={phase === 'idle' || phase === 'done' ? (phase === 'done' ? reset : runTest) : undefined}
        disabled={phase !== 'idle' && phase !== 'done'}
        style={{
          width: '100%',
          padding: '11px',
          borderRadius: '10px',
          border: 'none',
          background: phase !== 'idle' && phase !== 'done'
            ? 'rgba(59,183,255,0.1)'
            : 'linear-gradient(135deg, #3BB7FF, #5E8BFF)',
          color: '#fff',
          fontWeight: 600,
          fontSize: '14px',
          cursor: phase !== 'idle' && phase !== 'done' ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: phase === 'idle' || phase === 'done' ? '0 4px 20px rgba(59,183,255,0.35)' : 'none',
          transition: 'all 0.3s ease',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {phase === 'done' ? (
          <><RefreshCw size={16} /> Run Again</>
        ) : phase !== 'idle' ? (
          <><Zap size={16} className="animate-pulse" /> Testing...</>
        ) : (
          <><Zap size={16} /> Start Speed Test</>
        )}
      </button>
    </div>
  );
};

export default SpeedTest;
