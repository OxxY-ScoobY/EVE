import React, { useEffect, useRef } from 'react';
import type { Message } from '../types/eve';
import { Copy, Volume2, CloudSun, CheckSquare, Terminal, Check } from 'lucide-react';
import { speechService } from '../services/speechService';

interface ChatStreamProps {
  messages: Message[];
  isStreaming: boolean;
  onSelectSuggestion?: (prompt: string) => void;
}

export const ChatStream: React.FC<ChatStreamProps> = ({ messages, isStreaming }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    speechService.speak(text);
  };

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';

        return (
          <div
            key={msg.id}
            className="animate-fade-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              maxWidth: isUser ? '80%' : '88%',
            }}
          >
            {/* Sender Metadata */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
                paddingLeft: isUser ? '0' : '4px',
                paddingRight: isUser ? '4px' : '0',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: isUser ? 'var(--accent-cyan)' : 'var(--accent-blue)',
                  letterSpacing: '0.1em',
                }}
              >
                {isUser ? 'USER // AUTHORIZED' : 'EVE // INTELLIGENCE'}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  color: 'var(--text-muted)',
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Message Bubble */}
            <div
              style={{
                position: 'relative',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: isUser
                  ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.25), rgba(0, 243, 255, 0.15))'
                  : 'rgba(8, 18, 42, 0.85)',
                border: `1px solid ${isUser ? 'rgba(0, 243, 255, 0.4)' : 'rgba(0, 243, 255, 0.18)'}`,
                backdropFilter: 'blur(16px)',
                boxShadow: isUser
                  ? '0 4px 20px rgba(0, 102, 255, 0.15)'
                  : '0 4px 24px rgba(4, 10, 25, 0.5)',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {/* Tool Execution Card (if triggered) */}
              {msg.toolCall && (
                <div
                  style={{
                    marginBottom: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 243, 255, 0.05)',
                    border: '1px solid rgba(0, 243, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {msg.toolCall.name === 'get_weather' ? (
                    <CloudSun size={18} color="var(--accent-cyan)" />
                  ) : msg.toolCall.name === 'manage_tasks' ? (
                    <CheckSquare size={18} color="var(--accent-emerald)" />
                  ) : (
                    <Terminal size={18} color="var(--accent-blue)" />
                  )}
                  <div style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      EXECUTED TOOL: [{msg.toolCall.name.toUpperCase()}]
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      STATUS: {msg.toolCall.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}

              {/* Text Content */}
              <div>{msg.text}</div>

              {/* Streaming Cursor */}
              {msg.isStreaming && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '14px',
                    backgroundColor: 'var(--accent-cyan)',
                    marginLeft: '4px',
                    animation: 'micPulse 1s infinite',
                  }}
                />
              )}

              {/* Assistant Message Quick Controls */}
              {!isUser && !msg.isStreaming && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '10px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <button
                    onClick={() => handleSpeak(msg.text)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                    title="Vocalize this response"
                  >
                    <Volume2 size={13} />
                    <span>READ ALOUD</span>
                  </button>

                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: copiedId === msg.id ? 'var(--accent-emerald)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                    title="Copy response"
                  >
                    {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedId === msg.id ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
