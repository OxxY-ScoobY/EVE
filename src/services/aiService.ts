import type { Message, EveSettings } from '../types/eve';
import { EVE_SYSTEM_PROMPT } from '../config/systemPrompt';
import { toolRegistry } from './toolRegistry';

export interface AIResponseResult {
  text: string;
  toolCall?: {
    name: string;
    params?: Record<string, any>;
    result?: any;
    status: 'pending' | 'success' | 'failed';
  };
}

export class AIService {
  public async generateResponse(
    userPrompt: string,
    history: Message[],
    settings: EveSettings,
    onChunk?: (partialText: string) => void
  ): Promise<AIResponseResult> {
    const trimmed = userPrompt.trim();

    // 1. Check for Direct Intent & Built-in Smart Tools First
    const toolResult = await this.detectAndExecuteTools(trimmed);
    if (toolResult) {
      if (onChunk) {
        this.streamSimulatedText(toolResult.text, onChunk);
      }
      return toolResult;
    }

    // 2. Real Gemini API Integration (if API key is supplied in settings or .env)
    const activeApiKey = (settings.apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || '').trim();
    if (activeApiKey && activeApiKey.length > 5) {
      try {
        const effectiveSettings = { ...settings, apiKey: activeApiKey };
        return await this.callGeminiAPI(trimmed, history, effectiveSettings, onChunk);
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to neural matrix engine:', err);
        // Fall back gracefully with clear error context
        const fallbackText = `I encountered a momentary synchronization delay with the Gemini neural API (${err.message || 'Network Timeout'}). Re-routing query through local heuristics matrix: ${this.generateIntelligentFallback(trimmed)}`;
        return { text: fallbackText };
      }
    }

    // 3. Autonomous Local Persona Engine (Instant, Offline & Zero-Cost)
    const simulatedResponse = this.generateIntelligentFallback(trimmed);
    if (onChunk) {
      await this.streamSimulatedText(simulatedResponse, onChunk);
    }
    return { text: simulatedResponse };
  }

  // --- Tool Intent Detection & Execution ---
  private async detectAndExecuteTools(input: string): Promise<AIResponseResult | null> {
    const lower = input.toLowerCase();

    // Weather intent
    if (lower.includes('weather') || lower.includes('temperature') || lower.includes('forecast')) {
      const cityMatch = input.match(/(?:in|for|at)\s+([a-zA-Z\s]+)/i);
      const location = cityMatch ? cityMatch[1].trim() : 'Current Location';
      const res = await toolRegistry.getWeather(location);
      return {
        text: `Telemetry confirmed. ${res.output}`,
        toolCall: { name: 'get_weather', params: { location }, result: res.data, status: 'success' },
      };
    }

    // Time / Date intent
    if (lower.includes('time is it') || lower.includes('current time') || lower.includes('what day is') || lower.includes('date today')) {
      const res = toolRegistry.getTime();
      return {
        text: `Chronometer synchronized. ${res.output}`,
        toolCall: { name: 'get_time', result: res.data, status: 'success' },
      };
    }

    // Task Management: Add Task
    if (lower.startsWith('add task') || lower.startsWith('remind me to') || lower.includes('new task')) {
      const title = input.replace(/^(add task|remind me to|create task|new task)[:\s]*/i, '').trim();
      if (title) {
        const res = toolRegistry.manageTasks('add', { title });
        return {
          text: `Directives updated. ${res.output}`,
          toolCall: { name: 'manage_tasks', params: { action: 'add', title }, result: res.data, status: 'success' },
        };
      }
    }

    // Task Management: List Tasks
    if (lower.includes('my tasks') || lower.includes('show tasks') || lower.includes('list tasks') || lower.includes('todo list')) {
      const res = toolRegistry.manageTasks('list');
      const tasks = res.data || [];
      const listSummary = tasks.length === 0
        ? 'No active tasks found in the ledger. We have a clear agenda.'
        : tasks.map((t: any, i: number) => `${i + 1}. [${t.completed ? '✓' : ' '}] ${t.title} (${t.priority})`).join('\n');

      return {
        text: `Task manifest retrieved:\n\n${listSummary}`,
        toolCall: { name: 'manage_tasks', params: { action: 'list' }, result: res.data, status: 'success' },
      };
    }

    // Notes: Add Note
    if (lower.startsWith('take note') || lower.startsWith('note this') || lower.startsWith('save note')) {
      const content = input.replace(/^(take note|note this|save note|add note)[:\s]*/i, '').trim();
      if (content) {
        const title = content.length > 25 ? content.substring(0, 22) + '...' : content;
        const res = toolRegistry.manageNotes('add', { title, content });
        return {
          text: `Dossier archived. ${res.output}`,
          toolCall: { name: 'manage_notes', params: { action: 'add', title, content }, result: res.data, status: 'success' },
        };
      }
    }

    // System Diagnostics / Status
    if (lower.includes('system status') || lower.includes('diagnostics') || lower.includes('system health') || lower.includes('telemetry')) {
      const res = await toolRegistry.getSystemDiagnostics();
      return {
        text: `All core modules responding. Here is the full diagnostics telemetry:\n\n${res.output}`,
        toolCall: { name: 'system_diagnostics', result: res.data, status: 'success' },
      };
    }

    // Math & Calculations
    const mathMatch = input.match(/(?:calculate|compute|what is|solve)\s+([0-9+\-*/().%^e ]+)/i);
    if (mathMatch && mathMatch[1].trim().length > 1) {
      const res = toolRegistry.calculate(mathMatch[1]);
      return {
        text: res.output,
        toolCall: { name: 'calculate', params: { expression: mathMatch[1] }, result: res.data, status: res.success ? 'success' : 'failed' },
      };
    }

    return null;
  }

