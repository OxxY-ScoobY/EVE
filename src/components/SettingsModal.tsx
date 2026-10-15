import React, { useState, useEffect } from 'react';
import { X, Key, Volume2, ShieldAlert, Check } from 'lucide-react';
import type { EveSettings } from '../types/eve';
import { speechService, type VoiceOption } from '../services/speechService';
import { memoryService } from '../services/memoryService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EveSettings;
  onSaveSettings: (settings: EveSettings) => void;
  onClearAllHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllHistory,
}) => {
  const [localSettings, setLocalSettings] = useState<EveSettings>(settings);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    speechService.initVoices().then(() => {
      setAvailableVoices(speechService.getAvailableVoices());
    });
  }, []);

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const handleWipeData = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    memoryService.clearAllData();
    onClearAllHistory();
    setConfirmClear(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 6, 16, 0.75)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
      }}
    >
      <div
        className="hud-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(6, 14, 34, 0.95)',
          border: '1px solid var(--border-active)',
          boxShadow: '0 0 50px rgba(0, 243, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="var(--accent-cyan)" />
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '0.1em',
              }}
            >
              EVE SYSTEM CONFIGURATION
            </h2>
          </div>
          <button onClick={onClose} className="hud-btn hud-btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Gemini API Key */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Key size={14} />
              <span>GOOGLE GEMINI API KEY (OPTIONAL)</span>
            </label>
            <input
              type="password"
              placeholder="Paste Gemini API key (e.g. AIzaSy...)"
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
              style={{
                background: 'rgba(10, 22, 48, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              If left empty, EVE uses her built-in autonomous heuristic engine with zero external API calls.
            </span>
          </div>

          {/* Model Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              AI MODEL SELECTION
            </label>
            <select
              value={localSettings.modelName}
              onChange={(e) => setLocalSettings({ ...localSettings, modelName: e.target.value })}
              style={{
                background: 'rgba(10, 22, 48, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                color: 'var(--accent-cyan)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
              }}
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Next-Gen, Recommended)</option>
              <option value="gemini-3.7-flash">Gemini 3.7 Flash (Hybrid Reasoning)</option>
              <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fast)</option>
              <option value="gemini-4-argon">Gemini 4 Argon (Deep Cognition)</option>
            </select>
          </div>

          {/* Speech Engine Configuration */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '18px',
            }}
          >
            <label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Volume2 size={14} />
              <span>VOCAL SYNTHESIZER & SPEECH ENGINE</span>
            </label>

            {/* Voice dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Acoustic Voice Profile</span>
              <select
                value={localSettings.selectedVoiceName}
                onChange={(e) => setLocalSettings({ ...localSettings, selectedVoiceName: e.target.value })}
                style={{
                  background: 'rgba(10, 22, 48, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.82rem',
                }}
              >
                <option value="">Default AI Persona (Auto-Optimized Female Voice)</option>
                {availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Speed */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Cadence Speed: {localSettings.voiceSpeed}x</span>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={localSettings.voiceSpeed}
                onChange={(e) => setLocalSettings({ ...localSettings, voiceSpeed: parseFloat(e.target.value) })}
                style={{ accentColor: 'var(--accent-cyan)', width: '160px' }}
              />
            </div>

            {/* Auto Speak Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={localSettings.autoSpeakResponses}
                onChange={(e) => setLocalSettings({ ...localSettings, autoSpeakResponses: e.target.checked })}
                style={{ accentColor: 'var(--accent-cyan)', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.82rem', color: '#fff' }}>
                Automatically vocalize EVE's responses through Text-to-Speech
              </span>
            </label>
          </div>

          {/* Privacy & Data Storage */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} color="var(--accent-amber)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-amber)' }}>
                LOCAL STORAGE & MEMORY CONTROL
              </span>
            </div>
            <button
              onClick={handleWipeData}
              type="button"
              style={{
                background: confirmClear ? 'var(--accent-crimson)' : 'rgba(255, 0, 85, 0.1)',
                border: '1px solid var(--accent-crimson)',
                color: confirmClear ? '#fff' : 'var(--accent-crimson)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {confirmClear ? 'CONFIRM PURGE: Click again to wipe all chat history & tasks' : 'Purge All Local Memory & Archives'}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button onClick={onClose} className="hud-btn" style={{ background: 'transparent' }}>
            CANCEL
          </button>
          <button onClick={handleSave} className="hud-btn hud-btn-primary">
            {savedNotice ? <Check size={16} /> : null}
            <span>{savedNotice ? 'SAVED' : 'SAVE CONFIGURATION'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
