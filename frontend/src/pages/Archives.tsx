import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import TicketCard from '../components/TicketCard';

export default function Archives() {
  const [tickets, setTickets] = useState<any[]>([]);
  const navigate = useNavigate();
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'ADMIN';

  const fetchArchives = async () => {
    try {
      const res = await api.get('/tickets/archives');
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
    fetchArchives();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/tickets/${id}/status`, { status: newStatus });
      toast.success('Ticket restored successfully');
      fetchArchives(); // Refresh list 
    } catch (err) {
      console.error(err);
      toast.error('Failed to restore ticket');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <div className="bg-gray-100 p-3 rounded-full text-gray-500">
            <Archive size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Archived Tickets</h2>
            <p className="text-gray-500 text-sm">Closed issues</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400">
            <p className="text-lg">No archived tickets found.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <div key={ticket._id} className="opacity-80 hover:opacity-100 transition-opacity">
              <TicketCard 
                ticket={ticket} 
                isAdmin={isAdmin}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
