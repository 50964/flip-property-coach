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
            <img 
              src="/logo.png" 
              alt="FLIP Property Coach" 
              className="h-10 w-auto" 
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowDemoModal(true)}
              className="px-5 py-2.5 text-sm font-medium hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Watch 1-min demo
            </button>
            <Link 
              href="#get-started"
              className="btn-primary flex items-center gap-2"
            >
              Start free trial <ArrowRight className="w-4 h-4" />
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

            <h1 className="text-6xl lg:text-7xl font-semibold tracking-tighter leading-none mb-6">
              Build your<br />property flipping<br />empire.
            </h1>
            <p className="max-w-lg text-2xl text-white/70 mb-10">
              The complete operating system for flippers.<br />Find suppliers, manage projects, track every penny, and learn from the best.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowDemoModal(true)}
                className="btn-primary text-lg px-10 py-4 flex items-center justify-center gap-3 group"
              >
                Try the live demo <ArrowRight className="group-hover:translate-x-0.5 transition" />
              </button>
              <a href="#features" className="btn-secondary text-lg px-10 py-4 flex items-center justify-center gap-3">
                See how it works
              </a>
            </div>
            <p className="text-xs text-white/40 mt-4">No credit card required • 14-day free trial</p>
          </div>

          {/* Right: Hero image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <img 
              src="/hero.jpg" 
              alt="FLIP Property Coach - Flip your property empire" 
              className="w-full h-auto object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-[#0F172A]/20 to-transparent" />
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
          <h3 className="text-4xl font-semibold tracking-tight mb-4">Ready to flip smarter?</h3>
          <p className="text-white/70 mb-8">Join hundreds of flippers who are already building their empires with Flip.</p>
          <button 
            onClick={() => setShowDemoModal(true)}
            className="btn-primary text-lg px-14 py-4 inline-flex items-center gap-3"
          >
            Launch the full demo now
          </button>
          <p className="text-xs text-white/40 mt-6">Instant access • Your data stays in your browser for the demo</p>
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
    </div>
  );
}