import ReactFlow, { Background, Controls, ConnectionLineType } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import { useStore } from '../store/useStore';
import { useMemo } from 'react';
import 'reactflow/dist/style.css';

export default function ProblemClusters() {
  const { clusters } = useStore();

  const { nodes, edges } = useMemo(() => {
    let _nodes: Node[] = [];
    let _edges: Edge[] = [];

    clusters.filter(c => c.status === 'ACTIVE').forEach((cluster, i) => {
      const offsetX = i * 600;
      
      // Root Cause Node
      _nodes.push({
        id: `root-${cluster.id}`,
        position: { x: 250 + offsetX, y: 50 },
        data: { 
          label: (
            <div className="p-2 w-48">
              <p className="text-[10px] uppercase text-orange-200 font-bold tracking-wider mb-1">Root Cause</p>
              <p className="font-bold text-sm text-white break-words">{cluster.rootCauseId}</p>
              <p className="text-[10px] text-orange-400 mt-1 font-mono">Confidence: {cluster.confidence}%</p>
            </div>
          ) 
        },
        style: { background: 'rgba(249, 115, 22, 0.2)', border: '2px solid rgba(249, 115, 22, 0.5)', borderRadius: '12px', color: '#fff' }
      });

      // Complaints & Assets
      cluster.complaints.forEach((comp: any, j: number) => {
        // Dependency Asset Node
        if (comp.asset?.dependentOn?.length > 0) {
          const depAsset = comp.asset.dependentOn[0].dependentOnAsset?.id;
          if (depAsset && depAsset !== cluster.rootCauseId) {
            _nodes.push({
              id: `dep-${comp.id}`,
              position: { x: 100 + (j * 200) + offsetX, y: 150 },
              data: { 
                label: (
                  <div className="p-2 w-40">
                    <p className="text-[10px] uppercase text-blue-200 font-bold mb-1">Dependency</p>
                    <p className="font-bold text-xs">{depAsset}</p>
                  </div>
                ) 
              },
              style: { background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '8px', color: '#fff' }
            });
            _edges.push({ id: `e-root-dep-${comp.id}`, source: `root-${cluster.id}`, target: `dep-${comp.id}`, animated: true, style: { stroke: '#f97316' } });
            _edges.push({ id: `e-dep-asset-${comp.id}`, source: `dep-${comp.id}`, target: `asset-${comp.id}`, animated: true, style: { stroke: '#3b82f6' } });
          }
        } else {
          // Direct to Asset
          _edges.push({ id: `e-root-asset-${comp.id}`, source: `root-${cluster.id}`, target: `asset-${comp.id}`, animated: true, style: { stroke: '#f97316' } });
        }

        // Affected Asset Node
        _nodes.push({
          id: `asset-${comp.id}`,
          position: { x: 100 + (j * 200) + offsetX, y: 250 },
          data: { 
            label: (
              <div className="p-2 w-40">
                <p className="text-[10px] uppercase text-emerald-200 font-bold mb-1">Affected Asset</p>
                <p className="font-bold text-xs">{comp.asset?.name || 'Unknown'}</p>
              </div>
            ) 
          },
          style: { background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '8px', color: '#fff' }
        });

        // Complaint Node
        _nodes.push({
          id: `comp-${comp.id}`,
          position: { x: 100 + (j * 200) + offsetX, y: 350 },
          data: { 
            label: (
              <div className="p-2 w-48">
                <p className="text-[10px] uppercase text-red-200 font-bold mb-1">Complaint</p>
                <p className="font-bold text-xs truncate">{comp.title}</p>
              </div>
            ) 
          },
          style: { background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', color: '#fff' }
        });

        _edges.push({ id: `e-asset-comp-${comp.id}`, source: `asset-${comp.id}`, target: `comp-${comp.id}`, animated: true, style: { stroke: '#ef4444' } });
      });
    });

    return { nodes: _nodes, edges: _edges };
  }, [clusters]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Problem Cluster Intelligence
          </h2>
          <p className="text-muted-foreground mt-1">AI-driven root cause detection grouping related infrastructure failures.</p>
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex">
        <div className="flex-1 relative">
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            fitView 
            connectionLineType={ConnectionLineType.SmoothStep}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#ffffff" gap={20} size={1} />
            <Controls className="bg-black/50 border-white/10 fill-white" />
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
                <p className="text-xs font-bold text-orange-400 mb-2">ROOT: {c.rootCauseId}</p>
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
