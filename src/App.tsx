import React, { useState, useEffect, useCallback } from 'react';
import type { EveState, Message, EveSettings } from './types/eve';
import { memoryService } from './services/memoryService';
import { aiService } from './services/aiService';
import { speechService } from './services/speechService';
import { audioVisualizer } from './services/audioVisualizer';
import { TelemetryHUD } from './components/TelemetryHUD';
import { HolographicCore } from './components/HolographicCore';
import { AudioWaveform } from './components/AudioWaveform';
import { StatusIndicator } from './components/StatusIndicator';
import { ChatStream } from './components/ChatStream';
import { ChatInput } from './components/ChatInput';
import { ToolsDrawer } from './components/ToolsDrawer';
import { SettingsModal } from './components/SettingsModal';
import { Terminal, Shield, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => memoryService.loadMessages());
  const [settings, setSettings] = useState<EveSettings>(() => memoryService.loadSettings());
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [toolsOpen, setToolsOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // Derived state directly from active subcomponents (zero cascading renders)
  const eveState: EveState = isListening
    ? 'LISTENING'
    : isSpeaking
    ? 'SPEAKING'
    : isStreaming
    ? 'THINKING'
    : 'IDLE';

  // Play subtle high-tech initialization sound on mount
  useEffect(() => {
    if (settings.soundEffectsEnabled) {
      const timer = setTimeout(() => {
        audioVisualizer.playChime('startup');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [settings.soundEffectsEnabled]);

  // Handle sending message
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // 1. Add User Message
      const userMsg: Message = {
        id: `msg-${Date.now()}-user`,
        sender: 'user',
        text,
        timestamp: Date.now(),
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      memoryService.saveMessages(updatedHistory);

      // 2. Set State to Thinking
      setIsStreaming(true);

      // Temporary placeholder message for streaming response
      const eveTempId = `msg-${Date.now()}-eve`;
      const eveTempMsg: Message = {
        id: eveTempId,
        sender: 'eve',
        text: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, eveTempMsg]);

      try {
        // 3. AI Brain execution
        const responseResult = await aiService.generateResponse(
          text,
          updatedHistory,
          settings,
          (partialText) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === eveTempId ? { ...m, text: partialText } : m))
            );
          }
        );

        // 4. Update finalized message
        const finalizedMsg: Message = {
          id: eveTempId,
          sender: 'eve',
          text: responseResult.text,
          timestamp: Date.now(),
          toolCall: responseResult.toolCall,
          isStreaming: false,
        };

        const finalHistory = [...updatedHistory, finalizedMsg];
        setMessages(finalHistory);
        memoryService.saveMessages(finalHistory);
        setIsStreaming(false);

        // 5. Vocalize response if auto-speak enabled
        if (settings.autoSpeakResponses) {
          setIsSpeaking(true);
          speechService.speak(responseResult.text, {
            speed: settings.voiceSpeed,
            pitch: settings.voicePitch,
            voiceName: settings.selectedVoiceName,
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          });
        }
      } catch (err: any) {
        setIsStreaming(false);
        const errorMsg: Message = {
          id: eveTempId,
          sender: 'eve',
          text: `Neural exception detected: ${err.message || 'System error'}. Telemetry logged.`,
          timestamp: Date.now(),
          isStreaming: false,
        };
        const errorHistory = [...updatedHistory, errorMsg];
        setMessages(errorHistory);
        memoryService.saveMessages(errorHistory);
      }
    },
    [messages, settings]
  );

  const handleToggleVoice = () => {
    const updated = { ...settings, autoSpeakResponses: !settings.autoSpeakResponses };
    setSettings(updated);
    memoryService.saveSettings(updated);
    if (!updated.autoSpeakResponses) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    }
  };

  const handleSaveSettings = (newSettings: EveSettings) => {
    setSettings(newSettings);
    memoryService.saveSettings(newSettings);
  };

  const handleClearAllHistory = () => {
    setMessages([
      {
        id: 'msg-reset',
        sender: 'eve',
        text: 'All memory banks, tasks, and historical session logs have been purged. Clean slate initialized. Ready for new directives.',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      {/* 1. Top HUD Header */}
      <TelemetryHUD
        settings={settings}
        onToggleVoice={handleToggleVoice}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleTools={() => setToolsOpen(!toolsOpen)}
        toolsOpen={toolsOpen}
      />

      {/* 2. Main Stage (Split View: Central AI Core & Conversation Terminal) */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 42%) 1fr',
          overflow: 'hidden',
          position: 'relative',
        }}
        className="hud-main-grid"
      >
        {/* Left Stage: Holographic Core & Telemetry */}
        <section
          style={{
            borderRight: '1px solid var(--border-subtle)',
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 102, 255, 0.08) 0%, transparent 70%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 20px',
            overflowY: 'auto',
          }}
        >
          {/* Status Indicator at top */}
          <div style={{ alignSelf: 'center' }}>
            <StatusIndicator state={eveState} />
          </div>

          {/* Central Animated Orb */}
          <div style={{ margin: 'auto 0' }}>
            <HolographicCore
              state={eveState}
              isSpeaking={isSpeaking}
              isListening={isListening}
              onClick={() => {
                if (isSpeaking) {
                  speechService.stopSpeaking();
                  setIsSpeaking(false);
                } else if (!isListening) {
                  audioVisualizer.playChime('listen');
                }
              }}
            />
          </div>

          {/* Bottom Waveform & Telemetry readout */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <AudioWaveform isSpeaking={isSpeaking} isListening={isListening} />

            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(0, 243, 255, 0.05)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Zap size={11} color="var(--accent-cyan)" />
                NEURAL CORE READY
              </span>

              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(0, 255, 170, 0.05)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 255, 170, 0.2)',
                }}
              >
                <Shield size={11} color="var(--accent-emerald)" />
                AES-256 SANDBOX
              </span>

              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(0, 102, 255, 0.05)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 102, 255, 0.2)',
                }}
              >
                <Terminal size={11} color="var(--accent-blue)" />
                TOOLS LINKED (7)
              </span>
            </div>
          </div>
        </section>

        {/* Right Stage: Cinematic Conversation Stream & Input */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            background: 'rgba(4, 9, 22, 0.4)',
          }}
        >
          <ChatStream messages={messages} isStreaming={isStreaming} />
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isStreaming}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        </section>
      </main>

      {/* 3. Sliding Assistant Tools Drawer */}
      <ToolsDrawer isOpen={toolsOpen} onClose={() => setToolsOpen(false)} />

      {/* 4. Configuration & Settings Modal */}
      <SettingsModal
        key={settingsOpen ? 'open' : 'closed'}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearAllHistory={handleClearAllHistory}
      />
    </div>
  );
};

export default App;
