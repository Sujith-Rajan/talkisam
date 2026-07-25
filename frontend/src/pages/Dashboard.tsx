import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Archive, LayoutDashboard, Users, Ticket, HelpCircle, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import UserChatInterface from '../components/UserChatInterface.tsx';

export default function Dashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'ADMIN';

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);

      if (isAdmin) {
        const statsRes = await api.get('/tickets/stats');
        setStats(statsRes.data);
      }
    } catch (err) {
      if ((err as any).response?.status === 401) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTickets();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="bg-brand/10 p-3 rounded-full text-brand">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isAdmin ? 'Active Tickets' : 'Support Chat'}
            </h2>
            <p className="text-gray-500 text-sm">Welcome back, {user?.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isAdmin && (
            <Link to="/admin/users" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
              <Users size={18} className="mr-2" /> Manage Users
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/tickets?status=CLOSED" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
              <Archive size={18} className="mr-2" /> Archives
            </Link>
          )}
          
          <button 
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100 font-medium"
          >
            <LogOut size={18} className="mr-1" /> Logout
          </button>
        </div>
      </div>

      {isAdmin && stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Link to="/admin/users" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:border-brand/30 transition-all cursor-pointer">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-full mb-2"><Users size={20} /></div>
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Users</span>
            <span className="text-2xl font-bold text-gray-800">{stats.totalUsers}</span>
          </Link>
          <Link to="/admin/tickets" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:border-brand/30 transition-all cursor-pointer">
            <div className="bg-gray-100 text-gray-600 p-2 rounded-full mb-2"><Ticket size={20} /></div>
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Tickets</span>
            <span className="text-2xl font-bold text-gray-800">{stats.totalTickets}</span>
          </Link>
          <Link to="/admin/tickets?status=OPEN" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer">
            <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full mb-2"><HelpCircle size={20} /></div>
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Open</span>
            <span className="text-2xl font-bold text-yellow-600">{stats.openTickets}</span>
          </Link>
          <Link to="/admin/tickets?status=IN_PROGRESS" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full mb-2"><Clock size={20} /></div>
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">In Progress</span>
            <span className="text-2xl font-bold text-blue-600">{stats.inProgressTickets}</span>
          </Link>
          <Link to="/admin/tickets?status=CLOSED" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md hover:border-green-300 transition-all cursor-pointer">
            <div className="bg-green-100 text-green-600 p-2 rounded-full mb-2"><CheckCircle size={20} /></div>
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Closed</span>
            <span className="text-2xl font-bold text-green-600">{stats.closedTickets}</span>
          </Link>
        </div>
      )}

      {!isAdmin && (
        <UserChatInterface 
          tickets={tickets} 
          onTicketCreated={fetchTickets} 
        />
      )}
    </div>
  );
}
