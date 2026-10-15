export type EveState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR';

export interface Message {
  id: string;
  sender: 'user' | 'eve' | 'system';
  text: string;
  timestamp: number;
  toolCall?: {
    name: string;
    params?: Record<string, any>;
    result?: any;
    status: 'pending' | 'success' | 'failed';
  };
  isStreaming?: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'code' | 'reminder' | 'research';
  createdAt: number;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  dueDate?: string;
}

export interface UserMemory {
  key: string;
  value: string;
  updatedAt: number;
}

export interface EveSettings {
  apiKey: string;
  apiProvider: 'gemini' | 'simulated';
  modelName: string;
  voiceEnabled: boolean;
  voiceSpeed: number;
  voicePitch: number;
  voiceVolume: number;
  selectedVoiceName: string;
  autoSpeakResponses: boolean;
  wakeWordEnabled: boolean;
  memoryEnabled: boolean;
  soundEffectsEnabled: boolean;
}

export interface SystemDiagnostics {
  fps: number;
  latencyMs: number;
  memoryUsage?: string;
  online: boolean;
  audioActive: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
  activeProcesses: number;
}
