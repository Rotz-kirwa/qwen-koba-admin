import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { getGoogleClientId, loadGoogleIdentityScript } from '../lib/googleAuth';

const BRAND_LOGO_URL = "/queen-koba-logo.jpg";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const { login, loginWithGoogle } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const initializeGoogle = async () => {
      try {
        await loadGoogleIdentityScript();

        if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: getGoogleClientId(),
          callback: async ({ credential }) => {
            setError('');
            setGoogleLoading(true);

            try {
              await loginWithGoogle(credential);
              navigate('/admin');
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Google sign-in failed';
              setError(message);
            } finally {
              setGoogleLoading(false);
            }
          },
          context: 'signin',
          ux_mode: 'popup',
        });

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 368,
        });

        setGoogleReady(true);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Google sign-in failed to load';
          setError(message);
        }
      }
    };

    void initializeGoogle();

    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={BRAND_LOGO_URL}
            alt="Queen Koba Logo"
            className="h-20 w-auto mx-auto mb-3 rounded-lg"
          />
          <h1 className="text-4xl font-serif text-[#8B6F47] mb-2">Queen Koba</h1>
          <p className="text-gray-600">Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full admin-btn-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="space-y-3">
            <div
              ref={googleButtonRef}
              className={`min-h-[44px] flex items-center justify-center rounded-lg border border-gray-200 ${
                googleReady ? 'bg-white' : 'bg-gray-50'
              }`}
            />
            <p className="text-center text-xs text-gray-500">
              {googleLoading
                ? 'Completing Google sign-in...'
                : 'Use your verified Google account to continue.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
