import React, { useState } from 'react';
import { LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { loginUser } from '../services/api';

export default function Login({ onAuthSuccess, onNavigateToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const data = await loginUser(email, password);
      setSuccessMsg(`Welcome back, ${data.user.name}!`);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(data.user);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-sky-600">
        <LogIn className="w-6 h-6" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account Login</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Sign in to analyze marine imagery and record analysis history.
      </p>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="marine.researcher@example.com"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
        Don't have an account?{' '}
        <button
          onClick={onNavigateToSignup}
          className="font-semibold text-sky-600 hover:text-sky-700 underline cursor-pointer"
        >
          Create one now
        </button>
      </div>
    </div>
  );
}
