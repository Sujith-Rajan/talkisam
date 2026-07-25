import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, Clock, CheckCircle, HelpCircle, ArrowLeft, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function AdminChatView() {
  const { userId } = useParams();
  const [tickets, setTickets] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchChat = async () => {
    try {
      const res = await api.get(`/tickets/admin/user/${userId}`);
      setTickets(res.data);
    } catch (err) {
      if ((err as any).response?.status === 401) {
        navigate('/login');
      } else {
        toast.error('Failed to load chat');
      }
    }
  };

  useEffect(() => {
    fetchChat();
  }, [userId]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tickets]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    const title = 'Admin Reply';

    try {
      await api.post(`/tickets/admin/reply/${userId}`, { title, description: message });
      setMessage('');
      fetchChat();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      toast.success(newStatus === 'CLOSED' ? 'Message deleted and archived' : 'Status updated');
      setSelectedTicket(null);
      setIsDeleting(false);
      fetchChat();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': 
        return <span className="flex items-center text-[10px] uppercase font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full"><HelpCircle size={10} className="mr-1" /> Open</span>;
      case 'IN_PROGRESS': 
        return <span className="flex items-center text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full"><Clock size={10} className="mr-1" /> In Progress</span>;
      case 'CLOSED': 
        return <span className="flex items-center text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle size={10} className="mr-1" /> Closed</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10 shadow-sm">
        <Link to="/admin/users" className="text-gray-500 hover:text-brand flex items-center transition-colors font-medium">
          <ArrowLeft className="mr-2" size={20} /> Back to Users
        </Link>
      </div>

      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        <div className="text-center pb-4">
          <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
            Start of Conversation
          </span>
        </div>

        {tickets.map((ticket) => {
          const isAdminMsg = ticket.senderRole === 'ADMIN';
          return (
            <div key={ticket._id} className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
              <div className="flex items-center mb-1 space-x-2">
                <span className="text-xs font-bold text-gray-500">{isAdminMsg ? 'You (Admin)' : 'User'}</span>
              </div>
              
              <div 
                onClick={() => {
                  setSelectedTicket(ticket);
                  setIsDeleting(false);
                }}
                className={`max-w-[80%] p-4 shadow-sm cursor-pointer hover:opacity-90 transition-opacity ${isAdminMsg ? 'bg-brand text-white rounded-2xl rounded-tr-sm' : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'}`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              </div>
              
              <div className={`flex items-center space-x-2 mt-1 ${isAdminMsg ? 'justify-end w-full' : 'justify-start w-full'}`}>
                <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {getStatusBadge(ticket.status)}
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
              placeholder="Type your reply here..."
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
      </div>

      {/* Ticket Action Modal */}
      {selectedTicket && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Manage Message</h3>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {!isDeleting ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">Change the status of this message, or delete it to move it to the archive.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleStatusChange(selectedTicket._id, 'OPEN')}
                      className={`flex items-center justify-center py-2.5 rounded-xl border transition-all ${selectedTicket.status === 'OPEN' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 font-bold shadow-sm' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                    >
                      <HelpCircle size={16} className="mr-2" /> Open
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedTicket._id, 'IN_PROGRESS')}
                      className={`flex items-center justify-center py-2.5 rounded-xl border transition-all ${selectedTicket.status === 'IN_PROGRESS' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-sm' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                    >
                      <Clock size={16} className="mr-2" /> In Progress
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsDeleting(true)}
                    className="w-full flex items-center justify-center py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all font-medium mt-4"
                  >
                    <Trash2 size={16} className="mr-2" /> Delete Message
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-red-100 text-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={24} />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Delete this message?</h4>
                  <p className="text-sm text-gray-500 mb-6">This will mark the message as CLOSED and move it to the archives. It will no longer appear in this chat list.</p>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setIsDeleting(false)}
                      className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedTicket._id, 'CLOSED')}
                      className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
