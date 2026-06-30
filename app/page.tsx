'use client';

import { useState } from 'react';
import { ArrowRight, Users, TrendingUp, Award, Play } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 text-white font-bold text-xl shadow-lg">
              F
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">FLIP <span className="text-white/60 font-medium">Coach</span></span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowDemoModal(true)}
              className="px-5 py-2.5 text-sm font-medium hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Watch 1-min demo
            </button>
            <Link 
              href="/login"
              className="btn-primary flex items-center gap-2"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm mb-6">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
              Trusted by 1,200+ property flippers
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter leading-none mb-6">
              Build your<br />property flipping<br />empire.
            </h1>
            <p className="max-w-lg text-xl sm:text-2xl text-white/70 mb-8 sm:mb-10">
              The complete operating system for flippers.<br />Find suppliers, manage projects, track every penny, and learn from the best.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowDemoModal(true)}
                className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-4 flex items-center justify-center gap-3 group"
              >
                Try the live demo <ArrowRight className="group-hover:translate-x-0.5 transition" />
              </button>
              <a href="#features" className="btn-secondary text-base sm:text-lg px-8 sm:px-10 py-4 flex items-center justify-center gap-3">
                See how it works
              </a>
            </div>
            <p className="text-xs text-white/40 mt-4">No credit card required • 14-day free trial</p>
          </div>

          {/* Right: Hero image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-square lg:aspect-auto h-full min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="FLIP Property Coach - Flip your property empire" 
              className="w-full h-full object-cover absolute inset-0" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/20 to-transparent" />
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-y border-white/10 py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-x-12 gap-y-4 text-white/40 text-sm">
          <div>Featured in Property Investor Magazine</div>
          <div>4.9/5 from 847 flippers</div>
          <div>£2.4m+ in tracked project value</div>
        </div>
      </div>

      {/* Features / The 4 Quadrants */}
      <div id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-[#D4AF37] text-sm font-semibold tracking-[3px] mb-3">THE OPERATING SYSTEM</div>
          <h2 className="text-5xl font-semibold tracking-tight">Everything you need in one place</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-8 h-8" />, title: "FIND", desc: "Discover trusted suppliers & save properties. Build your dream team in seconds." },
            { icon: <TrendingUp className="w-8 h-8" />, title: "FINANCE", desc: "Real-time cashflow, project budgets, and accountant-ready exports." },
            { icon: <Award className="w-8 h-8" />, title: "FLIP", desc: "Project management, to-dos, checklists, milestones & team coordination." },
            { icon: <Play className="w-8 h-8" />, title: "EDUCATE", desc: "Step-by-step courses, case studies, templates & live whiteboard sessions." },
          ].map((item, i) => (
            <div key={i} className="card p-8 group">
              <div className="text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="font-semibold text-3xl tracking-tight mb-3">{item.title}</div>
              <p className="text-white/70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div id="get-started" className="bg-[#1E2937] border-t border-white/10 py-16">
        <div className="max-w-xl mx-auto text-center px-6">
          <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Ready to flip smarter?</h3>
          <p className="text-white/70 mb-8 text-sm sm:text-base">Join hundreds of flippers who are already building their empires with Flip.</p>
          <Link 
            href="/login"
            className="btn-primary text-base sm:text-lg px-10 sm:px-14 py-4 inline-flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            Sign Up / In
          </Link>
          <p className="text-xs text-white/40 mt-6">Instant access • Start building your empire today</p>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-6" onClick={() => setShowDemoModal(false)}>
          <div className="card max-w-md w-full p-8 modal" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mb-6">
                <Play className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-3xl font-semibold tracking-tight mb-2">Welcome to Flip</h3>
              <p className="text-white/70 mb-8">Sign in with magic link for real accounts, or jump straight into the beautiful demo (local data only).</p>
              
              <Link 
                href="/login" 
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                onClick={() => setShowDemoModal(false)}
              >
                Sign in or try Demo <ArrowRight />
              </Link>
              
              <button 
                onClick={() => setShowDemoModal(false)}
                className="mt-4 text-sm text-white/50 hover:text-white"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Become a Supplier - Dedicated Section */}
<div className="bg-[#1E2937] border-t border-white/10 py-12 md:py-16">
  <div className="max-w-4xl mx-auto px-6 text-center">
    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
      Are you a tradesperson or supplier?
    </h2>
    <p className="text-white/70 text-base md:text-lg mb-8 max-w-xl mx-auto">
      Join the network trusted by property flippers across the UK. Get discovered and receive real leads.
    </p>
    
    <Link 
      href="/become-supplier"
      className="inline-flex w-full md:w-auto items-center justify-center bg-white text-[#0F172A] font-semibold px-10 py-4 rounded-2xl text-lg hover:bg-[#D4AF37] hover:text-white active:scale-[0.985] transition-all"
    >
      Become a Supplier
    </Link>
    
    <p className="text-white/50 text-sm mt-4">
      Free to apply • Quick approval • Start getting work
    </p>
  </div>
</div>
    </div>
  );
}
