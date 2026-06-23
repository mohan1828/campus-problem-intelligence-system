import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Network, ServerCrash, TrendingUp, Users, Zap, Bell, Clock } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { complaints, clusters, assets } = useStore();

  // Weighted Health Score Calculation
  // Critical = 10, Medium = 5, Low = 1
  const getWeight = (a: any) => {
    const t = a.type;
    const n = a.name.toLowerCase();
    if (t === 'NETWORK' || t === 'SERVER' || n.includes('attendance') || n.includes('core')) return 10;
    if (t === 'AV' || n.includes('projector') || n.includes('board') || n.includes('system')) return 5;
    return 1;
  };

  const calculateHealth = (assetList: any[]) => {
    if (assetList.length === 0) return 100;
    let maxScore = 0;
    let actualScore = 0;
    
    assetList.forEach(a => {
      const weight = getWeight(a);
      maxScore += weight;
      if (a.status === 'HEALTHY') actualScore += weight;
      else if (a.status === 'WARNING') actualScore += (weight * 0.5); // Warning retains half health
      // Critical retains 0 health
    });

    return Math.round((actualScore / maxScore) * 100);
  };

  const overallHealth = calculateHealth(assets);
  const netHealth = calculateHealth(assets.filter(a => a.type === 'NETWORK'));
  const elecHealth = calculateHealth(assets.filter(a => a.type === 'ELECTRICAL'));
  const avHealth = calculateHealth(assets.filter(a => a.type === 'AV'));

  // Metrics
  const openComplaints = complaints.filter(c => c.status === 'OPEN').length;
  const resolvedToday = complaints.filter(c => c.status === 'RESOLVED' && new Date(c.resolvedAt).toDateString() === new Date().toDateString()).length;
  const criticalAssets = assets.filter(a => a.status === 'CRITICAL').length;
  const activeClusters = clusters.filter(c => c.status === 'ACTIVE').length;
  const escalatedCount = complaints.filter(c => c.escalationLevel !== 'NONE' && c.status !== 'RESOLVED').length;

  const mockChartData = [
    { time: '08:00', vol: 2 }, { time: '10:00', vol: 5 }, { time: '12:00', vol: 3 }, 
    { time: '14:00', vol: 8 }, { time: '16:00', vol: openComplaints }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Enterprise Command Center
          </h2>
          <p className="text-muted-foreground mt-1">Real-time macro-level infrastructure intelligence.</p>
        </div>
      </div>

      {/* Top Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Health Score Widget */}
        <div className="bg-card border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Activity size={64}/></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Campus Health Score</p>
            <div className="flex items-end gap-2 mt-2">
              <span className={`text-5xl font-black ${overallHealth < 75 ? 'text-red-400' : overallHealth < 90 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {overallHealth}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] uppercase font-bold tracking-wider">
              <div className="bg-black/30 rounded p-2 border border-white/5">
                <span className="text-muted-foreground block mb-1">Network</span>
                <span className={netHealth < 80 ? 'text-red-400' : 'text-emerald-400'}>{netHealth}%</span>
              </div>
              <div className="bg-black/30 rounded p-2 border border-white/5">
                <span className="text-muted-foreground block mb-1">Electrical</span>
                <span className={elecHealth < 80 ? 'text-red-400' : 'text-emerald-400'}>{elecHealth}%</span>
              </div>
              <div className="bg-black/30 rounded p-2 border border-white/5">
                <span className="text-muted-foreground block mb-1">Audio/Visual</span>
                <span className={avHealth < 80 ? 'text-red-400' : 'text-emerald-400'}>{avHealth}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Complaints Widget */}
        <div className="bg-card border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={64}/></div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Complaints</p>
            <p className="text-5xl font-black mt-2">{openComplaints}</p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle size={14}/> {resolvedToday} Resolved Today</div>
            <div className="h-8 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <Area type="monotone" dataKey="vol" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Intelligence Widget */}
        <div className="bg-card border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Network size={64}/></div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Clusters</p>
            <p className="text-5xl font-black mt-2 text-orange-400">{activeClusters}</p>
          </div>
          <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-2 text-xs font-bold text-orange-400 flex items-center justify-center gap-2">
            <TrendingUp size={14}/> High AI Confidence
          </div>
        </div>

        {/* Risk Widget */}
        <div className="bg-card border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ServerCrash size={64}/></div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Critical Assets</p>
            <p className="text-5xl font-black mt-2 text-red-400">{criticalAssets}</p>
          </div>
          {escalatedCount > 0 ? (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-2 text-xs font-bold text-red-400 flex items-center justify-center gap-2 animate-pulse">
              <Bell size={14}/> {escalatedCount} Escalated Issues
            </div>
          ) : (
            <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-2 text-xs font-bold text-muted-foreground flex items-center justify-center gap-2">
              <CheckCircle size={14}/> No Escalations
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Activity Feed */}
        <div className="lg:col-span-2 bg-card border border-white/10 rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2"><Zap size={20} className="text-emerald-400"/> Live Activity Feed</h3>
            <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span> Live Sync</span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            <AnimatePresence>
              {complaints.slice(0, 10).map((c: any) => (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={c.id} className="bg-black/30 border border-white/5 p-4 rounded-2xl flex gap-4 hover:border-white/20 transition-all">
                  <div className={`mt-1 p-2 rounded-full h-fit shadow-inner ${
                    c.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                    c.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'
                  }`}>
                    {c.status === 'RESOLVED' ? <CheckCircle size={16}/> : c.status === 'IN_PROGRESS' ? <Activity size={16}/> : <AlertTriangle size={16}/>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm text-white/90">{c.title}</p>
                      <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1"><Clock size={10}/> {new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground">{c.priority}</span>
                      {c.asset && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300">{c.asset.name}</span>}
                      {c.escalationLevel !== 'NONE' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-1 animate-pulse"><Bell size={10}/> ESCALATED</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Col: Health Breakdown */}
        <div className="space-y-6">
          <div className="bg-card border border-white/10 rounded-3xl shadow-xl p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><ServerCrash size={20} className="text-red-400"/> High Risk Assets</h3>
            <div className="space-y-3">
              {assets.filter(a => a.status === 'CRITICAL').length === 0 ? (
                <p className="text-sm text-muted-foreground">No critical assets detected.</p>
              ) : (
                assets.filter(a => a.status === 'CRITICAL').map(a => (
                  <div key={a.id} className="bg-red-500/5 border border-red-500/20 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground">{a.location?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-red-400">FAILED</p>
                      <p className="text-[10px] font-bold text-orange-400">~{a.failureCount} Past Issues</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-card border border-white/10 rounded-3xl shadow-xl p-6">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={20} className="text-orange-400"/> Predicted Impact Alerts</h3>
             {clusters.filter(c => c.status === 'ACTIVE').length > 0 ? (
               <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                 <p className="text-xs text-orange-200 leading-relaxed font-medium">
                   AI predicts that unresolved network issues in <span className="font-bold text-orange-400">Block A</span> will disrupt exams for <span className="font-bold text-orange-400">~450 Students</span> within the next 2 hours. Escalate to maintenance head immediately.
                 </p>
               </div>
             ) : (
               <p className="text-sm text-muted-foreground">No active ripple impacts predicted.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
