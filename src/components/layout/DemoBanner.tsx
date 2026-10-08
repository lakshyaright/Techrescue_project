import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';
import { RotateCcw, Shield, Laptop, Wrench, Building2, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const DemoBanner: React.FC = () => {
  const { currentUser, switchRole, role } = useAuth();
  const { resetToDefaultData } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicPage = location.pathname.startsWith('/public') || location.pathname === '/';

  const handleRoleSelect = (targetRole: UserRole) => {
    switchRole(targetRole);
    if (targetRole === 'CLIENT') navigate('/client/dashboard');
    else if (targetRole === 'EXPERT') navigate('/expert/dashboard');
    else if (targetRole === 'ENGINEER') navigate('/engineer/dashboard');
    else if (targetRole === 'ADMIN') navigate('/admin/dashboard');
  };

  const handlePublicClick = () => {
    navigate('/');
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs px-4 py-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-400 tracking-wide uppercase text-[10px]">
            Demo Perspective
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-300 font-medium truncate">
            Active: <strong className="text-white">{currentUser.name}</strong> ({role})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleRoleSelect('CLIENT')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              role === 'CLIENT' && !isPublicPage
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Client</span>
          </button>

          <button
            onClick={() => handleRoleSelect('EXPERT')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              role === 'EXPERT' && !isPublicPage
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Expert</span>
          </button>

          <button
            onClick={() => handleRoleSelect('ENGINEER')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              role === 'ENGINEER' && !isPublicPage
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Field Eng</span>
          </button>

          <button
            onClick={() => handleRoleSelect('ADMIN')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              role === 'ADMIN' && !isPublicPage
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          <button
            onClick={handlePublicClick}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              isPublicPage
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset simulated database back to fresh default enterprise data?')) {
                resetToDefaultData();
                window.location.reload();
              }
            }}
            className="p-1 text-slate-400 hover:text-rose-400 transition-colors ml-1"
            title="Reset Sample Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
