import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Plus, Archive, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import TicketCard from '../components/TicketCard';
import CreateTicketModal from '../components/CreateTicketModal';

export default function Dashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'ADMIN';

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
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

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/tickets/${id}/status`, { status: newStatus });
      toast.success('Ticket status updated');
      fetchTickets(); // Refresh list to remove closed ones
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="bg-brand/10 p-3 rounded-full text-brand">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Active Tickets</h2>
            <p className="text-gray-500 text-sm">Welcome back, {user?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link to="/archives" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Archive size={18} className="mr-2" /> Archives
          </Link>
          
          {!isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors shadow-sm font-medium"
            >
              <Plus size={18} className="mr-1" /> New Ticket
            </button>
          )}
          
          <button 
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut size={18} className="mr-1" /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400">
            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Archive size={32} className="text-gray-300" />
            </div>
            <p className="text-lg">No active tickets found.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <TicketCard 
              key={ticket._id} 
              ticket={ticket} 
              isAdmin={isAdmin}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      <CreateTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTickets}
      />
    </div>
  );
}
