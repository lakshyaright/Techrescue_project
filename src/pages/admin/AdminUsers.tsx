import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Search, ShieldCheck, CheckCircle2, User, Building2, Laptop, Wrench, Shield } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          User & Identity Directory
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Global directory of Enterprise Clients, Vetted Remote Experts, and Field Engineers
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user name, corporate email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Roles</option>
            <option value="CLIENT">Clients</option>
            <option value="EXPERT">Remote Experts</option>
            <option value="ENGINEER">Field Engineers</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Organization / Title</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Rate / Compensation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">{u.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono text-[11px] uppercase bg-slate-100 px-2 py-0.5 rounded-sm font-semibold text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <span className="font-medium text-slate-900 block">{u.company || 'Enterprise Account'}</span>
                    <span className="text-[11px] text-slate-500">{u.title || 'Technical Member'}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {u.location || 'India Remote'}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                    {u.hourlyRate ? `₹${u.hourlyRate}/hr` : '—'}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified & Active</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => alert(`Reviewing identity dossier for ${u.name}`)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
