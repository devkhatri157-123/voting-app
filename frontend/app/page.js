'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cnic, setCnic] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch Candidates when logged in
  useEffect(() => {
    if (token) {
      fetchCandidates();
    }
  }, [token]);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/candidates');
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const url = isLogin 
        ? 'http://localhost:5000/api/auth/login' 
        : 'http://localhost:5000/api/auth/register';
      
      const payload = isLogin 
        ? { email, password } 
        : { full_name: fullName, email, cnic, password };

      const res = await axios.post(url, payload);
      
      if (isLogin) {
        setToken(res.data.token);
        setUser(res.data.user);
        setMessage('Logged in successfully!');
      } else {
        setMessage('Registered successfully! Please login now.');
        setIsLogin(true);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  const castVote = async (candidateId) => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/vote',
        { candidate_id: candidateId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Vote cast successfully! Receipt: ${res.data.receipt.substring(0, 15)}...`);
      setUser({ ...user, has_voted: true });
      fetchCandidates();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Voting failed');
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">Advanced Voting App</h1>
<div className="flex justify-between items-center mb-6">
  <h1 className="text-3xl font-bold text-blue-400">Advanced Voting App</h1>
  <a 
    href="/admin" 
    target="_blank" 
    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-xs text-gray-200 rounded font-semibold transition"
  >
    📊 Admin Panel
  </a>
</div>
        {message && (
          <div className="mb-4 p-3 bg-blue-900/50 border border-blue-500 rounded text-sm text-center">
            {message}
          </div>
        )}

        {!token ? (
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="CNIC (e.g. 12345-1234567-1)"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 transition rounded font-bold text-lg"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
            <p
              onClick={() => setIsLogin(!isLogin)}
              className="text-center text-sm text-gray-400 cursor-pointer hover:underline mt-4"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </p>
          </form>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <div>
                <h2 className="font-bold text-lg">{user?.full_name}</h2>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={() => setToken('')}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
              >
                Logout
              </button>
            </div>

            <h3 className="text-xl font-semibold mb-4 text-center">Candidates List</h3>
            {user?.has_voted ? (
              <div className="p-4 bg-green-900/40 border border-green-500 rounded text-center text-green-300 font-medium">
                ✅ You have successfully cast your vote! Thank you.
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((cand) => (
                  <div key={cand.id} className="p-4 bg-gray-900 border border-gray-700 rounded flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg text-blue-300">{cand.name}</h4>
                      <p className="text-xs text-gray-400 uppercase font-semibold">{cand.party_name}</p>
                      <p className="text-sm text-gray-300 mt-1">{cand.manifesto}</p>
                      <p className="text-xs text-yellow-400 mt-2">Current Votes: {cand.vote_count}</p>
                    </div>
                    <button
                      onClick={() => castVote(cand.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 transition rounded font-bold text-sm"
                    >
                      Vote
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}