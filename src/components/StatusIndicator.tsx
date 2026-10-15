import React from 'react';
import type { EveState } from '../types/eve';

interface StatusIndicatorProps {
  state: EveState;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state }) => {
  const getMeta = () => {
    switch (state) {
      case 'LISTENING':
        return {
          label: 'LISTENING',
          detail: 'Processing Audio Stream',
          color: '#00ffaa',
          shadow: 'rgba(0, 255, 170, 0.5)',
        };
      case 'THINKING':
        return {
          label: 'SYNTHESIZING',
          detail: 'Executing Neural Pathways',
          color: '#a855f7',
          shadow: 'rgba(168, 85, 247, 0.5)',
        };
      case 'SPEAKING':
        return {
          label: 'VOCALIZING',
          detail: 'Acoustic Synthesizer Active',
          color: '#00f3ff',
          shadow: 'rgba(0, 243, 255, 0.5)',
        };
      case 'ERROR':
        return {
          label: 'ATTENTION',
          detail: 'Diagnostic Exception',
          color: '#ff0055',
          shadow: 'rgba(255, 0, 85, 0.5)',
        };
      default:
        return {
          label: 'STANDBY',
          detail: 'All Systems Operational',
          color: '#0066ff',
          shadow: 'rgba(0, 102, 255, 0.4)',
        };
    }
  };

  const meta = getMeta();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 14px',
        background: 'rgba(8, 16, 36, 0.7)',
        border: `1px solid ${meta.color}40`,
        borderRadius: 'var(--radius-full)',
        boxShadow: `0 0 15px ${meta.shadow}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <span
        style={{
          position: 'relative',
          display: 'flex',
          width: '8px',
          height: '8px',
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: meta.color,
            opacity: 0.75,
            animation: 'micPulse 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
        <span
          style={{
            position: 'relative',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: meta.color,
          }}
        />
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: meta.color,
          }}
        >
          {meta.label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-main)',
            fontSize: '0.68rem',
            color: 'var(--text-secondary)',
          }}
        >
          {meta.detail}
        </span>
      </div>
    </div>
  );
};
