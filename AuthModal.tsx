import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  Headphones, 
  Sparkles, 
  Check, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { useGig } from '../../context/GigContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { currentUser, updateCurrentUser, updateBuyerProfile } = useGig();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<'buyer' | 'seller'>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetEmail = email.trim() || (authMode === 'login' ? 'anilkumarsaurav@gmail.com' : 'client@nain-music.com');
    const targetName = name.trim() || (authMode === 'login' ? currentUser.name : 'Nain Music Client');

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      
      // Update logged in user session
      updateCurrentUser({
        name: targetName,
        username: targetEmail.split('@')[0] || 'user',
      });

      if (accountType === 'buyer') {
        updateBuyerProfile({
          name: targetName,
          email: targetEmail,
          username: targetEmail.split('@')[0] || 'buyer'
        });
      }

      setSuccessMessage(authMode === 'login' ? 'Successfully signed in!' : 'Account created successfully!');

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 700);
    }, 400);
  };

  const handleQuickDemoLogin = (role: 'buyer' | 'seller') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (role === 'seller') {
        updateCurrentUser({
          name: 'SoundLab Official',
          username: 'soundlab_pro',
          level: 'Top Rated Audio Engineer'
        });
      } else {
        updateCurrentUser({
          name: 'Anil Kumar Saurav',
          username: 'anilkumarsaurav',
          level: 'VIP Client'
        });
        updateBuyerProfile({
          name: 'Anil Kumar Saurav',
          email: 'anilkumarsaurav@gmail.com',
          username: 'anilkumarsaurav'
        });
      }
      setSuccessMessage(`Signed in as ${role === 'seller' ? 'SoundLab Studio' : 'Anil Kumar Saurav'}!`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 500);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>{authMode === 'login' ? 'Sign In to Nain Music' : 'Create Account'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {authMode === 'login' ? 'Access your orders, gigs & studio chat' : 'Join Nain Music audio marketplace'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close modal"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-5 pb-2 bg-slate-50/70 border-b border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              authMode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              authMode === 'signup'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <X className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name / Artist Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anil Kumar Saurav"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>
            </div>
          )}

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                I am joining as
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('buyer')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition ${
                    accountType === 'buyer'
                      ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs">Buyer / Client</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('seller')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition ${
                    accountType === 'seller'
                      ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs'
                  }`}
                >
                  <Headphones className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs">Studio Seller</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anilkumarsaurav@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <span>Remember this session</span>
            </label>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('buyer')}
              className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
            >
              Default Account
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
            ) : (
              <>
                <span>{authMode === 'login' ? 'Sign In to Account' : 'Create Nain Music Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Access Profiles */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 text-center mb-2">
              Quick Switch Profile
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('buyer')}
                className="py-2 px-2.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Buyer Login</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('seller')}
                className="py-2 px-2.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Studio Login</span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Session</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold hover:underline cursor-pointer"
          >
            Cancel & Return to App
          </button>
        </div>
      </div>
    </div>
  );
};
