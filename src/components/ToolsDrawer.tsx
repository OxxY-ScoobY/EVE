import React, { useState, useEffect } from 'react';
import { X, CheckSquare, FileText, CloudSun, Activity, Plus, Trash2, Check } from 'lucide-react';
import { memoryService } from '../services/memoryService';
import { toolRegistry } from '../services/toolRegistry';
import type { TaskItem, NoteItem } from '../types/eve';

interface ToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ToolsDrawer: React.FC<ToolsDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'weather' | 'diagnostics'>('tasks');
  const [tasks, setTasks] = useState<TaskItem[]>(() => memoryService.loadTasks());
  const [notes, setNotes] = useState<NoteItem[]>(() => memoryService.loadNotes());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [diagData, setDiagData] = useState<any>(null);
  const [weatherCity, setWeatherCity] = useState('New York');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    Promise.all([
      toolRegistry.getWeather(weatherCity),
      toolRegistry.getSystemDiagnostics(),
    ]).then(([w, d]) => {
      if (isMounted) {
        setWeatherData(w.data);
        setDiagData(d.data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, weatherCity]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    memoryService.addTask(newTaskTitle.trim(), newTaskPriority);
    setNewTaskTitle('');
    setTasks(memoryService.loadTasks());
  };

  const handleToggleTask = (id: string) => {
    memoryService.toggleTask(id);
    setTasks(memoryService.loadTasks());
  };

  const handleDeleteTask = (id: string) => {
    memoryService.deleteTask(id);
    setTasks(memoryService.loadTasks());
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    memoryService.addNote(newNoteTitle.trim(), newNoteContent.trim(), 'general');
    setNewNoteTitle('');
    setNewNoteContent('');
    setNotes(memoryService.loadNotes());
  };

  const handleDeleteNote = (id: string) => {
    memoryService.deleteNote(id);
    setNotes(memoryService.loadNotes());
  };

  const handleFetchWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weatherCity.trim()) return;
    const w = await toolRegistry.getWeather(weatherCity);
    setWeatherData(w.data);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(2, 6, 16, 0.65)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: 'rgba(6, 14, 32, 0.95)',
          borderLeft: '1px solid var(--border-active)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="animate-fade-in"
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                letterSpacing: '0.1em',
              }}
            >
              ASSISTANT TOOLS HUB
            </span>
          </div>

          <button
            onClick={onClose}
            className="hud-btn hud-btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(4, 9, 22, 0.6)',
          }}
        >
          {[
            { id: 'tasks', label: 'TASKS', icon: CheckSquare },
            { id: 'notes', label: 'NOTES', icon: FileText },
            { id: 'weather', label: 'WEATHER', icon: CloudSun },
            { id: 'diagnostics', label: 'TELEMETRY', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 6px',
                  background: active ? 'rgba(0, 243, 255, 0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${active ? 'var(--accent-cyan)' : 'transparent'}`,
                  color: active ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* TAB 1: TASKS */}
          {activeTab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Catalog new directive / task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(10, 22, 48, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  style={{
                    background: 'rgba(10, 22, 48, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--accent-cyan)',
                    padding: '0 8px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <option value="low">LOW</option>
                  <option value="medium">MED</option>
                  <option value="high">HIGH</option>
                </select>
                <button type="submit" className="hud-btn" style={{ padding: '8px 12px' }}>
                  <Plus size={16} />
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: '0.85rem' }}>
                    No directives logged. Ask EVE "Add task: ..." or enter one above.
                  </div>
                ) : (
                  tasks.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: 'rgba(10, 22, 48, 0.5)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        opacity: t.completed ? 0.6 : 1,
                      }}
                    >
                      <div
                        onClick={() => handleToggleTask(t.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: `1px solid ${t.completed ? 'var(--accent-emerald)' : 'var(--border-active)'}`,
                            background: t.completed ? 'var(--accent-emerald)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {t.completed && <Check size={14} color="#000" />}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: '0.88rem',
                              textDecoration: t.completed ? 'line-through' : 'none',
                              color: t.completed ? 'var(--text-muted)' : 'var(--text-main)',
                            }}
                          >
                            {t.title}
                          </div>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.65rem',
                              color:
                                t.priority === 'high'
                                  ? 'var(--accent-crimson)'
                                  : t.priority === 'medium'
                                  ? 'var(--accent-amber)'
                                  : 'var(--accent-cyan)',
                            }}
                          >
                            [{t.priority.toUpperCase()} PRIORITY]
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NOTES */}
          {activeTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Dossier Title..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  style={{
                    background: 'rgba(10, 22, 48, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
                <textarea
                  placeholder="Record note or code snippet..."
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  style={{
                    background: 'rgba(10, 22, 48, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    resize: 'none',
                    fontFamily: 'var(--font-main)',
                  }}
                />
                <button type="submit" className="hud-btn hud-btn-primary" style={{ alignSelf: 'flex-end' }}>
                  <Plus size={16} />
                  <span>RECORD DOSSIER</span>
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notes.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '14px',
                      background: 'rgba(10, 22, 48, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
                        {n.title}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {n.content}
                    </p>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                      LOGGED: {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WEATHER */}
          {activeTab === 'weather' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <form onSubmit={handleFetchWeather} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Target location (e.g. London, Tokyo)..."
                  value={weatherCity}
                  onChange={(e) => setWeatherCity(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(10, 22, 48, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
                <button type="submit" className="hud-btn">
                  SCAN
                </button>
              </form>

              {weatherData && (
                <div
                  style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.15), rgba(0, 243, 255, 0.05))',
                    border: '1px solid var(--border-active)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <CloudSun size={48} color="var(--accent-cyan)" />
                  <div>
                    <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 700 }}>
                      {weatherData.location}
                    </h3>
                    <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {weatherData.condition}
                    </div>
                  </div>

                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>
                    {weatherData.tempC}°C{' '}
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                      ({weatherData.tempF}°F)
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      width: '100%',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '14px',
                    }}
                  >
                    <div>HUMIDITY: {weatherData.humidity}%</div>
                    <div>WINDS: {weatherData.windKm} KM/H</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SYSTEM DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(8, 18, 40, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  SYSTEM HARDWARE & RUNTIME TELEMETRY
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>NETWORK STATUS:</span>
                  <span style={{ color: 'var(--accent-emerald)' }}>ONLINE (LOW JITTER)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>JS HEAP MEMORY:</span>
                  <span style={{ color: '#fff' }}>{diagData?.memoryUsage || 'NOMINAL'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>BATTERY POWER:</span>
                  <span style={{ color: '#fff' }}>{diagData?.batteryInfo || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>VIEWPORT MATRIX:</span>
                  <span style={{ color: '#fff' }}>{diagData?.screen || '1920x1080'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ENCRYPTION / ACCESS:</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>LOCAL SANDBOX ORIGIN</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
