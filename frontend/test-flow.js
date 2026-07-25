const email = 'testuser3@test.com';
const password = 'Password@123';

async function run() {
  // 1. Register
  const regRes = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log('Register status:', regRes.status);
  
  // 2. Login
  const loginRes = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log('Login status:', loginRes.status);
  
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Cookies:', cookies);
  
  // 3. Create Ticket
  const createRes = await fetch('http://localhost:3000/tickets', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify({ title: 'Hello', description: 'Test ticket message' })
  });
  console.log('Create Ticket status:', createRes.status);
  // 4. User Fetch
  const fetchRes = await fetch('http://localhost:3000/tickets', {
    method: 'GET',
    headers: { 'Cookie': cookies || '' }
  });
  const fetchData = await fetchRes.json();
  console.log('User Fetch length:', fetchData.length);
  
  // 5. Admin Fetch
  const adminLogin = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@admin.com', password: 'Admin@123' })
  });
  const adminCookies = adminLogin.headers.get('set-cookie');
  
  const adminFetch = await fetch('http://localhost:3000/tickets', {
    method: 'GET',
    headers: { 'Cookie': adminCookies || '' }
  });
  const adminData = await adminFetch.json();
  console.log('Admin Tickets length:', adminData.length);
  console.log('Admin First Ticket:', adminData.find((t) => t.userId?._id === createData.userId || t.userId === createData.userId));
}

run();
