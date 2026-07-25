import { useState, useRef, useEffect } from 'react';
import { Send, Clock, CheckCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string;
  senderRole?: 'USER' | 'ADMIN';
}

interface UserChatInterfaceProps {
  tickets: Ticket[];
  onTicketCreated: () => void;
}

export default function UserChatInterface({ tickets, onTicketCreated }: UserChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on load or new ticket
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tickets]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    // Auto-generate title from the first 5 words of the message
    const title = message.split(' ').slice(0, 5).join(' ') + (message.split(' ').length > 5 ? '...' : '');

    try {
      await api.post('/tickets', { title, description: message });
      setMessage('');
      onTicketCreated();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': 
        return <span className="flex items-center text-[10px] uppercase font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full mt-2 w-fit"><HelpCircle size={10} className="mr-1" /> Open</span>;
      case 'IN_PROGRESS': 
        return <span className="flex items-center text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mt-2 w-fit"><Clock size={10} className="mr-1" /> In Progress</span>;
      case 'CLOSED': 
        return <span className="flex items-center text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-2 w-fit"><CheckCircle size={10} className="mr-1" /> Resolved</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      
      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        <div className="text-center pb-4">
          <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
            Start of Conversation
          </span>
          <p className="text-gray-500 text-sm mt-4">
            Hello! Type your request or issue below. Our admins will review it and update the status here.
          </p>
        </div>

        {tickets.map((ticket) => {
          const isUserMsg = ticket.senderRole === 'USER' || !ticket.senderRole;
          return (
            <div key={ticket._id} className={`flex flex-col ${isUserMsg ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
              {!isUserMsg && (
                <div className="flex items-center mb-1 space-x-2">
                  <span className="text-xs font-bold text-gray-500">Admin</span>
                </div>
              )}
              <div className={`max-w-[80%] p-4 shadow-sm ${isUserMsg ? 'bg-brand text-white rounded-2xl rounded-tr-sm' : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'}`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              </div>
              <div className={`flex items-center space-x-2 mt-1 ${isUserMsg ? 'justify-end w-full' : 'justify-start w-full'}`}>
                <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isUserMsg && getStatusBadge(ticket.status)}
              </div>
            </div>
          );
        })}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Message Input Box */}
      <div className="bg-white border-t border-gray-100 p-4">
        <form onSubmit={handleSend} className="flex items-end space-x-3">
          <div className="flex-1 bg-gray-100 rounded-2xl p-1 relative border border-transparent focus-within:border-brand/30 focus-within:bg-white transition-all">
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your request here..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none px-4 py-3 outline-none text-sm max-h-32 min-h-[50px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !message.trim()}
            className="bg-brand text-white p-3.5 rounded-full hover:bg-brand-dark transition-colors shadow-md disabled:opacity-50 flex-shrink-0"
          >
            <Send size={20} className={loading ? "animate-pulse" : ""} />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-400 mt-2 font-medium">
          Press <span className="font-bold">Enter</span> to send, <span className="font-bold">Shift+Enter</span> for new line.
        </p>
      </div>

    </div>
  );
}
