import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import TicketCard from '../components/TicketCard.tsx';
import toast from 'react-hot-toast';

export default function AdminTicketList() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [tickets, setTickets] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const endpoint = status === 'CLOSED' ? '/tickets/archives' : '/tickets';
      const res = await api.get(endpoint);
      let data = res.data;
      if (status && status !== 'CLOSED') {
        data = data.filter((t: any) => t.status === status);
      }
      setTickets(data);
    } catch (err) {
      if ((err as any).response?.status === 401) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [status]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/tickets/${id}/status`, { status: newStatus });
      toast.success('Ticket status updated');
      fetchTickets();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to="/dashboard" className="text-gray-500 hover:text-brand flex items-center transition-colors">
          <ArrowLeft className="mr-2" size={20} /> Back to Dashboard
        </Link>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {status ? `${status} Tickets` : 'All Active Tickets'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500">
            No tickets found for this status.
          </div>
        ) : (
          tickets.map(ticket => (
            <TicketCard 
              key={ticket._id} 
              ticket={ticket} 
              isAdmin={true} 
              onStatusChange={(newStatus) => handleStatusChange(ticket._id, newStatus)} 
            />
          ))
        )}
      </div>
    </div>
  );
}
