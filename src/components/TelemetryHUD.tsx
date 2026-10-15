import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, Cpu, Shield, Sparkles, FolderOpen } from 'lucide-react';
import type { EveSettings } from '../types/eve';

interface TelemetryHUDProps {
  settings: EveSettings;
  onToggleVoice: () => void;
  onOpenSettings: () => void;
  onToggleTools: () => void;
  toolsOpen: boolean;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  settings,
  onToggleVoice,
  onOpenSettings,
  onToggleTools,
  toolsOpen,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Subtle realistic FPS jitter between 59-60
    const fpsInterval = setInterval(() => {
      setFps(Math.random() > 0.3 ? 60 : 59);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(fpsInterval);
    };
  }, []);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'rgba(5, 10, 24, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(0, 102, 255, 0.3))',
            border: '1px solid var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 243, 255, 0.25)',
          }}
        >
          <Sparkles size={20} color="var(--accent-cyan)" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
              }}
            >
              PROJECT <span style={{ color: 'var(--accent-cyan)' }}>EVE</span>
            </h1>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(0, 243, 255, 0.1)',
                border: '1px solid var(--accent-cyan)',
                color: 'var(--accent-cyan)',
              }}
            >
              CORE v3.8
            </span>
          </div>
          <p
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
            }}
          >
            ENHANCED VIRTUAL ENTITY // JARVIS CLASS
          </p>
        </div>
      </div>

      {/* Telemetry Matrix (Clock + System Diagnostics) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}
        className="hud-telemetry"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 14px',
            background: 'rgba(8, 16, 36, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                letterSpacing: '0.05em',
              }}
            >
              {time || '00:00:00'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{date}</div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Graphics Engine Refresh Rate">
            <Cpu size={14} color="var(--accent-cyan)" />
            <span>{fps} FPS</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Local Sandbox Privacy">
            <Shield size={14} color="var(--accent-emerald)" />
            <span>SANDBOXED</span>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onToggleTools}
          className={`hud-btn ${toolsOpen ? 'hud-btn-primary' : ''}`}
          title="Toggle Assistant Tools Hub (Notes, Tasks, Weather, Diagnostics)"
        >
          <FolderOpen size={16} />
          <span style={{ display: 'inline' }}>TOOLS HUB</span>
        </button>

        <button
          onClick={onToggleVoice}
          className="hud-btn hud-btn-icon"
          title={settings.autoSpeakResponses ? 'Mute EVE Spoken Voice' : 'Enable EVE Spoken Voice'}
        >
          {settings.autoSpeakResponses ? (
            <Volume2 size={18} color="var(--accent-cyan)" />
          ) : (
            <VolumeX size={18} color="var(--text-muted)" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="hud-btn hud-btn-icon"
          title="Configure API Keys, Neural Voices & Memory"
        >
          <Settings size={18} color="var(--accent-cyan)" />
        </button>
      </div>
    </header>
  );
};
