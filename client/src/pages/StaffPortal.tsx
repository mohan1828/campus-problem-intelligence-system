import { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, PlayCircle, PauseCircle, Building2, ServerCrash, X, Users, CheckSquare, Square, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function StaffPortal() {
  const { user, complaints, fetchGlobalState } = useStore();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'HIGH_PRIORITY'>('OPEN');

  // Parse Checklist
  const [localChecklist, setLocalChecklist] = useState<any[]>([]);

  // Filter complaints for Staff (assuming all unassigned or assigned to this category)
  // For demo, we filter by category matching staff department, or just show all if generic
  let tasks = complaints;
  if (user?.department === 'Network Maintenance') tasks = complaints.filter(c => c.category === 'NETWORK');
  if (user?.department === 'Electrical Maintenance') tasks = complaints.filter(c => c.category === 'ELECTRICAL');

  const filteredTasks = tasks.filter(c => {
    if (activeTab === 'OPEN') return c.status === 'OPEN';
    if (activeTab === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
    if (activeTab === 'RESOLVED') return c.status === 'RESOLVED' && new Date(c.resolvedAt).toDateString() === new Date().toDateString();
    if (activeTab === 'HIGH_PRIORITY') return (c.priority === 'HIGH' || c.priority === 'CRITICAL') && c.status !== 'RESOLVED';
    return true;
  });

  const openResolutionModal = (c: any) => {
    setSelectedComplaint(c);
    setResolutionNote(c.resolutionNote || '');
    
    // Parse existing checklist or generate default based on category
    if (c.checklist) {
      setLocalChecklist(JSON.parse(c.checklist));
    } else {
      const defaultChecklist = c.category === 'NETWORK' ? [
        { id: 1, task: 'Check Power Supply to Asset', done: false },
        { id: 2, task: 'Verify Physical Cable Connections', done: false },
        { id: 3, task: 'Check Router/Switch Status Lights', done: false },
        { id: 4, task: 'Ping Device from Network Core', done: false },
        { id: 5, task: 'Confirm Restoration with User', done: false }
      ] : [
        { id: 1, task: 'Isolate Power Source', done: false },
        { id: 2, task: 'Inspect for Physical Damage/Burn marks', done: false },
        { id: 3, task: 'Test Voltage/Current Levels', done: false },
        { id: 4, task: 'Replace faulty components', done: false },
        { id: 5, task: 'Restore Power and Verify', done: false }
      ];
      setLocalChecklist(defaultChecklist);
    }
  };

  const toggleChecklistItem = (id: number) => {
    setLocalChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const saveProgress = async () => {
    if (!selectedComplaint) return;
    setIsUpdating(true);
    try {
      await fetch(`${API_URL}/api/complaints/${selectedComplaint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: JSON.stringify(localChecklist) })
      });
      await fetchGlobalState();
      // Don't close modal, just save
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStatus = async (id: string, status: string, notes?: string) => {
    setIsUpdating(true);
    try {
      await fetch(`${API_URL}/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNote: notes, checklist: JSON.stringify(localChecklist) })
      });
      await fetchGlobalState();
      if (status === 'RESOLVED') setSelectedComplaint(null);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Maintenance Task Dashboard
        </h2>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'HIGH_PRIORITY'].map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === t ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-white/5 hover:text-white'
            }`}
          >
            {t.replace('_', ' ')}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-xs">
              {t === 'OPEN' ? tasks.filter(c => c.status === 'OPEN').length :
               t === 'IN_PROGRESS' ? tasks.filter(c => c.status === 'IN_PROGRESS').length :
               t === 'RESOLVED' ? tasks.filter(c => c.status === 'RESOLVED' && new Date(c.resolvedAt).toDateString() === new Date().toDateString()).length :
               tasks.filter(c => (c.priority === 'HIGH' || c.priority === 'CRITICAL') && c.status !== 'RESOLVED').length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-card p-16 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center">
            <CheckCircle size={48} className="text-white/10 mb-4" />
            <p className="text-xl font-medium text-muted-foreground">No tasks in this category.</p>
          </div>
        ) : (
          filteredTasks.map((c: any) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={c.id} className="bg-card border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg hover:border-white/20 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xs text-muted-foreground">{c.id.split('-')[0]}</span>
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold shadow-inner ${
                    c.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                    c.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 
                    'bg-white/5 text-white/70 border border-white/10'
                  }`}>{c.priority} PRIORITY</span>
                </div>
                
                <p className="text-muted-foreground text-sm max-w-2xl mb-4 line-clamp-2">{c.description}</p>
                
                <div className="flex gap-4 flex-wrap">
                  {c.asset && (
                    <div className="flex items-center gap-2 text-xs font-mono bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg text-blue-300">
                      <ServerCrash size={14} /> {c.asset.name}
                    </div>
                  )}
                  {c.asset?.location && (
                    <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-white/70">
                      <Building2 size={14} /> {c.asset.location.name}
                    </div>
                  )}
                  {c.cluster && (
                    <div className="flex items-center gap-2 text-xs font-bold bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg text-orange-400">
                      <Users size={14} /> ~{c.cluster.affectedStudentsCount} Students Impacted
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0 w-full md:w-48">
                {c.status === 'OPEN' && (
                  <button disabled={isUpdating} onClick={() => updateStatus(c.id, 'IN_PROGRESS')} className="flex items-center justify-center gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                    <PlayCircle size={18} /> Start Work
                  </button>
                )}
                {c.status === 'IN_PROGRESS' && (
                  <>
                    <button onClick={() => openResolutionModal(c)} className="flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold px-4 py-3 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                      <CheckCircle size={18} /> Resolve & Checklist
                    </button>
                    <button disabled={isUpdating} onClick={() => updateStatus(c.id, 'OPEN')} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold px-4 py-2 rounded-xl transition-all border border-white/10 text-sm">
                      <PauseCircle size={16} /> Pause Work
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Resolution & Checklist Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div>
                  <h2 className="text-xl font-bold">Repair Checklist & Resolution</h2>
                  <p className="text-xs text-muted-foreground mt-1">Complaint ID: {selectedComplaint.id}</p>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-white/10 rounded-full bg-white/5 transition-colors"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Standard Operating Procedure Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Standard Operating Procedure</h4>
                    <button onClick={saveProgress} disabled={isUpdating} className="text-xs font-bold flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-white">
                      <Save size={14}/> Save Progress
                    </button>
                  </div>
                  
                  <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-white/5">
                    {localChecklist.map(item => (
                      <button 
                        key={item.id} 
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors border ${item.done ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/80'}`}
                      >
                        {item.done ? <CheckSquare size={18} className="text-emerald-500 shrink-0"/> : <Square size={18} className="text-muted-foreground shrink-0"/>}
                        <span className={`text-sm text-left font-medium ${item.done ? 'line-through opacity-70' : ''}`}>{item.task}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution Notes */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Final Resolution Notes (Required)</label>
                  <textarea 
                    value={resolutionNote} 
                    onChange={e => setResolutionNote(e.target.value)}
                    placeholder="Detail the exact cause and fix applied..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-primary h-32 font-medium transition-all"
                  ></textarea>
                </div>

              </div>

              <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-4">
                <button onClick={() => setSelectedComplaint(null)} className="px-6 py-3 font-bold text-muted-foreground hover:text-white transition-colors">Cancel</button>
                <button 
                  disabled={!resolutionNote || isUpdating || localChecklist.some(i => !i.done)}
                  onClick={() => updateStatus(selectedComplaint.id, 'RESOLVED', resolutionNote)}
                  className="bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                >
                  Mark as Resolved
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
