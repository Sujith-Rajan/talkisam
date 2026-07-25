import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Dashboard from './pages/Dashboard.tsx';

import AdminTicketList from './pages/AdminTicketList.tsx';
import AdminUserList from './pages/AdminUserList.tsx';
import AdminChatView from './pages/AdminChatView.tsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Toaster position="top-right" />
        <header className="bg-brand text-white py-4 px-6 shadow-md flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider">TALKISAM</h1>
        </header>
        
        <main className="p-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/tickets" element={<AdminTicketList />} />
            <Route path="/admin/users" element={<AdminUserList />} />
            <Route path="/admin/chat/:userId" element={<AdminChatView />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
