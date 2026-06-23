import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LayoutDashboard, Map, Network, LogOut, Bell, Fingerprint, Waves, BarChart, User, Wrench } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ADMIN_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/twin', label: 'Digital Twin', icon: Map },
  { path: '/clusters', label: 'Problem Clusters', icon: Network },
  { path: '/dna', label: 'Complaint DNA', icon: Fingerprint },
  { path: '/impact', label: 'Ripple Impact', icon: Waves },
  { path: '/analytics', label: 'Analytics', icon: BarChart },
];

const STUDENT_ITEMS = [
  { path: '/student', label: 'Student Portal', icon: User },
];

const STAFF_ITEMS = [
  { path: '/staff', label: 'Staff Portal', icon: Wrench },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useStore();
  const location = useLocation();

  const navItems = user?.role === 'ADMIN' ? ADMIN_ITEMS : user?.role === 'STUDENT' ? STUDENT_ITEMS : STAFF_ITEMS;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Campus Intelligence
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/5 shadow-lg">
            <div>
              {user?.role === 'STUDENT' ? (
                <>
                  <p className="text-sm font-bold font-mono tracking-wider">{user?.registerNumber}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.department} • {user?.year}nd Year</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.department || user?.role}</p>
                </>
              )}
            </div>
            <button 
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl absolute top-0 w-full z-10">
          <h1 className="text-xl font-semibold capitalize">
            {location.pathname.split('/')[1] || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-white/5 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto pt-16 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
