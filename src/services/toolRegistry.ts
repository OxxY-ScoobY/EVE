import { memoryService } from './memoryService';

export interface ToolExecutionResult {
  toolName: string;
  output: string;
  data?: any;
  success: boolean;
}

export const toolRegistry = {
  // 1. Weather Information
  async getWeather(location: string = 'Current Location'): Promise<ToolExecutionResult> {
    const loc = location.trim() || 'New York';
    // Realistic simulation with atmospheric data
    const conditions = ['Clear skies', 'Partly cloudy', 'Electric storm', 'Mild breeze', 'Scattered showers'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const tempC = Math.floor(Math.random() * 15) + 18; // 18-32°C
    const tempF = Math.round((tempC * 9) / 5 + 32);
    const humidity = Math.floor(Math.random() * 30) + 45;
    const windKm = (Math.random() * 15 + 5).toFixed(1);

    return {
      toolName: 'get_weather',
      success: true,
      output: `Atmospheric telemetry for ${loc}: ${condition}, ${tempC}°C (${tempF}°F). Humidity at ${humidity}%, winds ${windKm} km/h. Optimal operating conditions.`,
      data: { location: loc, condition, tempC, tempF, humidity, windKm },
    };
  },

  // 2. Current Time & World Clock
  getTime(timezone?: string): ToolExecutionResult {
    const now = new Date();
    try {
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        ...(timezone ? { timeZone: timezone } : {}),
      };
      const timeStr = now.toLocaleTimeString([], options);
      const dateStr = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...(timezone ? { timeZone: timezone } : {}) });
      const utcStr = now.toUTCString();

      return {
        toolName: 'get_time',
        success: true,
        output: `Chronometer synchronized: ${timeStr} on ${dateStr}.${timezone ? ` Timezone: ${timezone}.` : ''} System UTC: ${utcStr}.`,
        data: { localTime: timeStr, localDate: dateStr, utc: utcStr, timezone },
      };
    } catch {
      return {
        toolName: 'get_time',
        success: false,
        output: `Invalid timezone identifier: ${timezone}. Standard UTC is ${now.toUTCString()}.`,
      };
    }
  },

  // 3. Task Management
  manageTasks(action: 'list' | 'add' | 'toggle' | 'delete', params?: { title?: string; id?: string; priority?: 'low' | 'medium' | 'high' }): ToolExecutionResult {
    if (action === 'add' && params?.title) {
      const task = memoryService.addTask(params.title, params.priority || 'medium');
      return {
        toolName: 'manage_tasks',
        success: true,
        output: `Task successfully cataloged: "${task.title}" with [${task.priority.toUpperCase()}] priority.`,
        data: task,
      };
    }

    if (action === 'toggle' && params?.id) {
      const task = memoryService.toggleTask(params.id);
      if (task) {
        return {
          toolName: 'manage_tasks',
          success: true,
          output: `Task status updated: "${task.title}" is now marked as ${task.completed ? 'COMPLETED' : 'PENDING'}.`,
          data: task,
        };
      }
      return { toolName: 'manage_tasks', success: false, output: `Task ID ${params.id} not found in database.` };
    }

    if (action === 'delete' && params?.id) {
      const removed = memoryService.deleteTask(params.id);
      return {
        toolName: 'manage_tasks',
        success: removed,
        output: removed ? `Task ${params.id} permanently purged.` : `Task ${params.id} was not located.`,
      };
    }

    // Default: list tasks
    const tasks = memoryService.loadTasks();
    const pending = tasks.filter((t) => !t.completed).length;
    return {
      toolName: 'manage_tasks',
      success: true,
      output: `You currently have ${tasks.length} total tasks (${pending} pending, ${tasks.length - pending} completed).`,
      data: tasks,
    };
  },

  // 4. Notes & Snippets
  manageNotes(action: 'list' | 'add' | 'delete', params?: { title?: string; content?: string; id?: string; category?: any }): ToolExecutionResult {
    if (action === 'add' && params?.title && params?.content) {
      const note = memoryService.addNote(params.title, params.content, params.category || 'general');
      return {
        toolName: 'manage_notes',
        success: true,
        output: `New dossier recorded: "${note.title}". Saved securely to local database.`,
        data: note,
      };
    }

    if (action === 'delete' && params?.id) {
      const removed = memoryService.deleteNote(params.id);
      return {
        toolName: 'manage_notes',
        success: removed,
        output: removed ? `Dossier ${params.id} purged.` : `Note could not be located.`,
      };
    }

    const notes = memoryService.loadNotes();
    return {
      toolName: 'manage_notes',
      success: true,
      output: `Retrieved ${notes.length} saved dossiers from memory archives.`,
      data: notes,
    };
  },

  // 5. Calculator & Math
  calculate(expression: string): ToolExecutionResult {
    try {
      // Clean and sanitize mathematical expressions
      const sanitized = expression.replace(/[^0-9+\-*/().%^e ]/gi, '');
      if (!sanitized) {
        return { toolName: 'calculate', success: false, output: 'Invalid numerical expression.' };
      }
      // Safe evaluation using Function
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();
      return {
        toolName: 'calculate',
        success: true,
        output: `Calculation telemetry: ${expression} = ${result}`,
        data: { expression, result },
      };
    } catch {
      return { toolName: 'calculate', success: false, output: `Unable to compute expression: "${expression}"` };
    }
  },

  // 6. Web Search & Research
  async searchWeb(query: string): Promise<ToolExecutionResult> {
    const cleanQuery = query.trim();
    // Simulate smart synthesis of real-time web topics
    return {
      toolName: 'web_search',
      success: true,
      output: `Research query processed for "${cleanQuery}". Synthesis: Quantum computing and neural architecture continue rapid evolution with Gemini multimodal updates, agentic autonomous tool frameworks, and sub-second voice synthesis pipelines leading the industry benchmark.`,
      data: { query: cleanQuery, source: 'Global Neural Data Stream' },
    };
  },

  // 7. System Diagnostics
  async getSystemDiagnostics(): Promise<ToolExecutionResult> {
    const isOnline = navigator.onLine;
    const memory = (performance as any).memory;
    const memoryUsage = memory ? `${Math.round(memory.usedJSHeapSize / 1048576)} MB / ${Math.round(memory.totalJSHeapSize / 1048576)} MB` : 'Browser sandboxed';
    let batteryInfo = 'N/A';

    try {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        batteryInfo = `${Math.round(battery.level * 100)}% (${battery.charging ? 'Charging' : 'Discharging'})`;
      }
    } catch {
      // Battery API optional
    }

    return {
      toolName: 'system_diagnostics',
      success: true,
      output: `System Telemetry Report:
- Status: ${isOnline ? 'Online / Nominal' : 'Offline / Standalone Mode'}
- Heap Memory: ${memoryUsage}
- Battery Power: ${batteryInfo}
- Viewport Matrix: ${window.innerWidth}x${window.innerHeight}px
- Platform: ${navigator.userAgent.includes('Windows') ? 'Windows NT' : navigator.platform}
- Hardware Concurrency: ${navigator.hardwareConcurrency || 8} logical cores.`,
      data: { isOnline, memoryUsage, batteryInfo, screen: `${window.innerWidth}x${window.innerHeight}` },
    };
  },
};
