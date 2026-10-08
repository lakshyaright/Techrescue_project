import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck, ArrowRight, Building2, Laptop, Wrench } from 'lucide-react';

export const Signup: React.FC = () => {
  const { switchRole } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole(selectedRole);
    if (selectedRole === 'CLIENT') navigate('/client/dashboard');
    else if (selectedRole === 'EXPERT') navigate('/expert/dashboard');
    else if (selectedRole === 'ENGINEER') navigate('/engineer/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Create TechRescue Account
          </h2>
          <p className="text-xs text-slate-500">
            Join the verified platform for enterprise incident resolution
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          {/* Role selection tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('CLIENT')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  selectedRole === 'CLIENT'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-[11px] block">Client / Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('EXPERT')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  selectedRole === 'EXPERT'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Laptop className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-[11px] block">Remote Expert</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('ENGINEER')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  selectedRole === 'ENGINEER'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Wrench className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-[11px] block">Field Engineer</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Vikramaditya Rao"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="vikram@enterprise.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {selectedRole === 'CLIENT' ? 'Company Name' : 'Specialization / Certifications'}
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={selectedRole === 'CLIENT' ? 'e.g. FinTech Solutions' : 'e.g. CCIE / Azure Solutions Architect'}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 mt-2"
            >
              <span>Create Account & Enter Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/auth/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
