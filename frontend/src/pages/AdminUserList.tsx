import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ArrowLeft, MessageSquare } from 'lucide-react';
import api from '../api/axios';

export default function AdminUserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users?page=${page}&limit=10&search=${search}`);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      if ((err as any).response?.status === 401) {
        navigate('/login');
      }
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/dashboard" className="text-gray-500 hover:text-brand flex items-center transition-colors">
          <ArrowLeft className="mr-2" size={20} /> Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Manage Users</h2>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold rounded-tl-xl">Email</th>
              <th className="p-4 font-semibold">Joined At</th>
              <th className="p-4 font-semibold text-right rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-8 text-gray-500">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{user.email}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => navigate(`/admin/chat/${user._id}`)}
                      className="inline-flex items-center text-brand bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
                    >
                      <MessageSquare size={16} className="mr-1.5" /> View Chat
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="flex items-center text-gray-600 hover:text-brand disabled:opacity-50 disabled:hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" /> Previous
          </button>
          <span className="text-gray-500 font-medium">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="flex items-center text-gray-600 hover:text-brand disabled:opacity-50 disabled:hover:text-gray-600 transition-colors"
          >
            Next <ChevronRight size={20} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
