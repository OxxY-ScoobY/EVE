import React, { useEffect, useRef } from 'react';
import type { EveState } from '../types/eve';
import { audioVisualizer } from '../services/audioVisualizer';

interface HolographicCoreProps {
  state: EveState;
  isSpeaking: boolean;
  isListening: boolean;
  onClick?: () => void;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  angle: number;
  speed: number;
  color: string;
  size: number;
}

export const HolographicCore: React.FC<HolographicCoreProps> = ({ state, isSpeaking, isListening, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    let pulse = 0;

    // Retina display scaling
    const dpr = window.devicePixelRatio || 1;
    const width = 360;
    const height = 360;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize 3D orbital particle cloud
    const particleCount = 90;
    const particles: Particle[] = [];
    const colors = ['#00f3ff', '#0099ff', '#00ffaa', '#66ccff'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: 0,
        y: 0,
        z: (Math.random() - 0.5) * 160,
        baseRadius: 65 + Math.random() * 55,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2.2 + 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Frequency telemetry
      const freqs = audioVisualizer.getFrequencyData(isSpeaking, isListening);
      const avgFreq = freqs.reduce((a, b) => a + b, 0) / freqs.length;
      const audioBoost = (avgFreq / 255) * 28;

      // Pulse speed and rotation based on state
      let speedMult = 1;
      let coreColor = 'rgba(0, 243, 255, 0.2)';
      let glowColor = '#00f3ff';

      if (state === 'LISTENING') {
        speedMult = 1.4;
        coreColor = 'rgba(0, 255, 170, 0.3)';
        glowColor = '#00ffaa';
      } else if (state === 'THINKING') {
        speedMult = 3.2;
        coreColor = 'rgba(102, 51, 255, 0.35)';
        glowColor = '#a855f7';
      } else if (state === 'SPEAKING') {
        speedMult = 2.0;
        coreColor = 'rgba(0, 243, 255, 0.45)';
        glowColor = '#00f3ff';
      }

      rotation += 0.008 * speedMult;
      pulse += 0.03 * speedMult;
      const pulseScale = Math.sin(pulse) * 4 + audioBoost;

      // 1. Outer Holographic Gyro Ring 1
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.arc(0, 0, 135 + pulseScale * 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 14]);
      ctx.stroke();

      // Outer Ring Tick Marks
      ctx.setLineDash([]);
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        const x1 = Math.cos(a) * 133;
        const y1 = Math.sin(a) * 133;
        const x2 = Math.cos(a) * 139;
        const y2 = Math.sin(a) * 139;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
        ctx.stroke();
      }
      ctx.restore();

      // 2. Intermediate Counter-Rotating Segment Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-rotation * 1.5);
      ctx.beginPath();
      ctx.arc(0, 0, 108 + pulseScale * 0.4, 0, Math.PI * 1.4);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 12;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 108 + pulseScale * 0.4, Math.PI * 1.6, Math.PI * 1.9);
      ctx.strokeStyle = 'rgba(0, 102, 255, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // 3. 3D Orbital Particle Cloud
      particles.forEach((p) => {
        p.angle += p.speed * speedMult;
        const currentRadius = p.baseRadius + pulseScale * 0.6;
        const projectedX = centerX + Math.cos(p.angle) * currentRadius;
        const projectedY = centerY + Math.sin(p.angle) * (currentRadius * 0.38) + p.z * 0.4;
        const depthScale = (p.z + 160) / 320; // 0 to 1

        ctx.beginPath();
        ctx.arc(projectedX, projectedY, p.size * depthScale + (isSpeaking ? 0.8 : 0), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8 * depthScale;
        ctx.globalAlpha = Math.max(0.2, depthScale);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 4. Central Glowing Holographic Plasma Core
      const coreRadius = 48 + pulseScale;
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, coreRadius);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.35, glowColor);
      gradient.addColorStop(0.8, coreColor);
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 24;
      ctx.fill();

      // Inner Cyber Crosshair
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, isSpeaking, isListening]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      title="EVE Holographic Core Matrix"
    >
      <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />

      {/* Futuristic Orbit Label */}
      <div
        style={{
          marginTop: '-18px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          letterSpacing: '0.2em',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(6, 12, 28, 0.85)',
          padding: '4px 14px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 0 10px rgba(0, 243, 255, 0.1)',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor:
              state === 'LISTENING'
                ? 'var(--accent-emerald)'
                : state === 'THINKING'
                ? '#a855f7'
                : state === 'SPEAKING'
                ? 'var(--accent-cyan)'
                : 'rgba(0, 243, 255, 0.5)',
            boxShadow: '0 0 8px currentColor',
          }}
        />
        <span>EVE // {state}</span>
      </div>
    </div>
  );
};
