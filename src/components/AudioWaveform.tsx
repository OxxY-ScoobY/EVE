import React, { useEffect, useRef } from 'react';
import { audioVisualizer } from '../services/audioVisualizer';

interface AudioWaveformProps {
  isSpeaking: boolean;
  isListening: boolean;
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isSpeaking, isListening, barCount = 28 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const width = 280;
    const height = 44;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const freqs = audioVisualizer.getFrequencyData(isSpeaking, isListening);
      const barWidth = 4;
      const gap = (width - barCount * barWidth) / (barCount - 1);
      const centerY = height / 2;

      for (let i = 0; i < barCount; i++) {
        const freqIdx = Math.floor((i / barCount) * freqs.length);
        const val = freqs[freqIdx] || 0;
        const normalized = val / 255;
        const barHeight = Math.max(3, normalized * (height - 8));

        const x = i * (barWidth + gap);
        const y = centerY - barHeight / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isListening) {
          grad.addColorStop(0, '#00ffaa');
          grad.addColorStop(1, '#0099ff');
        } else if (isSpeaking) {
          grad.addColorStop(0, '#00f3ff');
          grad.addColorStop(1, '#0066ff');
        } else {
          grad.addColorStop(0, 'rgba(0, 243, 255, 0.4)');
          grad.addColorStop(1, 'rgba(0, 102, 255, 0.1)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Rounded bars
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isSpeaking, isListening, barCount]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '6px 12px',
        background: 'rgba(6, 12, 28, 0.6)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        gap: '4px',
      }}
    >
      <canvas ref={canvasRef} />
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          color: isSpeaking ? 'var(--accent-cyan)' : isListening ? 'var(--accent-emerald)' : 'var(--text-muted)',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>{isSpeaking ? '● LIVE AUDIO OUT' : isListening ? '● CAPTURING VOICE INPUT' : 'AUDIO ENGINE READY'}</span>
      </div>
    </div>
  );
};