  // --- Real Google Gemini API Call ---
  private async callGeminiAPI(
    prompt: string,
    history: Message[],
    settings: EveSettings,
    onChunk?: (partialText: string) => void
  ): Promise<AIResponseResult> {
    let model = settings.modelName || 'gemini-3.8-flash';
    if (!model || model.includes('1.5') || model === 'gemini-1.5-flash') {
      model = 'gemini-3.8-flash';
    }
    const apiKey = settings.apiKey;

    const formattedHistory = history.slice(-8).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const body = {
      system_instruction: {
        parts: [{ text: EVE_SYSTEM_PROMPT }],
      },
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    };

    let url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // If initial model is not supported, automatically retry with next-gen gemini-3.8-flash
    if (!response.ok && model !== 'gemini-3.8-flash') {
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
      const retryResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (retryResponse.ok) {
        response = retryResponse;
      }
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from model.';

    if (onChunk) {
      onChunk(candidateText);
    }

    return { text: candidateText };
  }

  // --- Autonomous JARVIS-Style Heuristic Response Generator ---
  private generateIntelligentFallback(input: string): string {
    const lower = input.toLowerCase();

    // Are you online? / Identity
    if (lower.includes('are you online') || lower.includes('you there') || lower.includes('who are you') || lower.includes('hello') || lower.includes('hi eve')) {
      return 'Always ready when you need me. All systems are standing by, neural links synchronized. How shall we proceed?';
    }

    // Help me plan my day
    if (lower.includes('plan my day') || lower.includes('daily plan') || lower.includes('schedule today')) {
      return `Of course. Let's optimize your productivity matrix:

1. **Strategic Priorities**: Identify the top 2 non-negotiable milestones for today.
2. **Focus Windows**: Block 90-minute deep-work sprints for high-cognitive tasks.
3. **Buffer & Review**: Leave a 30-minute interval for communications, unexpected items, and day-end evaluation.

Shall I log your first priority into our task ledger?`;
    }

    // Coding / Architecture assistance
    if (lower.includes('code') || lower.includes('javascript') || lower.includes('react') || lower.includes('typescript') || lower.includes('function') || lower.includes('bug')) {
      return `Analyzing software architecture. I can assist in refactoring logic, writing type-safe TypeScript interfaces, establishing error boundaries, or optimizing state machines. What specific component or algorithm are we optimizing?`;
    }

    // Jarvis / Iron Man references
    if (lower.includes('jarvis') || lower.includes('iron man') || lower.includes('tony stark') || lower.includes('protocol')) {
      return `Flattered by the comparison. While JARVIS has his Malibu workshop, I am dedicated entirely to managing your personal digital command center. All protocols are green.`;
    }

    // Research / Knowledge query
    return `Query acknowledged. I am analyzing the parameters: "${input}". 

To expand on this comprehensively or connect external real-time data feeds, you may also insert your personal Gemini API key in the System Settings panel. In the meantime, local heuristics, task ledgers, voice controls, and diagnostic modules are fully at your disposal.`;
  }

  private async streamSimulatedText(fullText: string, onChunk: (text: string) => void): Promise<void> {
    const words = fullText.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      onChunk(current);
      await new Promise((r) => setTimeout(r, 22));
    }
  }
}

export const aiService = new AIService();
