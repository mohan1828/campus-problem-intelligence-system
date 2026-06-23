import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Camera, X, CheckCircle, Cpu, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function StudentPortal() {
  const { user, locations, assets, complaints, fetchGlobalState } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('NETWORK');
  const [priority, setPriority] = useState('MEDIUM');
  const [locId, setLocId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [image, setImage] = useState('');

  // Smart Assistant State
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const myComplaints = complaints.filter(c => c.userId === user?.id);

  // Smart Assistant Debounced Trigger
  useEffect(() => {
    const text = `${title} ${desc}`.trim();
    if (text.length < 10) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setAnalyzing(true);
      try {
        const res = await fetch(`${API_URL}/api/complaints/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const data = await res.json();
        setAnalysis(data);
        if (data.category) setCategory(data.category);
        if (data.assets?.length === 1) setAssetId(data.assets[0].id);
      } finally {
        setAnalyzing(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [title, desc]);

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description: desc, category, priority,
          assetId: assetId || undefined, imageUrl: image, userId: user?.id
        })
      });
      await fetchGlobalState();
      setTitle(''); setDesc(''); setLocId(''); setAssetId(''); setImage(''); setAnalysis(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic Filtering
  const filteredAssets = assets.filter(a => {
    if (locId && a.locationId !== locId) return false;
    if (category && a.type !== category) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 flex flex-col xl:flex-row gap-8">
      {/* Submit Form Area */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-card border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          
          <h2 className="text-3xl font-bold mb-2">Submit New Report</h2>
          <p className="text-muted-foreground mb-8">Report infrastructure issues. Our Smart Assistant will help categorize your request.</p>
          
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Issue Title</label>
                <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" placeholder="e.g., WiFi slow in CSE Lab 1" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-primary transition-all font-medium" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Detailed Description</label>
                <textarea required value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe what happened, when it started, and who is affected..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-primary transition-all font-medium h-32"></textarea>
              </div>

              {/* Dynamic Dropdowns */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Category</label>
                <select value={category} onChange={e=>{setCategory(e.target.value); setAssetId('');}} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-primary transition-all font-medium appearance-none">
                  <option className="bg-background" value="INFRASTRUCTURE">Infrastructure</option>
                  <option className="bg-background" value="NETWORK">Network/IT</option>
                  <option className="bg-background" value="ELECTRICAL">Electrical</option>
                  <option className="bg-background" value="AV">Audio/Visual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Priority</label>
                <select value={priority} onChange={e=>setPriority(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-primary transition-all font-medium appearance-none">
                  <option className="bg-background" value="LOW">Low</option>
                  <option className="bg-background" value="MEDIUM">Medium</option>
                  <option className="bg-background" value="HIGH">High</option>
                  <option className="bg-background" value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Location</label>
                <select required value={locId} onChange={e=>{setLocId(e.target.value); setAssetId('');}} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-primary transition-all font-medium appearance-none">
                  <option className="bg-background" value="">Select Location</option>
                  {locations.map(l => <option className="bg-background" key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Affected Asset</label>
                <select value={assetId} onChange={e=>setAssetId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-primary transition-all font-medium appearance-none">
                  <option className="bg-background" value="">Select Asset (Filtered by Category)</option>
                  {filteredAssets.map(a => <option className="bg-background" key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Evidence Photo (Optional)</label>
                <div className="flex items-center gap-4 bg-black/20 p-4 border border-white/5 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-lg shadow-primary/10">
                    <Camera size={18} /> Upload Image
                    <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {image && (
                    <div className="relative group">
                      <img src={image} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-white/20 shadow-lg" />
                      <button type="button" onClick={() => setImage('')} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hidden group-hover:block shadow-lg"><X size={14}/></button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-500/25 mt-4 disabled:opacity-50">
              {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
            </button>
          </form>
        </div>

        {/* Smart Assistant UI */}
        <AnimatePresence>
          {(analysis || analyzing) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-500/10 border border-blue-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Cpu size={20} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-blue-100">Smart Complaint Assistant</h3>
                {analyzing && <span className="ml-auto text-xs text-blue-400 animate-pulse">Analyzing text...</span>}
              </div>

              {!analyzing && analysis && (
                <div className="grid grid-cols-2 gap-4">
                  {analysis.category && (
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Detected Category</p>
                      <p className="text-sm font-bold text-emerald-400">{analysis.category}</p>
                    </div>
                  )}
                  {analysis.potentialRootCause && (
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Potential Root Cause</p>
                      <p className="text-sm font-bold text-orange-400">{analysis.potentialRootCause}</p>
                    </div>
                  )}
                  {analysis.assets?.length > 0 && (
                    <div className="col-span-2 bg-black/30 p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Suggested Assets</p>
                      <div className="flex gap-2 flex-wrap">
                        {analysis.assets.map((a: any) => (
                          <button key={a.id} type="button" onClick={() => setAssetId(a.id)} className="text-xs bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-500/30 transition-colors">
                            {a.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.similar?.length > 0 && (
                    <div className="col-span-2 bg-black/30 p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Similar Active Complaints ({analysis.similar.length})</p>
                      <div className="space-y-2">
                        {analysis.similar.map((s: any) => (
                          <div key={s.id} className="text-xs bg-white/5 p-2 rounded border border-white/5 text-white/70 truncate">
                            • {s.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History Panel */}
      <div className="w-full xl:w-[450px] flex flex-col h-[calc(100vh-8rem)]">
        <h3 className="font-bold text-xl mb-4 px-2">My History</h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          {myComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-card border border-white/10 rounded-3xl">
              <p className="text-muted-foreground font-medium">No reports submitted yet.</p>
            </div>
          ) : (
            myComplaints.map((c: any) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all shadow-lg group" onClick={() => setSelectedComplaint(c)}>
                <div className="p-5 flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{c.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{c.id.split('-')[0]}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 shadow-inner ${
                    c.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                    c.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Complaint Details Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-white/10 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/20">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedComplaint.status === 'RESOLVED' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                      selectedComplaint.status === 'IN_PROGRESS' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                    }`}>
                      {selectedComplaint.status}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-muted-foreground">
                      {selectedComplaint.priority} PRIORITY
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedComplaint.title}</h2>
                  <p className="text-xs font-mono text-muted-foreground mt-2">ID: {selectedComplaint.id}</p>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors bg-white/5"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
                {/* Left Col: Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                    <p className="bg-black/40 p-4 rounded-2xl text-sm border border-white/5 text-white/90 leading-relaxed">{selectedComplaint.description}</p>
                  </div>

                  {selectedComplaint.asset && (
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Infrastructure Context</h4>
                      <div className="bg-black/40 border border-white/5 p-4 rounded-2xl grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">Affected Asset</p>
                          <p className="font-bold text-sm text-blue-400">{selectedComplaint.asset.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">Location</p>
                          <p className="font-bold text-sm text-white/80">{selectedComplaint.asset.location?.name || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedComplaint.imageUrl && (
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Evidence Image</h4>
                      <img src={selectedComplaint.imageUrl} alt="Evidence" className="rounded-2xl border border-white/10 max-h-64 object-cover shadow-lg w-full" />
                    </div>
                  )}

                  {selectedComplaint.status === 'RESOLVED' && (
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Resolution Notes</h4>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
                        <p className="text-sm text-emerald-100/90 leading-relaxed">{selectedComplaint.resolutionNote || 'Resolved by maintenance team.'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Col: Timeline & Intelligence */}
                <div className="w-full lg:w-80 space-y-6">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Resolution Timeline</h4>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-card text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-inner z-10">
                          <CheckCircle size={12} className={selectedComplaint.createdAt ? 'text-primary' : ''}/>
                        </div>
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-white/5 p-3 rounded-xl border border-white/5 shadow-sm">
                          <p className="text-xs font-bold">Submitted</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-card text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-inner z-10">
                          <User size={12} className={selectedComplaint.status !== 'OPEN' ? 'text-blue-400' : ''}/>
                        </div>
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-white/5 p-3 rounded-xl border border-white/5 shadow-sm">
                          <p className="text-xs font-bold">Assigned / WIP</p>
                          {selectedComplaint.status !== 'OPEN' && <p className="text-[10px] text-muted-foreground mt-0.5">Staff dispatched</p>}
                        </div>
                      </div>

                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-card text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-inner z-10">
                          <CheckCircle size={12} className={selectedComplaint.status === 'RESOLVED' ? 'text-emerald-400' : ''}/>
                        </div>
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-white/5 p-3 rounded-xl border border-white/5 shadow-sm">
                          <p className="text-xs font-bold">Resolved</p>
                          {selectedComplaint.resolvedAt && <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(selectedComplaint.resolvedAt).toLocaleString()}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedComplaint.cluster && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
                      <h4 className="text-xs font-bold text-orange-400/80 uppercase tracking-wider mb-2">Root Cause Analysis</h4>
                      <p className="text-sm text-orange-200/90 leading-relaxed mb-3">
                        This issue is part of a larger infrastructure cluster caused by <strong className="text-orange-400">{selectedComplaint.cluster.rootCauseId}</strong>.
                      </p>
                      <div className="bg-black/30 p-3 rounded-xl border border-orange-500/10">
                        <p className="text-[10px] text-orange-400/60 uppercase font-bold mb-1">Impact Radius</p>
                        <p className="text-sm font-bold text-white">{selectedComplaint.cluster.affectedStudentsCount} Students Affected</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
