import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Building2, ServerCrash, X, ShieldAlert, Cpu, Activity, AlertTriangle, Route } from 'lucide-react';

export default function DigitalTwin() {
  const { locations, complaints } = useStore();
  const [selectedLoc, setSelectedLoc] = useState<any>(null);

  // SVG Canvas dimensions
  const SVG_W = 1000;
  const SVG_H = 1000;

  const getLocHealth = (locId: string) => {
    const active = complaints.filter(c => c.asset?.locationId === locId && c.status !== 'RESOLVED');
    if (active.some(c => c.priority === 'CRITICAL')) return 'CRITICAL';
    if (active.length > 0) return 'WARNING';
    return 'HEALTHY';
  };

  const getColor = (health: string) => {
    if (health === 'CRITICAL') return { fill: 'rgba(239, 68, 68, 0.4)', stroke: '#ef4444' }; // Red
    if (health === 'WARNING') return { fill: 'rgba(234, 179, 8, 0.4)', stroke: '#eab308' };   // Yellow
    return { fill: 'rgba(16, 185, 129, 0.4)', stroke: '#10b981' };                         // Green
  };

  // Find clusters affecting this location
  const getLocClusters = (locId: string) => {
    const active = complaints.filter(c => c.asset?.locationId === locId && c.status !== 'RESOLVED' && c.cluster);
    if (active.length === 0) return null;
    return active[0].cluster; // For demo, return first associated cluster
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Campus Digital Twin
          </h2>
          <p className="text-muted-foreground mt-1">Real-time geospatial health visualization and dependency mapping.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div><span className="text-sm">Healthy</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></div><span className="text-sm">Warning</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></div><span className="text-sm">Critical</span></div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* SVG Map Container */}
        <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full p-8 drop-shadow-2xl z-10 cursor-crosshair">
            {/* Roads & Pathways */}
            <g className="stroke-white/10 stroke-[8] fill-none stroke-linecap-round stroke-linejoin-round">
              <path d="M500,900 L500,780" /> {/* Gate to Admin */}
              <path d="M350,880 L500,880" /> {/* Security to Main Road */}
              <path d="M850,800 L500,800" /> {/* Parking to Main Road */}
              <path d="M500,780 L500,650" /> {/* Admin to Blocks */}
              <path d="M300,650 L700,650" /> {/* Block A to B to C */}
              <path d="M500,650 L500,500" /> {/* Blocks to Labs */}
              <path d="M250,500 L750,500" /> {/* CSE to ECE to Mech Labs */}
              <path d="M500,500 L500,350" /> {/* Labs to Library */}
              <path d="M500,350 L650,350" /> {/* Library to Server Room */}
              <path d="M500,350 L500,200 L150,200" /> {/* Library to Hostel */}
              <path d="M500,200 L400,150" /> {/* To Sports */}
              <path d="M500,350 L500,250 L800,250" /> {/* To Canteen */}
            </g>

            {/* Buildings */}
            {locations.map(loc => {
              const isSelected = selectedLoc?.id === loc.id;
              const health = getLocHealth(loc.id);
              const { fill, stroke } = getColor(health);

              return (
                <g key={loc.id} onClick={() => setSelectedLoc(loc)} className="cursor-pointer transition-all hover:brightness-125" style={{ transformOrigin: `${loc.x}px ${loc.y}px`, transform: isSelected ? 'scale(1.15)' : 'scale(1)' }}>
                  {health === 'CRITICAL' && (
                    <circle cx={loc.x} cy={loc.y} r="60" fill="rgba(239, 68, 68, 0.1)" className="animate-ping" style={{ transformOrigin: 'center' }} />
                  )}
                  {/* Hexagon/Building Shape */}
                  <polygon 
                    points={`${loc.x},${loc.y-40} ${loc.x+35},${loc.y-20} ${loc.x+35},${loc.y+20} ${loc.x},${loc.y+40} ${loc.x-35},${loc.y+20} ${loc.x-35},${loc.y-20}`}
                    fill={fill}
                    stroke={isSelected ? '#ffffff' : stroke}
                    strokeWidth={isSelected ? 4 : 2}
                    className="transition-all duration-300 drop-shadow-[0_0_15px_currentColor]"
                    style={{ color: stroke }}
                  />
                  {/* Building Type Icon */}
                  <foreignObject x={(loc.x || 0) - 12} y={(loc.y || 0) - 12} width="24" height="24">
                    {loc.id.includes('SERVER') ? <ServerCrash size={24} className="text-white" /> : <Building2 size={24} className="text-white" />}
                  </foreignObject>
                  {/* Label */}
                  <text x={loc.x} y={(loc.y || 0) + 55} textAnchor="middle" fill="#a1a1aa" className="text-[12px] font-bold tracking-wider" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {loc.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Intelligence Side Panel */}
        <AnimatePresence>
          {selectedLoc && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 400, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="bg-card border border-white/10 rounded-3xl shadow-2xl overflow-y-auto overflow-x-hidden flex flex-col relative">
              <div className={`p-6 border-b border-white/10 ${
                getLocHealth(selectedLoc.id) === 'CRITICAL' ? 'bg-red-500/20' : 
                getLocHealth(selectedLoc.id) === 'WARNING' ? 'bg-yellow-500/20' : 'bg-emerald-500/20'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{selectedLoc.name}</h3>
                  <button onClick={() => setSelectedLoc(null)} className="bg-black/20 p-1.5 rounded-full hover:bg-black/40 transition-colors"><X size={16}/></button>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold opacity-80 uppercase tracking-wider">
                  <Activity size={16}/> Status: {getLocHealth(selectedLoc.id)}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Risk & Intelligence Summary */}
                {getLocClusters(selectedLoc.id) && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Route size={64}/></div>
                    <h4 className="text-orange-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><AlertTriangle size={14}/> Impact Intelligence</h4>
                    <div className="space-y-2 mt-4 relative z-10">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Estimated Root Cause</p>
                        <p className="text-sm font-bold text-white">{getLocClusters(selectedLoc.id).rootCauseId}</p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Affected Students</p>
                          <p className="text-sm font-bold text-red-400">{getLocClusters(selectedLoc.id).affectedStudentsCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Severity</p>
                          <p className="text-sm font-bold text-red-400">{getLocClusters(selectedLoc.id).impactSeverityScore}/10</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assets List */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3"><Cpu size={14}/> Deployed Assets</h4>
                  <div className="space-y-2">
                    {selectedLoc.assets.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No tracked assets.</p>
                    ) : (
                      selectedLoc.assets.map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between bg-black/30 border border-white/5 p-3 rounded-xl">
                          <div>
                            <p className="text-sm font-bold">{a.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{a.type}</p>
                          </div>
                          <span className={`w-3 h-3 rounded-full ${
                            a.status === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 
                            a.status === 'WARNING' ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                          }`}></span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Active Complaints */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3"><ShieldAlert size={14}/> Active Reports</h4>
                  <div className="space-y-2">
                    {complaints.filter((c:any) => c.asset?.locationId === selectedLoc.id && c.status !== 'RESOLVED').length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No active reports.</p>
                    ) : (
                      complaints.filter((c:any) => c.asset?.locationId === selectedLoc.id && c.status !== 'RESOLVED').map((c: any) => (
                        <div key={c.id} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                          <p className="text-xs font-bold text-red-400 mb-1">{c.priority} PRIORITY</p>
                          <p className="text-sm font-medium">{c.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-2">{new Date(c.createdAt).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
