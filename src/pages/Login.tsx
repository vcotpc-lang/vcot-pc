import React, { useState } from 'react';
import { CheckSquare, Mail, Lock, ArrowRight, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { loginWithEmail, loginWithGoogle, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
    } catch {
      // Handled via authError state in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle(true);
    } catch {
      // Handled via authError state in context
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <CheckSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            TaskFlow
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Organize your tasks, stay focused and make progress every day.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-9 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {authError && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-xs text-rose-700 dark:text-rose-300 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{authError.message}</span>
              </div>
              {authError.isProviderDisabled && authError.consoleUrl && (
                <div className="pl-6 pt-1 space-y-1.5 text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    How to enable Email/Password in Firebase Console:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                    <li>Open your Firebase Console Authentication Providers page.</li>
                    <li>Click &ldquo;Email/Password&rdquo; and toggle &ldquo;Enable&rdquo; on.</li>
                    <li>Click &ldquo;Save&rdquo;, then try signing in again.</li>
                  </ol>
                  <a
                    href={authError.consoleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline pt-1"
                  >
                    <span>Open Firebase Auth Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleSubmitting || submitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.09.73-2.5 1.16-4.22 1.16-3.24 0-5.98-2.19-6.96-5.14H1.04v3.14C3.05 21.14 7.2 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.04 14.01c-.25-.73-.39-1.52-.39-2.34s.14-1.61.39-2.34V6.19H1.04C.38 7.51 0 9.01 0 10.67s.38 3.16 1.04 4.48l4-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.51-3.51C18.07 1.19 15.3 0 12 0 7.2 0 3.05 2.86 1.04 6.85l4 3.14c.98-2.95 3.72-5.24 6.96-5.24z"
              />
            </svg>
            <span>{googleSubmitting ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-medium">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    clearAuthError();
                    setEmail(e.target.value);
                  }}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    clearAuthError();
                    setPassword(e.target.value);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || googleSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  onSwitchToRegister();
                }}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Stay consistent · Progress, not perfection.</span>
        </div>
      </div>
    </div>
  );
};
