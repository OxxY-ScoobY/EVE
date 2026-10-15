import type { EveSettings } from '../types/eve';

export const DEFAULT_SETTINGS: EveSettings = {
  apiKey: '',
  apiProvider: 'gemini',
  modelName: 'gemini-1.5-flash',
  voiceEnabled: true,
  voiceSpeed: 1.05,
  voicePitch: 1.0,
  voiceVolume: 1.0,
  selectedVoiceName: '',
  autoSpeakResponses: true,
  wakeWordEnabled: true,
  memoryEnabled: true,
  soundEffectsEnabled: true,
};

export const STORAGE_KEYS = {
  SETTINGS: 'eve_user_settings_v1',
  MESSAGES: 'eve_chat_history_v1',
  NOTES: 'eve_notes_store_v1',
  TASKS: 'eve_tasks_store_v1',
  MEMORY: 'eve_user_memory_v1',
};
