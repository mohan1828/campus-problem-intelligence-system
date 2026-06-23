import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Zap, Users, MapPin, ServerCrash, Waves, ArrowDown, AlertTriangle, Info } from 'lucide-react';

export default function RippleImpact() {
  const { clusters } = useStore();

  const activeClusters = clusters.filter(c => c.status === 'ACTIVE');

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 scrollbar-thin">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Ripple Impact Predictor
          </h2>
          <p className="text-muted-foreground mt-1">AI forecasting of downstream service disruptions.</p>
        </div>
      </div>

      {activeClusters.length === 0 ? (
        <div className="flex-1 bg-card border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8">
          <Waves size={64} className="text-white/10 mb-4" />
          <p className="text-xl font-medium text-muted-foreground">No active ripple impacts predicted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
          {activeClusters.map((cluster) => {
            // Transparent math logic example (mocked logic based on total students)
            const cseCount = Math.floor(cluster.affectedStudentsCount * 0.4);
            const itCount = Math.floor(cluster.affectedStudentsCount * 0.3);
            const aidsCount = cluster.affectedStudentsCount - cseCount - itCount;

            return (
              <motion.div key={cluster.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h3 className="text-2xl font-bold">Impact Flow Forecast</h3>
                    <p className="text-muted-foreground text-sm mt-1">Origin: {cluster.rootCauseId}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 shadow-lg ${
                    cluster.estimatedDisruptionLevel === 'CRITICAL' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                    cluster.estimatedDisruptionLevel === 'HIGH' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                  }`}>
                    <AlertTriangle size={16} /> {cluster.estimatedDisruptionLevel} SEVERITY
                  </div>
                </div>

                <div className="flex flex-col items-center relative z-10">
                  {/* Step 1: Root */}
                  <div className="w-full max-w-sm bg-black/40 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
                    <ServerCrash className="text-red-400 mb-2" size={24} />
                    <p className="font-bold text-lg">{cluster.rootCauseId} Failure</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Root Cause Asset</p>
                  </div>
                  
                  <ArrowDown className="text-cyan-500/50 my-2 animate-bounce" size={24} />

                  {/* Step 2: Service */}
                  <div className="w-full max-w-sm bg-black/40 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
                    <Zap className="text-orange-400 mb-2" size={24} />
                    <p className="font-bold text-lg">Network Failure</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Core Service Disruption</p>
                  </div>

                  <ArrowDown className="text-cyan-500/50 my-2 animate-bounce" size={24} />

                  {/* Step 3: Dependent Assets */}
                  <div className="w-full max-w-sm bg-black/40 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
                    <MapPin className="text-yellow-400 mb-2" size={24} />
                    <p className="font-bold text-lg">Attendance & Projectors Offline</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">{cluster.affectedLocationsCount} Locations Affected</p>
                  </div>

                  <ArrowDown className="text-cyan-500/50 my-2 animate-bounce" size={24} />

                  {/* Step 4: Human Impact with Math */}
                  <div className="w-full max-w-sm bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-2xl flex flex-col items-center text-center shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                    <Users className="text-cyan-400 mb-2" size={32} />
                    <p className="font-black text-3xl text-cyan-400">{cluster.affectedStudentsCount} Students Affected</p>
                    <p className="text-xs text-cyan-200/60 uppercase tracking-wider font-bold mt-1">Classes Interrupted</p>
                    
                    <div className="w-full mt-4 bg-black/40 rounded-xl p-3 border border-white/5 text-left">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 mb-2"><Info size={12}/> Calculation Breakdown</p>
                      <div className="flex justify-between items-center text-xs text-white/80 border-b border-white/5 pb-1 mb-1">
                        <span>CSE Department:</span><span>{cseCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-white/80 border-b border-white/5 pb-1 mb-1">
                        <span>IT Department:</span><span>{itCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-white/80 border-b border-white/5 pb-1 mb-1">
                        <span>AI&DS Department:</span><span>{aidsCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-white mt-2">
                        <span>Total Active Impact:</span><span className="text-cyan-400">{cluster.affectedStudentsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
