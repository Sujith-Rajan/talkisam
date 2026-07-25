import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | string[]>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password });
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-6 text-brand">Create Account</h2>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
            {Array.isArray(error) ? (
              <ul className="list-disc pl-5">
                {error.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            ) : (
              <p className="text-center">{error}</p>
            )}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <p className="text-xs text-gray-400 mt-2">
              Must be at least 6 characters, with one uppercase, one lowercase, one number, and one special character.
            </p>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition-colors shadow-md hover:shadow-lg mt-2 disabled:opacity-50"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-500">
          Already have an account? <Link to="/login" className="text-brand hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
