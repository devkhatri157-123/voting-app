'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetchCandidates();
    // Auto-refresh results every 5 seconds
    const interval = setInterval(fetchCandidates, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/candidates');
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate total votes to find percentage
  const totalVotes = candidates.reduce((sum, c) => sum + c.vote_count, 0);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-400 mb-2">Admin Real-time Analytics Panel</h1>
        <p className="text-center text-gray-400 mb-8">Total Casted Votes: <span className="text-green-400 font-bold">{totalVotes}</span></p>

        {/* Live Visual Bars (Progress Chart) */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 mb-8 space-y-6">
          <h2 className="text-xl font-bold mb-4">Live Vote Share</h2>
          {candidates.map((cand) => {
            const percentage = totalVotes > 0 ? ((cand.vote_count / totalVotes) * 100).toFixed(1) : 0;
            return (
              <div key={cand.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-blue-300">{cand.name} ({cand.party_name})</span>
                  <span className="text-yellow-400 font-bold">{cand.vote_count} Votes ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-500 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Results Table */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Detailed Results Table</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="p-3">Candidate</th>
                <th className="p-3">Party</th>
                <th className="p-3">Manifesto</th>
                <th className="p-3 text-right">Total Votes</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((cand) => (
                <tr key={cand.id} className="border-b border-gray-800">
                  <td className="p-3 font-semibold text-blue-300">{cand.name}</td>
                  <td className="p-3 text-gray-400">{cand.party_name}</td>
                  <td className="p-3 text-sm text-gray-300">{cand.manifesto}</td>
                  <td className="p-3 font-bold text-green-400 text-right">{cand.vote_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}