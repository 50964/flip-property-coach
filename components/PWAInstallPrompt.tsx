'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    setDismissed(wasDismissed);

    // Listen for Chrome/Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a short delay if not dismissed and not standalone
      if (!wasDismissed && !standalone) {
        setTimeout(() => setShowPrompt(true), 45000); // Show after 45 seconds of engagement
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show a gentler prompt on second visit or after time
    if (ios && !standalone && !wasDismissed) {
      const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0') + 1;
      localStorage.setItem('pwa-visit-count', visitCount.toString());
      
      if (visitCount >= 2) {
        setTimeout(() => setShowPrompt(true), 30000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed, dismissed, or no prompt available
  if (isStandalone || dismissed || (!deferredPrompt && !isIOS) || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-[#1E293B] border border-[#D4AF37]/30 rounded-2xl shadow-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-[#D4AF37]" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white">Install Flip Property Coach</h3>
              <button 
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-slate-300 mb-4">
              {isIOS 
                ? "Add to your Home Screen for the best experience and reliable notifications."
                : "Install the app for faster access, offline support, and native notifications."
              }
            </p>

            {isIOS ? (
              <div className="bg-[#0F172A] rounded-xl p-3 text-xs text-slate-300 space-y-2">
                <p className="font-medium text-[#D4AF37]">On iPhone / iPad:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Tap the <span className="font-mono">Share</span> button below</li>
                  <li>Scroll and tap <span className="font-medium">"Add to Home Screen"</span></li>
                  <li>Tap <span className="font-medium">"Add"</span></li>
                </ol>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#C5A028] active:bg-[#B8971F] text-[#0F172A] font-semibold py-3 rounded-xl transition-all active:scale-[0.985]"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}

            <button 
              onClick={handleDismiss}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-300 mt-3 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
