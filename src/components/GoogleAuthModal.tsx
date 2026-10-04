import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Sparkles, Music, BookOpen, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

import navswarLogo from '../assets/navswar_logo.png';

export const GoogleAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithGoogle,
    loginWithGoogleCredential,
    authMessage,
    googleClientId,
    hasGoogleClientId,
  } = useAuth();
  const { language } = useLanguage();
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    if (!isAuthModalOpen || !hasGoogleClientId) return;

    let timer: ReturnType<typeof setTimeout>;

    const initGoogleGSI = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: { credential: string }) => {
            if (response.credential) {
              loginWithGoogleCredential(response.credential);
            }
          },
        });

        const btnDiv = document.getElementById('google-signin-btn-mount');
        if (btnDiv) {
          btnDiv.innerHTML = '';
          window.google.accounts.id.renderButton(btnDiv, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 280,
          });
        }
      } else {
        timer = setTimeout(initGoogleGSI, 300);
      }
    };

    initGoogleGSI();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthModalOpen, hasGoogleClientId, googleClientId]);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignInClick = () => {
    if (hasGoogleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      loginWithGoogle();
    }
  };

  const handleCustomFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithGoogle(customName || 'Devotee Singer', customEmail || 'devotee@garbaraas.in');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#5A0808] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-7 shadow-devotional space-y-5 text-[#FFF7E8] max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#FFF7E8]/70 hover:text-[#FFF7E8] hover:bg-[#351010] transition-colors"
          title="Close sign in dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Logo & Title */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-xl bg-[#351010] border border-[#D4AF37]/50 overflow-hidden mx-auto shadow-md p-0.5">
            <img src={navswarLogo} alt="GarbaRaas Logo" className="w-full h-full object-cover rounded-lg" />
          </div>

          <h3 className="font-serif-title text-xl sm:text-2xl font-extrabold text-[#FFF7E8] tracking-wide">
            {language === 'gu'
              ? 'ગરબારાસ ભક્તિ સાઇન-ઇન'
              : language === 'hi'
              ? 'गरबारास भक्ति साइन-इन'
              : 'GarbaRaas Devotional Portal'}
          </h3>

          <p className="text-xs text-[#D4AF37] font-medium leading-relaxed max-w-xs mx-auto">
            {authMessage ||
              (language === 'gu'
                ? 'સંપૂર્ણ ગરબા સાહિત્ય, ઓડિયો સાંભળવા અને તમારા પોતાના ગરબા ઉમેરવા માટે સાઇન-ઇન કરો.'
                : language === 'hi'
                ? 'पूर्ण गरबा साहित्य, ऑडियो सुनने और अपने खुद के गरबा जोड़ने के लिए साइन-इन करें।'
                : 'Sign in to unlock full Garba lyrics, voice recordings, audio playback & submit custom Garbas!')}
          </p>
        </div>

        {/* Feature Access Highlights */}
        <div className="grid grid-cols-3 gap-2 bg-[#351010]/80 border border-[#D4AF37]/20 p-2.5 rounded-xl text-center text-[10px]">
          <div className="space-y-0.5">
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37] mx-auto" />
            <span className="block font-semibold">Full Lyrics</span>
          </div>
          <div className="space-y-0.5">
            <Music className="w-3.5 h-3.5 text-[#D4AF37] mx-auto" />
            <span className="block font-semibold">Audio Player</span>
          </div>
          <div className="space-y-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] mx-auto" />
            <span className="block font-semibold">Add Garba</span>
          </div>
        </div>

        {/* Setup notice if Client ID is missing */}
        {!hasGoogleClientId && (
          <div className="bg-[#351010] border border-[#D4AF37]/30 rounded-xl p-3 text-xs space-y-1.5 text-[#FFF7E8]">
            <div className="flex items-center gap-1.5 font-semibold text-[#D4AF37]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Google OAuth Setup Notice</span>
            </div>
            <p className="text-[11px] text-[#FFF7E8]/80 leading-tight">
              To enable live Google Sign-In, set your <code className="bg-[#250606] px-1 py-0.5 rounded text-[#D4AF37]">VITE_GOOGLE_CLIENT_ID</code> in <code className="bg-[#250606] px-1 py-0.5 rounded text-[#D4AF37]">.env</code>.
            </p>
            <button
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="text-[11px] text-[#D4AF37] underline flex items-center gap-1 font-medium"
            >
              <Info className="w-3 h-3" />
              {showSetupGuide ? 'Hide Setup Steps' : 'View Setup Instructions'}
            </button>

            {showSetupGuide && (
              <ol className="list-decimal list-inside text-[10px] space-y-1 pt-1 text-[#FFF7E8]/70 border-t border-[#D4AF37]/20">
                <li>Go to Google Cloud Console (console.cloud.google.com)</li>
                <li>Configure OAuth Consent Screen & Web Application</li>
                <li>Add Authorized JS Origin: <code className="text-[#D4AF37]">http://localhost:5173</code></li>
                <li>Copy Client ID to <code className="text-[#D4AF37]">.env</code></li>
              </ol>
            )}
          </div>
        )}

        {/* Google Sign-In Section */}
        {!showEmailForm ? (
          <div className="space-y-3 pt-1">
            {hasGoogleClientId ? (
              <div className="flex flex-col items-center gap-3">
                <div id="google-signin-btn-mount" className="w-full flex justify-center"></div>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignInClick}
                className="w-full flex items-center justify-center gap-2.5 bg-[#FFF7E8] hover:bg-[#FFF3D6] text-[#351010] font-bold py-3 px-4 rounded-xl shadow-md transition-all border border-[#D4AF37]/40"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-xs font-bold">Continue with Google (Demo Mode)</span>
              </button>
            )}

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="text-xs text-[#D4AF37] hover:underline font-medium"
              >
                Or sign in with Devotee Email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomFormSubmit} className="space-y-2.5 pt-1">
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Your Devotee Name (e.g. Apeksha Dave)"
              className="w-full bg-[#351010] text-[#FFF7E8] placeholder-[#FFF7E8]/50 px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/30 text-xs outline-none focus:border-[#D4AF37]"
            />
            <input
              type="email"
              required
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="devotee@garbaraas.in"
              className="w-full bg-[#351010] text-[#FFF7E8] placeholder-[#FFF7E8]/50 px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/30 text-xs outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#351010] font-bold py-2.5 rounded-xl shadow text-xs hover:brightness-105"
            >
              Complete Sign In
            </button>
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="text-xs text-[#FFF7E8]/70 hover:underline"
              >
                ← Back to Google Sign In
              </button>
            </div>
          </form>
        )}

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#FFF7E8]/60 pt-2 border-t border-[#D4AF37]/20">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Secure Google OAuth 2.0 Auth • GarbaRaas Devotional Platform</span>
        </div>

      </div>
    </div>
  );
};

