import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles } from 'lucide-react';
import { speechService } from '../services/speechService';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled,
  isListening,
  setIsListening,
}) => {
  const [input, setInput] = useState('');

  const quickPrompts = [
    'EVE, are you online?',
    'What is the weather in Tokyo?',
    'Add task: Review system architecture',
    'Help me plan my day',
    'Run system diagnostics',
    'Calculate (128 * 4.5) / 1.2',
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleToggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      const started = speechService.startListening({
        onStart: () => setIsListening(true),
        onResult: (transcript, isFinal) => {
          setInput(transcript);
          if (isFinal) {
            setIsListening(false);
            if (transcript.trim()) {
              onSendMessage(transcript.trim());
              setInput('');
            }
          }
        },
        onError: (err) => {
          console.warn('Mic error:', err);
          setIsListening(false);
        },
        onEnd: () => setIsListening(false),
      });

      if (!started) {
        setIsListening(false);
      }
    }
  };

  return (
    <div
      style={{
        padding: '16px 24px 20px',
        background: 'rgba(5, 10, 24, 0.9)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Quick Prompt Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}
      >
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(prompt)}
            disabled={disabled}
            style={{
              whiteSpace: 'nowrap',
              background: 'rgba(0, 243, 255, 0.04)',
              border: '1px solid rgba(0, 243, 255, 0.15)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              fontSize: '0.72rem',
              padding: '4px 12px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(0, 243, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.15)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'rgba(0, 243, 255, 0.04)';
            }}
          >
            <Sparkles size={11} color="var(--accent-cyan)" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(10, 22, 50, 0.7)',
          border: `1px solid ${isListening ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '6px 10px 6px 16px',
          boxShadow: isListening ? '0 0 20px rgba(0, 255, 170, 0.3)' : 'inset 0 2px 6px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.25s ease',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening to voice command... speak now' : 'Issue directive or ask EVE anything...'}
          disabled={disabled}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: '0.92rem',
            fontFamily: 'var(--font-main)',
          }}
        />

        {/* Microphone Toggle Button */}
        <button
          type="button"
          onClick={handleToggleMic}
          disabled={disabled}
          title={isListening ? 'Stop Listening' : 'Activate Voice Command'}
          className={isListening ? 'animate-mic-active' : ''}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            background: isListening
              ? 'linear-gradient(135deg, var(--accent-emerald), #0099ff)'
              : 'rgba(0, 243, 255, 0.1)',
            border: `1px solid ${isListening ? 'var(--accent-emerald)' : 'rgba(0, 243, 255, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: isListening ? '#040814' : 'var(--accent-cyan)',
          }}
        >
          {isListening ? <MicOff size={19} /> : <Mic size={19} />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          title="Send Directive"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            background: input.trim()
              ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))'
              : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${input.trim() ? 'var(--accent-cyan)' : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            color: input.trim() ? '#fff' : 'var(--text-muted)',
            boxShadow: input.trim() ? '0 0 12px rgba(0, 243, 255, 0.35)' : 'none',
          }}
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
};
