import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { AppProvider } from '../context/AppContext';
import type { UserRole } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AyuNexaLogo } from '../components/common/AyuNexaLogo';

export type AppRole = 'patient' | 'caregiver' | 'doctor' | 'super_admin';

export interface UserProfile {
  id: string;
  display_name: string | null;
  role: AppRole;
}

interface AuthContextValue {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const VALID_ROLES: AppRole[] = ['patient', 'caregiver', 'doctor', 'super_admin'];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
}

async function readProfile(userId: string): Promise<UserProfile> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('Your account profile is missing. Please contact the AyuNexa administrator.');
  }

  const role = String(data.role) as AppRole;
  if (!VALID_ROLES.includes(role)) {
    throw new Error('Your account has an unsupported role. Please contact the AyuNexa administrator.');
  }

  return {
    id: data.id,
    display_name: data.display_name,
    role,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => readProfile(userId), []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const hydrate = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;

        setSession(data.session);
        if (data.session) {
          const nextProfile = await loadProfile(data.session.user.id);
          if (mounted) {
            setProfile(nextProfile);
            setAuthError(null);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        if (mounted) {
          setProfile(null);
          setAuthError(errorMessage(error));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      setAuthError(null);

      if (!nextSession) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      // Defer profile loading until after Supabase's auth callback returns.
      window.setTimeout(() => {
        void loadProfile(nextSession.user.id)
          .then((nextProfile) => {
            if (mounted) setProfile(nextProfile);
          })
          .catch((error) => {
            if (mounted) {
              setProfile(null);
              setAuthError(errorMessage(error));
            }
          })
          .finally(() => {
            if (mounted) setLoading(false);
          });
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id || !supabase) return;
    setLoading(true);
    setAuthError(null);
    try {
      setProfile(await loadProfile(session.user.id));
    } catch (error) {
      setProfile(null);
      setAuthError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [session?.user.id, loadProfile]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({ session, profile, loading, authError, refreshProfile, signOut }),
    [session, profile, loading, authError, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

const roleMap: Record<AppRole, UserRole> = {
  patient: 'PATIENT',
  caregiver: 'CAREGIVER',
  doctor: 'DOCTOR',
  super_admin: 'SUPER_ADMIN',
};

export const SupabaseAuthGate: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session, profile, loading, authError, refreshProfile, signOut } = useAuth();

  if (!isSupabaseConfigured || !supabase) {
    return (
      <AuthMessage
        title="Connect AyuNexa to Supabase"
        body="Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your local .env file, then restart the app."
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8fa] p-6">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-800" />
          <p className="font-semibold text-slate-700">Securing your AyuNexa session…</p>
        </div>
      </div>
    );
  }

  if (!session) return <AuthScreen />;

  if (authError || !profile) {
    return (
      <AuthMessage
        title="Account access needs attention"
        body={authError || 'Your account profile could not be loaded.'}
        primaryLabel="Retry profile check"
        onPrimary={() => void refreshProfile()}
        secondaryLabel="Sign out"
        onSecondary={() => void signOut()}
      />
    );
  }

  const isAdminPath = window.location.pathname.startsWith('/admin');
  if (isAdminPath && profile.role !== 'super_admin') {
    return (
      <AuthMessage
        title="Access denied"
        body="The Operations Console is restricted to accounts explicitly assigned the Super Admin role."
        primaryLabel="Open my portal"
        onPrimary={() => window.location.replace('/')}
      />
    );
  }

  return <AppProvider authRole={roleMap[profile.role]}>{children}</AppProvider>;
};

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setError('Supabase is not configured. Check your .env file.');
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) throw new Error('Enter your full name.');
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (signupError) throw signupError;

        if (data.session) {
          setNotice('Your account is ready. Opening your patient portal…');
        } else {
          setNotice('Account created. Check your email to confirm your address, then sign in.');
          setMode('signin');
        }
      } else {
        const { error: signinError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signinError) throw signinError;
      }
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-purple-100 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex justify-center">
          <AyuNexaLogo variant="full" showTagline={true} />
        </div>
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-800">
            Connected Care. Smarter Health.
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in securely to open your assigned AyuNexa portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-display-name" className="mb-1 block text-sm font-semibold text-slate-700">
                Full name
              </label>
              <input
                id="auth-display-name"
                autoComplete="name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={100}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-700 focus:ring-2 focus:ring-purple-100"
                placeholder="Enter your name"
              />
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className="mb-1 block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-700 focus:ring-2 focus:ring-purple-100"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="mb-1 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-purple-700 focus:ring-2 focus:ring-purple-100"
              placeholder="At least 8 characters"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-[#4a044e] to-[#701a75] px-4 py-3 font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in securely' : 'Create patient account'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          {mode === 'signin' ? 'New to AyuNexa?' : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setNotice(null);
            }}
            className="font-bold text-purple-800 underline underline-offset-2"
          >
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </div>
        <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
          New accounts start with the Patient role. Caregiver, Doctor, and Super Admin access must be assigned by an authorized administrator.
        </p>
      </section>
    </main>
  );
};

const AuthMessage: React.FC<{
  title: string;
  body: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}> = ({ title, body, primaryLabel, onPrimary, secondaryLabel, onSecondary }) => (
  <main className="min-h-screen flex items-center justify-center bg-[#faf8fa] p-6">
    <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
      <h1 className="text-xl font-extrabold text-slate-900">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {primaryLabel && onPrimary && (
          <button onClick={onPrimary} className="rounded-xl bg-purple-900 px-4 py-2.5 font-bold text-white">
            {primaryLabel}
          </button>
        )}
        {secondaryLabel && onSecondary && (
          <button onClick={onSecondary} className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700">
            {secondaryLabel}
          </button>
        )}
      </div>
    </section>
  </main>
);
