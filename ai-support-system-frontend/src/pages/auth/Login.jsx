import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Cpu, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Input values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Touched state for form validation triggers
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Errors
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mouse cursor sparkles state
  const [particles, setParticles] = useState([]);
  const [bgParticles, setBgParticles] = useState([]);

  // Auto-redirect if user is ALREADY authenticated
  useEffect(() => {
    if (user && user.role) {
      if (user.role === 'customer') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'engineer') {
        navigate('/engineer/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Read URL query error on mount
  useEffect(() => {
    const errorParam = new URLSearchParams(window.location.search).get('error');
    if (errorParam) {
      setGeneralError(errorParam);
    }
  }, []);

  // Generate background particles on mount
  useEffect(() => {
    const generated = Array.from({ length: 15 }).map((_, idx) => ({
      id: idx,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 4,
      delay: Math.random() * 5,
      duration: Math.random() * 12 + 8
    }));
    setBgParticles(generated);
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    setParticles((prev) => {
      const next = [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: clientX,
          y: clientY,
          size: Math.random() * 5 + 3,
        },
      ];
      if (next.length > 20) {
        return next.slice(next.length - 20);
      }
      return next;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => prev.slice(1));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Real-time validations
  const isEmailEmpty = !email.trim();
  const isEmailInvalid = emailTouched && isEmailEmpty;
  const emailErrorMessage = isEmailEmpty ? 'Email or Username is required' : '';

  const isPasswordEmpty = !password.trim();
  const isPasswordInvalid = passwordTouched && isPasswordEmpty;
  const passwordErrorMessage = isPasswordEmpty ? 'Password is required' : '';

  const isFormValid = !isEmailEmpty && !isPasswordEmpty;
  const isSubmitDisabled = !isFormValid || loading;

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setGeneralError('');

    if (!isFormValid || loading) return;

    setLoading(true);
    try {
      // Common Login Flow: POST /api/auth/login -> GET /api/users/me
      const loggedUser = await login(email.trim(), password);

      // Role-based redirection
      if (loggedUser.role === 'customer') {
        navigate('/dashboard', { replace: true });
      } else if (loggedUser.role === 'engineer') {
        navigate('/engineer/dashboard', { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      if (!err.response) {
        setGeneralError('Unable to connect to the support server.');
      } else if (err.response.status === 400 || err.response.status === 401 || err.response.status === 422) {
        setGeneralError('Invalid username or password.');
      } else {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          setGeneralError(detail);
        } else {
          setGeneralError('Unable to connect to the support server.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full bg-[#050816] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #0b1120 0%, #050816 100%)'
      }}
    >
      {/* Sparkles cursor */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full pointer-events-none bg-gradient-to-r from-cyan-400 to-[#2196F3] shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"
          style={{
            left: p.x - p.size / 2,
            top: p.y - p.size / 2,
            width: p.size,
            height: p.size,
            transition: 'opacity 0.6s ease-out',
            opacity: 0.8,
          }}
        />
      ))}

      {/* Floating Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bgParticles.map((bp) => (
          <div
            key={bp.id}
            className="absolute rounded-full bg-cyan-500/5 blur-xs"
            style={{
              left: `${bp.x}%`,
              top: `${bp.y}%`,
              width: bp.size,
              height: bp.size,
              animation: `floatParticle ${bp.duration}s infinite ease-in-out`,
              animationDelay: `${bp.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Glow Rings */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      <div className="w-full max-w-lg relative z-10 flex flex-col gap-7 animate-fade-in py-8">
        
        {/* Header Title Section */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-4 border border-cyan-500/20">
            <Cpu size={26} className="text-white animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider leading-none bg-gradient-to-r from-sky-400 via-cyan-300 to-white bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(6,182,212,0.3)]">
            TeleCare AI
          </h1>
        </div>

        {/* Login Glassmorphism Card */}
        <div className="bg-[#0b1120]/45 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_12px_45px_rgba(6,182,212,0.12)] hover:border-cyan-500/20 transition-all duration-500">
          
          {generalError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs font-sans text-rose-300 leading-relaxed text-center animate-slide-up">
              {generalError}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5.5">
            {/* Email / Username Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-display font-bold text-cyan-400 uppercase tracking-widest pl-1">Email or Username</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-cyan-400 pointer-events-none">
                  <Mail size={16} />
                </div>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="Enter your username or email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  className={`w-full text-xs font-sans pl-10 pr-4 py-4 bg-slate-950/60 border text-white placeholder-[#94A3B8] rounded-xl outline-none transition-all duration-300 ${
                    isEmailInvalid 
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/10' 
                      : 'border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10'
                  }`}
                />
              </div>
              {isEmailInvalid && (
                <span className="text-[10px] font-sans text-rose-400 pl-1 mt-0.5 animate-slide-up">{emailErrorMessage}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-display font-bold text-cyan-400 uppercase tracking-widest pl-1">Access Password</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-cyan-400 pointer-events-none">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  className={`w-full text-xs font-sans pl-10 pr-10 py-4 bg-slate-950/60 border text-white placeholder-slate-500 rounded-xl outline-none transition-all duration-300 ${
                    isPasswordInvalid 
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/10' 
                      : 'border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {isPasswordInvalid && (
                <span className="text-[10px] font-sans text-rose-400 pl-1 mt-0.5 animate-slide-up leading-relaxed">{passwordErrorMessage}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium mt-1">
              <Link to="/forgot-password" className="text-cyan-400 hover:text-cyan-300 transition-colors pl-1">
                Forgot password?
              </Link>
              <span className="text-slate-500 pr-1">
                No account? <Link to="/register" className="text-cyan-400 hover:underline font-semibold">Register</Link>
              </span>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              loading={loading}
              disabled={isSubmitDisabled}
              className={`mt-4 w-full text-white py-4 rounded-xl transition-all font-display font-bold text-xs ${
                isFormValid 
                  ? 'bg-gradient-to-r from-cyan-600 via-[#1d63b8] to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md hover:shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]' 
                  : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span>{loading ? 'Signing in...' : 'Login Securely'}</span>
                {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
              </div>
            </Button>
          </form>
        </div>

      </div>

      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(15px); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Login;
