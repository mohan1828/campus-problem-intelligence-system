import ReactFlow, { Background, ConnectionLineType, Panel, useReactFlow } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import { useStore } from '../store/useStore';
import { useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize, Target } from 'lucide-react';
import 'reactflow/dist/style.css';

const DiagramControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <Panel position="top-left" className="bg-white rounded-xl p-2 flex flex-col gap-2 shadow-2xl ml-2 mt-2 border border-gray-200 z-50">
      <button 
        onClick={() => zoomIn({ duration: 500 })} 
        className="p-2 hover:bg-gray-100 rounded-lg flex flex-col items-center gap-1 transition-colors"
      >
        <ZoomIn className="w-5 h-5 text-gray-900" />
        <span className="text-[9px] font-bold text-gray-900">Zoom In</span>
      </button>
      <button 
        onClick={() => zoomOut({ duration: 500 })} 
        className="p-2 hover:bg-gray-100 rounded-lg flex flex-col items-center gap-1 transition-colors"
      >
        <ZoomOut className="w-5 h-5 text-gray-900" />
        <span className="text-[9px] font-bold text-gray-900">Zoom Out</span>
      </button>
      <div className="w-full h-[1px] bg-gray-200 my-1"></div>
      <button 
        onClick={() => fitView({ duration: 500, padding: 0.2 })} 
        className="p-2 hover:bg-gray-100 rounded-lg flex flex-col items-center gap-1 transition-colors"
      >
        <Maximize className="w-5 h-5 text-gray-900" />
        <span className="text-[9px] font-bold text-gray-900">Fit View</span>
      </button>
      <button 
        onClick={() => fitView({ duration: 500, padding: 0.5 })} 
        className="p-2 hover:bg-gray-100 rounded-lg flex flex-col items-center gap-1 transition-colors"
      >
        <Target className="w-5 h-5 text-gray-900" />
        <span className="text-[9px] font-bold text-gray-900">Best View</span>
      </button>
    </Panel>
  );
};

