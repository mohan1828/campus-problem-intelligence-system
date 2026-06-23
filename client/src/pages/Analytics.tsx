import { useStore } from '../store/useStore';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function Analytics() {
  const { analytics } = useStore();

  if (!analytics) return <div className="p-8 text-center text-muted-foreground">Loading Analytics...</div>;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Mock data for new charts
  const resolutionData = [
    { name: 'Mon', hours: 4 }, { name: 'Tue', hours: 3.5 }, { name: 'Wed', hours: 5 },
    { name: 'Thu', hours: 2.5 }, { name: 'Fri', hours: 4.2 }, { name: 'Sat', hours: 1.5 }, { name: 'Sun', hours: 2 }
  ];

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 scrollbar-thin">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Intelligence Analytics
          </h2>
          <p className="text-muted-foreground mt-1">Deep insights into operational performance and risk distributions.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        
        {/* Dept Wise Heatmap */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-white/10 rounded-3xl p-6 shadow-2xl h-[400px]">
          <h3 className="font-bold mb-6 text-sm uppercase tracking-wider text-muted-foreground">Department Wise Issues</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={analytics.byDepartment} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" stroke="#ffffff50" />
              <YAxis dataKey="name" type="category" stroke="#ffffff50" width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} cursor={{ fill: '#ffffff05' }} />
              <Bar dataKey="value" fill="#ec4899" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Complaints By Category */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-white/10 rounded-3xl p-6 shadow-2xl h-[400px]">
          <h3 className="font-bold mb-6 text-sm uppercase tracking-wider text-muted-foreground">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={analytics.byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
              <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} cursor={{ fill: '#ffffff05' }} />
              <Bar dataKey="value" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Resolution Time Analysis */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-white/10 rounded-3xl p-6 shadow-2xl h-[400px]">
          <h3 className="font-bold mb-6 text-sm uppercase tracking-wider text-muted-foreground">Avg Resolution Time (Hours)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={resolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
              <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#1f2937' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Resolution Status Overview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-white/10 rounded-3xl p-6 shadow-2xl h-[400px]">
          <h3 className="font-bold mb-6 text-sm uppercase tracking-wider text-muted-foreground">Current Status Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={analytics.byStatus} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                {analytics.byStatus.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        
      </div>
    </div>
  );
}
