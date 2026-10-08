import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, Building2, Laptop, Wrench, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const { users, loginAs } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('sonu.patel@fintechglobal.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      loginAs(user.id);
      routeByRole(user.role);
    } else {
      // Default to Sonu
      loginAs('usr-client-1');
      navigate('/client/dashboard');
    }
  };

  const handleFastLogin = (userId: string, role: string) => {
    loginAs(userId);
    routeByRole(role);
  };

  const routeByRole = (role: string) => {
    switch (role) {
      case 'CLIENT': navigate('/client/dashboard'); break;
      case 'EXPERT': navigate('/expert/dashboard'); break;
      case 'ENGINEER': navigate('/engineer/dashboard'); break;
      case 'ADMIN': navigate('/admin/dashboard'); break;
      default: navigate('/client/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In to TechRescue
          </h2>
          <p className="text-xs text-slate-500">
            Access your enterprise incident console, expert job board, or dispatcher
          </p>
        </div>

        {/* 1-Click Instant Demo Profiles Box */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
              1-Click Instant Demo Login:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleFastLogin('usr-client-1', 'CLIENT')}
              className="p-2.5 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-left transition-colors shadow-2xs group"
            >
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>Client</span>
              </div>
              <span className="text-[11px] text-slate-600 block truncate">Sonu Patel (VP IT)</span>
            </button>

            <button
              onClick={() => handleFastLogin('usr-expert-1', 'EXPERT')}
              className="p-2.5 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-left transition-colors shadow-2xs group"
            >
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
                <Laptop className="w-3.5 h-3.5 shrink-0" />
                <span>Expert</span>
              </div>
              <span className="text-[11px] text-slate-600 block truncate">Rahul S. (Architect)</span>
            </button>

            <button
              onClick={() => handleFastLogin('usr-eng-1', 'ENGINEER')}
              className="p-2.5 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-left transition-colors shadow-2xs group"
            >
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                <span>Field Eng</span>
              </div>
              <span className="text-[11px] text-slate-600 block truncate">Rajesh K. (On-site)</span>
            </button>

            <button
              onClick={() => handleFastLogin('usr-admin-1', 'ADMIN')}
              className="p-2.5 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-left transition-colors shadow-2xs group"
            >
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>Admin</span>
              </div>
              <span className="text-[11px] text-slate-600 block truncate">Lakshya (SuperAdmin)</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link to="/auth/forgot-password" className="text-[11px] text-blue-600 hover:underline">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Sign In with Credentials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an enterprise account?{' '}
            <Link to="/auth/signup" className="text-blue-600 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