export default function ProblemClusters() {
  const { clusters } = useStore();

  const { nodes, edges } = useMemo(() => {
    let _nodes: Node[] = [];
    let _edges: Edge[] = [];

    clusters.filter(c => c.status === 'ACTIVE').forEach((cluster, i) => {
      const offsetX = i * 800;
      
      // Root Cause Node
      _nodes.push({
        id: `root-${cluster.id}`,
        position: { x: 250 + offsetX, y: 50 },
        data: { 
          label: (
            <div className="p-3 min-w-[200px] max-w-[260px] flex flex-col items-center text-center">
              <p className="text-[10px] uppercase text-orange-200 font-bold tracking-wider mb-2">Root Cause</p>
              <p className="font-bold text-xs text-white break-all leading-relaxed bg-black/30 p-2 rounded-lg w-full">{cluster.rootCauseId}</p>
              <p className="text-xs text-orange-400 mt-3 font-mono font-bold">Confidence: {cluster.confidence}%</p>
            </div>
          ) 
        },
        style: { background: 'rgba(249, 115, 22, 0.15)', border: '2px solid rgba(249, 115, 22, 0.6)', borderRadius: '12px', color: '#fff', width: 'auto' }
      });

      // Complaints & Assets
      cluster.complaints.forEach((comp: any, j: number) => {
        const xPos = 100 + (j * 260) + offsetX;

        // Dependency Asset Node
        if (comp.asset?.dependentOn?.length > 0) {
          const depAsset = comp.asset.dependentOn[0].dependentOnAsset?.id;
          if (depAsset && depAsset !== cluster.rootCauseId) {
            _nodes.push({
              id: `dep-${comp.id}`,
              position: { x: xPos, y: 180 },
              data: { 
                label: (
                  <div className="p-3 min-w-[160px] max-w-[220px] flex flex-col items-center text-center">
                    <p className="text-[10px] uppercase text-blue-200 font-bold mb-1">Dependency</p>
                    <p className="font-bold text-sm text-white break-words whitespace-normal">{depAsset}</p>
                  </div>
                ) 
              },
              style: { background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '8px', color: '#fff', width: 'auto' }
            });
            _edges.push({ id: `e-root-dep-${comp.id}`, source: `root-${cluster.id}`, target: `dep-${comp.id}`, animated: true, type: 'smoothstep', style: { stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '5 5' } });
            _edges.push({ id: `e-dep-asset-${comp.id}`, source: `dep-${comp.id}`, target: `asset-${comp.id}`, animated: true, type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 1.5, strokeDasharray: '5 5' } });
          }
        } else {
          // Direct to Asset
          _edges.push({ id: `e-root-asset-${comp.id}`, source: `root-${cluster.id}`, target: `asset-${comp.id}`, animated: true, type: 'smoothstep', style: { stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '5 5' } });
        }

        // Affected Asset Node
        _nodes.push({
          id: `asset-${comp.id}`,
          position: { x: xPos, y: 300 },
          data: { 
            label: (
              <div className="p-3 min-w-[160px] max-w-[220px] flex flex-col items-center text-center">
                <p className="text-[10px] uppercase text-emerald-200 font-bold mb-1">Affected Asset</p>
                <p className="font-bold text-sm text-white break-words whitespace-normal">{comp.asset?.name || 'Unknown'}</p>
              </div>
            ) 
          },
          style: { background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '8px', color: '#fff', width: 'auto' }
        });

        // Complaint Node
        _nodes.push({
          id: `comp-${comp.id}`,
          position: { x: xPos, y: 420 },
          data: { 
            label: (
              <div className="p-3 min-w-[180px] max-w-[240px] flex flex-col items-center text-center">
                <p className="text-[10px] uppercase text-red-200 font-bold mb-2">Complaint</p>
                <p className="font-bold text-sm text-white break-words whitespace-normal leading-snug">{comp.title}</p>
              </div>
            ) 
          },
          style: { background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', color: '#fff', width: 'auto' }
        });

        _edges.push({ id: `e-asset-comp-${comp.id}`, source: `asset-${comp.id}`, target: `comp-${comp.id}`, animated: true, type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '5 5' } });
      });
    });

    return { nodes: _nodes, edges: _edges };
  }, [clusters]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Problem Groups
          </h2>
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex">
        <div className="flex-1 relative">
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            fitView 
            fitViewOptions={{ padding: 0.2 }}
            connectionLineType={ConnectionLineType.SmoothStep}
            proOptions={{ hideAttribution: true }}
            minZoom={0.1}
            maxZoom={4}
          >
            <Background color="#ffffff" gap={20} size={1} />
            <DiagramControls />
          </ReactFlow>
        </div>
        
        {/* Intelligence Side Panel */}
        <div className="w-80 border-l border-white/10 bg-black/40 p-6 overflow-y-auto">
          <h3 className="font-bold uppercase tracking-wider text-xs text-muted-foreground mb-4">Active Clusters Breakdown</h3>
          {clusters.filter(c => c.status === 'ACTIVE').length === 0 ? (
            <p className="text-sm text-muted-foreground">No active clusters.</p>
          ) : (
            clusters.filter(c => c.status === 'ACTIVE').map(c => (
              <div key={c.id} className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl mb-4">
                <p className="text-xs font-bold text-orange-400 mb-2 break-all">ROOT: {c.rootCauseId}</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-wider">
                  <div className="bg-black/40 p-2 rounded border border-white/5">
                    <span className="text-muted-foreground block mb-1">Confidence</span>
                    <span className="text-white">{c.confidence}%</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-white/5">
                    <span className="text-muted-foreground block mb-1">Severity</span>
                    <span className="text-red-400">{c.impactSeverityScore}/10</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-white/5">
                    <span className="text-muted-foreground block mb-1">Locations</span>
                    <span className="text-white">{c.affectedLocationsCount} Affected</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-white/5">
                    <span className="text-muted-foreground block mb-1">Students</span>
                    <span className="text-red-400">{c.affectedStudentsCount} Impacted</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
