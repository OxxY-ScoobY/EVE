import type { NoteItem, TaskItem, UserMemory, Message, EveSettings } from '../types/eve';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../config/defaultSettings';

export const memoryService = {
  // Settings
  loadSettings(): EveSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      let parsed: EveSettings = data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };

      // Automatically migrate deprecated model names to gemini-3.8-flash
      if (!parsed.modelName || parsed.modelName.includes('1.5') || parsed.modelName === 'gemini-1.5-flash') {
        parsed.modelName = 'gemini-3.8-flash';
      }

      // If no API key in localStorage, check environment variables (.env.local)
      if (!parsed.apiKey && (import.meta as any).env?.VITE_GEMINI_API_KEY) {
        parsed.apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
      }

      return parsed;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: EveSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save EVE settings:', e);
    }
  },

  // Notes
  loadNotes(): NoteItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!data) {
        // Sample default starter note
        const initialNotes: NoteItem[] = [
          {
            id: 'note-welcome',
            title: 'Welcome to Project EVE',
            content: 'EVE is your personal AI companion inspired by JARVIS. Speak to her or type commands to start managing tasks, research, weather, or coding queries.',
            category: 'general',
            createdAt: Date.now(),
          },
        ];
        this.saveNotes(initialNotes);
        return initialNotes;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveNotes(notes: NoteItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  },

  addNote(title: string, content: string, category: NoteItem['category'] = 'general'): NoteItem {
    const notes = this.loadNotes();
    const newNote: NoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      content,
      category,
      createdAt: Date.now(),
    };
    notes.unshift(newNote);
    this.saveNotes(notes);
    return newNote;
  },

  deleteNote(id: string): boolean {
    const notes = this.loadNotes();
    const filtered = notes.filter((n) => n.id !== id);
    this.saveNotes(filtered);
    return filtered.length !== notes.length;
  },

  // Tasks
  loadTasks(): TaskItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        const initialTasks: TaskItem[] = [
          {
            id: 'task-1',
            title: 'Verify EVE Voice Recognition and Holographic Orb',
            completed: true,
            priority: 'high',
            createdAt: Date.now() - 3600000,
          },
          {
            id: 'task-2',
            title: 'Configure optional Gemini API Key in Settings',
            completed: false,
            priority: 'medium',
            createdAt: Date.now(),
          },
        ];
        this.saveTasks(initialTasks);
        return initialTasks;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTasks(tasks: TaskItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks:', e);
    }
  },

  addTask(title: string, priority: TaskItem['priority'] = 'medium', dueDate?: string): TaskItem {
    const tasks = this.loadTasks();
    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      completed: false,
      priority,
      createdAt: Date.now(),
      dueDate,
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  toggleTask(id: string): TaskItem | null {
    const tasks = this.loadTasks();
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks(tasks);
      return task;
    }
    return null;
  },

  deleteTask(id: string): boolean {
    const tasks = this.loadTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    this.saveTasks(filtered);
    return filtered.length !== tasks.length;
  },

  // Messages / Chat History
  loadMessages(): Message[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (!data) {
        return [
          {
            id: 'msg-init',
            sender: 'eve',
            text: 'Greetings. I am EVE, your Enhanced Virtual Entity. All systems are initialized and standing by. How may I assist you today?',
            timestamp: Date.now(),
          },
        ];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveMessages(messages: Message[]): void {
    try {
      // Keep last 60 messages to preserve performance and storage
      const trimmed = messages.slice(-60);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save messages:', e);
    }
  },

  // User Memory Store
  loadMemories(): UserMemory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setMemory(key: string, value: string): void {
    const memories = this.loadMemories();
    const existing = memories.find((m) => m.key.toLowerCase() === key.toLowerCase());
    if (existing) {
      existing.value = value;
      existing.updatedAt = Date.now();
    } else {
      memories.push({ key, value, updatedAt: Date.now() });
    }
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(memories));
    } catch (e) {
      console.error('Failed to save memory:', e);
    }
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.MEMORY);
  },
};
