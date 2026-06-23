import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ShieldAlert, Wrench, History, Cpu, CheckCircle, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ComplaintDNA() {
  const { assets } = useStore();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [dnaData, setDnaData] = useState<any>(null);

  useEffect(() => {
    if (selectedAssetId) {
      fetch(`${API_URL}/api/assets/${selectedAssetId}/dna`)
        .then(res => res.json())
        .then(data => setDnaData(data));
    }
  }, [selectedAssetId]);

  const mockTimelineData = [
    { month: 'Jan', failures: 0 }, { month: 'Feb', failures: 1 },
    { month: 'Mar', failures: 0 }, { month: 'Apr', failures: 2 },
    { month: 'May', failures: 1 }, { month: 'Jun', failures: dnaData?.failureCount || 3 },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Complaint DNA & Preventive Memory
          </h2>
          <p className="text-muted-foreground mt-1">Deep historical failure analysis and AI recommendation engine.</p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Asset List */}
        <div className="w-80 bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h3 className="font-bold flex items-center gap-2 text-lg"><Cpu size={20}/> Asset Registry</h3>
            <p className="text-xs text-muted-foreground mt-1">Select an asset to view its DNA.</p>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 scrollbar-thin">
            {assets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedAssetId === asset.id 
                    ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-inner' 
                    : 'border-white/5 hover:bg-white/10 text-muted-foreground'
                }`}
              >
                <p className="font-bold">{asset.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-mono">{asset.id}</span>
                  <span className={`w-3 h-3 rounded-full shadow-sm ${
                    asset.status === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' :
                    asset.status === 'WARNING' ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                  }`}></span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DNA Details */}
        <div className="flex-1 bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
          {!dnaData ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <History size={48} className="text-white/10 mb-4" />
              <p className="text-xl font-medium">Select an asset to sequence its DNA</p>
            </div>
          ) : (
            <div className="h-full flex flex-col relative z-10">
              <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>
              
              <div className="p-8 border-b border-white/10 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-bold">{dnaData.name}</h3>
                    <p className="text-muted-foreground font-mono mt-2">{dnaData.id} • {dnaData.type} • {dnaData.location?.name}</p>
                  </div>
                  <div className={`px-6 py-2 rounded-xl border text-sm font-bold shadow-lg flex items-center gap-2 ${
                    dnaData.status === 'CRITICAL' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                    dnaData.status === 'WARNING' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  }`}>
                    {dnaData.status === 'HEALTHY' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>} {dnaData.status}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-black/30 border border-white/10 p-6 rounded-2xl shadow-inner relative overflow-hidden group hover:border-white/20 transition-all">
                    <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">Reliability Score</p>
                    <p className={`text-3xl font-black ${dnaData.reliabilityScore < 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {dnaData.reliabilityScore}%
                    </p>
                  </div>
                  <div className="bg-black/30 border border-white/10 p-6 rounded-2xl shadow-inner relative overflow-hidden group hover:border-white/20 transition-all">
                    <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">Total Failures</p>
                    <p className="text-3xl font-black text-orange-400">{dnaData.failureCount}</p>
                  </div>
                  <div className="bg-black/30 border border-white/10 p-6 rounded-2xl shadow-inner relative overflow-hidden group hover:border-white/20 transition-all">
                    <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">Maint. Cost</p>
                    <p className="text-3xl font-black text-white">${dnaData.maintenanceCostEstimate}</p>
                  </div>
                  <div className="bg-black/30 border border-white/10 p-6 rounded-2xl shadow-inner relative overflow-hidden group hover:border-white/20 transition-all">
                    <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">Last Failure</p>
                    <p className="text-xl font-bold mt-1 text-white/80">
                      {dnaData.lastFailureDate ? new Date(dnaData.lastFailureDate).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>

                {/* AI Recommendations */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`border rounded-2xl p-6 flex items-start gap-4 shadow-lg relative overflow-hidden ${
                  dnaData.replacementRecommendation ? 'bg-red-500/10 border-red-500/30' : 
                  dnaData.reliabilityScore < 80 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
                }`}>
                  <div className={`p-3 rounded-full shrink-0 ${
                    dnaData.replacementRecommendation ? 'bg-red-500/20 text-red-500' : 
                    dnaData.reliabilityScore < 80 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    {dnaData.replacementRecommendation ? <ShieldAlert size={24} /> : dnaData.reliabilityScore < 80 ? <Wrench size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <div className="relative z-10">
                    <h4 className={`font-bold text-lg ${
                      dnaData.replacementRecommendation ? 'text-red-400' : dnaData.reliabilityScore < 80 ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      AI Recommendation: {dnaData.replacementRecommendation ? 'Replace Asset' : dnaData.reliabilityScore < 80 ? 'Repair & Maintain' : 'Monitor Only'}
                    </h4>
                    <p className="text-sm text-white/70 mt-2 leading-relaxed max-w-3xl">
                      {dnaData.replacementRecommendation ? (
                        <>This asset has failed <strong className="text-white">{dnaData.failureCount} times</strong> in recent months. The accumulated repair cost of <strong className="text-white">${dnaData.maintenanceCostEstimate}</strong> exceeds the replacement threshold. <strong>It is highly recommended to replace this asset immediately to prevent further network interruptions.</strong></>
                      ) : dnaData.reliabilityScore < 80 ? (
                        <>Asset is showing signs of degradation with a reliability score of {dnaData.reliabilityScore}%. Schedule routine maintenance to prevent failure.</>
                      ) : (
                        <>Asset is operating within optimal parameters. No action required.</>
                      )}
                    </p>
                  </div>
                </motion.div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="h-[300px] bg-black/20 p-6 rounded-2xl border border-white/5">
                    <h3 className="font-bold mb-4 text-xs uppercase tracking-wider text-muted-foreground">Failure Frequency Trend</h3>
                    <ResponsiveContainer width="100%" height="80%">
                      <AreaChart data={mockTimelineData}>
                        <defs>
                          <linearGradient id="colorFailures" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="month" stroke="#ffffff50" axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="failures" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorFailures)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <h3 className="font-bold mb-4 text-xs uppercase tracking-wider text-muted-foreground">Maintenance Logs</h3>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                      {dnaData.maintenanceLogs?.length === 0 ? (
                        <p className="text-muted-foreground text-sm p-4 bg-white/5 rounded-xl text-center">No maintenance history recorded.</p>
                      ) : (
                        dnaData.maintenanceLogs?.map((log: any) => (
                          <div key={log.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex gap-4 items-start hover:bg-white/10 transition-colors">
                            <Wrench size={16} className="text-blue-400 mt-1 shrink-0" />
                            <div>
                              <p className="font-bold text-sm text-white">{log.action}</p>
                              <p className="text-xs text-muted-foreground mt-1">{new Date(log.date).toLocaleDateString()} - {log.notes}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
