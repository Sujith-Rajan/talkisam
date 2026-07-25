import { Clock, CheckCircle, HelpCircle } from 'lucide-react';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  userId?: { email: string; role: string };
  createdAt: string;
}

interface TicketCardProps {
  ticket: Ticket;
  onStatusChange?: (id: string, newStatus: string) => void;
  isAdmin: boolean;
}

export default function TicketCard({ ticket, onStatusChange, isAdmin }: TicketCardProps) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CLOSED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'OPEN': return <HelpCircle size={16} className="mr-1" />;
      case 'IN_PROGRESS': return <Clock size={16} className="mr-1" />;
      case 'CLOSED': return <CheckCircle size={16} className="mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-800">{ticket.title}</h3>
        <span className={`flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
          {getStatusIcon(ticket.status)}
          {ticket.status.replace('_', ' ')}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 text-sm line-clamp-3">{ticket.description}</p>
      
      <div className="flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
        <div>
          {ticket.userId && isAdmin && (
            <span className="block text-brand mb-1">By: {ticket.userId.email}</span>
          )}
          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
        
        {isAdmin && ticket.status !== 'CLOSED' && (
          <select 
            className="ml-4 bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded focus:ring-brand focus:border-brand outline-none"
            value={ticket.status}
            onChange={(e) => onStatusChange && onStatusChange(ticket._id, e.target.value)}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Close</option>
          </select>
        )}
      </div>
    </div>
  );
}
