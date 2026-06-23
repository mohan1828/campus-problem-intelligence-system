import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProblemClusters from './pages/ProblemClusters';
import DigitalTwin from './pages/DigitalTwin';
import ComplaintDNA from './pages/ComplaintDNA';
import RippleImpact from './pages/RippleImpact';
import Analytics from './pages/Analytics';
import StudentPortal from './pages/StudentPortal';
import StaffPortal from './pages/StaffPortal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const { user, setUsers } = useStore();

  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(console.error);
  }, [setUsers]);

  if (!user) {
    return <Login />;
  }

  const getDefaultRoute = () => {
    if (user?.role === 'STUDENT') return '/student';
    if (user?.role === 'STAFF') return '/staff';
    return '/dashboard';
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clusters" element={<ProblemClusters />} />
        <Route path="/twin" element={<DigitalTwin />} />
        <Route path="/dna" element={<ComplaintDNA />} />
        <Route path="/impact" element={<RippleImpact />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/student" element={<StudentPortal />} />
        <Route path="/staff" element={<StaffPortal />} />
      </Routes>
    </Layout>
  );
}

export default App;
