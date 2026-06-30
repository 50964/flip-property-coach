'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, TrendingUp, Award, Play, Plus, Search, Download, 
  Calendar, CheckCircle, X, CreditCard, LogOut, ArrowRight, Inbox, MessageCircle,
  BookOpen, Video, FileText, Star, Clock, CheckSquare, Award as Trophy, BarChart3, Lock
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import PushNotificationManager from '@/components/PushNotificationManager';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

import { User, Supplier, Property, Project, Transaction, Todo, TeamMember, Lead } from '@/types';
import { storage } from '@/lib/storage';
import { mockSuppliers, mockProperties, initialProjects, initialTransactions, initialTodos } from '@/lib/mockData';
import { createClient } from '@/lib/supabase';
import * as SupabaseData from '@/lib/supabase-data';
import type { Database } from '@/types/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Types for view
type View = 'find' | 'finance' | 'flip' | 'educate' | 'enquiries';

const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#EF4444'];

export default function FlipDashboard() {
  const supabase = createClient();

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Core data
  const [currentView, setCurrentView] = useState<View>('flip');
  const [activeProjectId, setActiveProjectId] = useState('proj1');
  
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [myEnquiries, setMyEnquiries] = useState<Lead[]>([]);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'education' | 'ad-yearly' | 'ad-lead'>('education');
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTx, setNewTx] = useState({ description: '', amount: 0, type: 'expense' as 'income' | 'expense', category: 'Materials' });

  // Contact Supplier flow (Step 10 - full end-to-end)
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedSupplierForContact, setSelectedSupplierForContact] = useState<Supplier | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [contactProject, setContactProject] = useState('');

  // Education state (Step 9 - polished & seeded)
  const [educationSearch, setEducationSearch] = useState('');
  const [educationCategory, setEducationCategory] = useState<'All' | 'Videos' | 'Templates' | 'Case Studies' | 'Cheat Sheets' | 'Webinars'>('All');
  const [selectedEducation, setSelectedEducation] = useState<any>(null);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({});

  // Step 12: Education Subscription Gating + Freemium
  const [hasEducationSubscription, setHasEducationSubscription] = useState(false); // Demo mode flag
  const [showEducationPaywall, setShowEducationPaywall] = useState(false);
  const [paywallResource, setPaywallResource] = useState<any>(null);

  // ==================== STEP 9: POLISHED & SEEDED EDUCATION LIBRARY ====================
  const educationLibrary = [
    {
      id: 'course-playbook',
      title: "The Complete Flipper's Playbook",
      type: 'Videos',
      duration: '4h 12m',
      level: 'Beginner → Advanced',
      rating: 4.9,
      description: "The definitive 6-module course covering every stage of a successful UK property flip — from sourcing and due diligence to project management, sales strategy and tax optimisation.",
      icon: Video,
      contentType: 'video',
      videoChapters: ['Module 1: Finding the Right Deal', 'Module 2: Numbers That Matter', 'Module 3: Building Your Dream Team', 'Module 4: Project Execution', 'Module 5: Maximising Value', 'Module 6: Exit & Tax Strategy'],
      takeaways: ['How to analyse any deal in under 10 minutes', 'Proven contractor negotiation scripts', 'Cashflow forecasting templates included'],
      access: 'premium' as const
    },
    {
      id: 'cheatsheet-tax',
      title: "UK Tax & Accounting for Flippers 2025",
      type: 'Cheat Sheets',
      duration: '—',
      level: 'All Levels',
      rating: 4.8,
      description: "Essential guide to Corporation Tax, Capital Gains, Section 24, VAT on renovations, and how to structure your limited company for maximum tax efficiency on every flip.",
      icon: FileText,
      contentType: 'pdf',
      takeaways: ['Section 24 & interest relief rules', 'When to use Ltd vs personal ownership', 'Allowable expenses checklist'],
      access: 'free' as const
    },
    {
      id: 'case-bathroom',
      title: "Bathroom Renovation ROI Case Study",
      type: 'Case Studies',
      duration: '—',
      level: 'Intermediate',
      rating: 4.7,
      description: "Real £18,400 bathroom flip in Manchester. Full numbers, before/after photos description, timeline, contractor costs, and how we achieved 2.8x ROI on the renovation budget.",
      icon: BarChart3,
      contentType: 'case-study',
      metrics: { investment: '£18,400', saleUplift: '£52,000', roi: '2.8x', timeline: '11 days' },
      takeaways: ['Best value tiles & fittings 2025', 'How to brief a tiler for speed', 'Common mistakes that kill ROI'],
      access: 'premium' as const
    },
    {
      id: 'templates-negotiation',
      title: "Contractor Negotiation Scripts & Templates",
      type: 'Templates',
      duration: '—',
      level: 'All Levels',
      rating: 4.9,
      description: "Ready-to-use email templates, quote comparison spreadsheet, and proven scripts to get better prices and faster turnaround from builders, electricians and plumbers.",
      icon: FileText,
      contentType: 'pdf',
      takeaways: ['3-stage negotiation framework', 'Quote comparison matrix', 'How to handle scope creep'],
      access: 'free' as const
    },
    {
      id: 'webinar-offmarket',
      title: "Finding Off-Market Deals Masterclass",
      type: 'Webinars',
      duration: '58m',
      level: 'Intermediate',
      rating: 4.6,
      description: "Live recording from our most popular session. Learn exactly how top flippers source deals before they hit Rightmove — letters, agents, probate, auctions and more.",
      icon: Video,
      contentType: 'video',
      videoChapters: ['Why off-market beats portals', 'The 5 best sourcing channels', 'Script for calling agents', 'Probate & inherited properties'],
      takeaways: ['Letter templates that actually get replies', 'How to build a sourcing network', 'Red flags on every deal'],
      access: 'premium' as const
    },
    {
      id: 'checklist-hmo',
      title: "HMO Licensing & Compliance Checklist",
      type: 'Templates',
      duration: '—',
      level: 'All Levels',
      rating: 4.8,
      description: "Interactive step-by-step checklist for converting a property to HMO. Covers licensing, fire safety, planning permission, and how to maximise room count legally.",
      icon: CheckSquare,
      contentType: 'checklist',
      checklistItems: [
        'Check Article 4 direction in your area',
        'Measure every room against minimum sizes',
        'Fire door & smoke alarm specification',
        'Planning permission vs permitted development',
        'Licence application pack checklist',
        'Tenant referencing & management plan'
      ],
      takeaways: ['Avoid the 3 most common licensing mistakes', 'How to add 2 extra bedrooms legally', 'Fire safety rules that actually matter'],
      access: 'free' as const
    },
    {
      id: 'video-kitchen',
      title: "Whiteboard: Full Kitchen Flip Walkthrough",
      type: 'Videos',
      duration: '1h 22m',
      level: 'Intermediate',
      rating: 4.9,
      description: "Watch Matt walk through a complete kitchen renovation from strip-out to final reveal. Every decision, cost, supplier and time-saving trick explained in real time.",
      icon: Video,
      contentType: 'video',
      videoChapters: ['Planning & design decisions', 'Supplier sourcing & lead times', 'Installation sequence', 'Final snagging & photography'],
      takeaways: ['How to brief a kitchen designer', 'Best value worktop & appliance choices', 'Timeline you can actually hit'],
      access: 'premium' as const
    },
    {
      id: 'cheatsheet-stampduty',
      title: "Stamp Duty & SDLT Optimisation Guide",
      type: 'Cheat Sheets',
      duration: '—',
      level: 'All Levels',
      rating: 4.7,
      description: "Clear, up-to-date guide on SDLT for flippers, including multiple dwellings relief, linked transactions, and how to structure purchases to minimise your biggest upfront cost.",
      icon: FileText,
      contentType: 'pdf',
      takeaways: ['When MDR applies to flips', 'Linked transaction rules', 'First-time buyer relief traps'],
      access: 'premium' as const
    },
    {
      id: 'case-kitchen',
      title: "Kitchen Value-Add Case Study – £41k Profit",
      type: 'Case Studies',
      duration: '—',
      level: 'All Levels',
      rating: 4.8,
      description: "How we turned a tired 1970s kitchen into the hero of the house and added £41,000 to the sale price on a £9,800 budget. Full cost breakdown and before/after.",
      icon: BarChart3,
      contentType: 'case-study',
      metrics: { investment: '£9,800', saleUplift: '£41,000', roi: '4.2x', timeline: '9 days' },
      takeaways: ['The 3 upgrades that deliver the biggest uplift', 'How to photograph kitchens for maximum impact', 'Supplier relationships that save money'],
      access: 'premium' as const
    }
  ];

  const filteredEducation = educationLibrary
    .filter(item => 
      (educationCategory === 'All' || item.type === educationCategory) &&
      (item.title.toLowerCase().includes(educationSearch.toLowerCase()) || 
       item.description.toLowerCase().includes(educationSearch.toLowerCase()))
    );

  // Education helper functions (Step 9 + Step 12 Freemium)
  const closeEducation = () => {
    setSelectedEducation(null);
  };

  const toggleComplete = (id: string) => {
    const isCompleted = completedItems.includes(id);
    let newCompleted: string[];
    
    if (isCompleted) {
      newCompleted = completedItems.filter(itemId => itemId !== id);
      toast.info('Marked as incomplete');
    } else {
      newCompleted = [...completedItems, id];
      toast.success('Great progress! Item marked complete', { description: 'Keep going — your knowledge compounds.' });
    }
    
    setCompletedItems(newCompleted);
    // Persist in demo mode
    if (isDemoMode) {
      storage.setCompletedEducation(newCompleted);
    }
  };

  const toggleChecklistItem = (itemId: string, index: number) => {
    const key = `${itemId}-${index}`;
    const newProgress = { ...checklistProgress, [key]: !checklistProgress[key] };
    setChecklistProgress(newProgress);
    
    // Auto-complete when all items checked
    const item = educationLibrary.find(i => i.id === itemId);
    if (item?.checklistItems) {
      const allChecked = item.checklistItems.every((_, idx) => newProgress[`${itemId}-${idx}`]);
      if (allChecked && !completedItems.includes(itemId)) {
        setTimeout(() => {
          toggleComplete(itemId);
          toast.success('Checklist completed! 🎉');
        }, 600);
      }
    }
  };

  // Step 12: Freemium access helper
  const canAccessEducation = (item: any): boolean => {
    if (item.access === 'free') return true;
    if (isDemoMode) return hasEducationSubscription;
    // For real logged-in users we would check Supabase profile here
    return hasEducationSubscription;
  };

  const openEducation = (item: any) => {
    if (!canAccessEducation(item)) {
      setPaywallResource(item);
      setShowEducationPaywall(true);
      return;
    }
    setSelectedEducation(item);
    // Reset checklist progress for this item if it's a checklist
    if (item.contentType === 'checklist' && item.checklistItems) {
      const initialProgress: Record<string, boolean> = {};
      item.checklistItems.forEach((_: string, idx: number) => {
        initialProgress[`${item.id}-${idx}`] = false;
      });
      setChecklistProgress(prev => ({ ...prev, ...initialProgress }));
    }
  };

  const closeEducationPaywall = () => {
    setShowEducationPaywall(false);
    setPaywallResource(null);
  };

  const upgradeToEducationPro = () => {
    closeEducationPaywall();
    openPayment('education');
  };

  const generateEducationPDF = (item: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(30, 30, 35);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(18);
    doc.text('FLIP PROPERTY COACH', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text('Flip Academy • Premium Resource', pageWidth / 2, 26, { align: 'center' });
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(item.title, 20, 55);
    
    // Meta
    doc.setFontSize(11);
    doc.setTextColor(180, 180, 180);
    doc.text(`${item.type}  •  ${item.duration}  •  ${item.level}  •  ${item.rating}★`, 20, 64);
    
    // Description
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    const splitDesc = doc.splitTextToSize(item.description, pageWidth - 40);
    doc.text(splitDesc, 20, 78);
    
    let y = 78 + (splitDesc.length * 6) + 10;
    
    // Takeaways
    if (item.takeaways) {
      doc.setFontSize(13);
      doc.setTextColor(212, 175, 55);
      doc.text('KEY TAKEAWAYS', 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      item.takeaways.forEach((takeaway: string, i: number) => {
        doc.text(`•  ${takeaway}`, 25, y + (i * 7));
      });
      y += (item.takeaways.length * 7) + 12;
    }
    
    // Checklist items if applicable
    if (item.contentType === 'checklist' && item.checklistItems) {
      doc.setFontSize(13);
      doc.setTextColor(212, 175, 55);
      doc.text('INTERACTIVE CHECKLIST', 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      item.checklistItems.forEach((text: string, i: number) => {
        const checked = checklistProgress[`${item.id}-${i}`] ? '☑' : '☐';
        doc.text(`${checked}  ${text}`, 25, y + (i * 7));
      });
      y += (item.checklistItems.length * 7) + 15;
    }
    
    // Metrics for case studies
    if (item.contentType === 'case-study' && item.metrics) {
      doc.setFontSize(13);
      doc.setTextColor(212, 175, 55);
      doc.text('KEY RESULTS', 20, y);
      y += 10;
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      Object.entries(item.metrics).forEach(([key, value], i) => {
        doc.text(`${key.toUpperCase()}:  ${value}`, 25, y + (i * 8));
      });
      y += (Object.keys(item.metrics).length * 8) + 15;
    }
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Generated from Flip Property Coach • flippropertycoach.com', pageWidth / 2, 285, { align: 'center' });
    doc.text('For educational purposes only. Always seek professional advice.', pageWidth / 2, 291, { align: 'center' });
    
    doc.save(`${item.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    toast.success('PDF downloaded successfully', { description: 'Saved to your Downloads folder' });
    
    // Auto mark as complete after download
    if (!completedItems.includes(item.id)) {
      setTimeout(() => toggleComplete(item.id), 1200);
    }
  };

  const markVideoWatched = (id: string) => {
    if (!completedItems.includes(id)) {
      toggleComplete(id);
    }
    toast.success('Video marked as watched', { description: 'Progress saved to your learning dashboard' });
  };

  // Real Supabase Auth + fallback to Demo
  useEffect(() => {
    let isMounted = true;

    
    const initAuth = async () => {
      try {
        // 1. Check for existing real Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
        }

        if (session?.user && isMounted) {
          // Fetch profile from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Profile fetch error:", profileError);
          }

          const profile = profileData as Database['public']['Tables']['profiles']['Row'] | null;

          if (profile && isMounted) {
            const realUser: User = {
              id: profile.id || session.user.id,
              name: profile.full_name || session.user.email?.split('@')[0] || 'Flipper',
              email: profile.email || session.user.email || '',
              role: profile.role === 'supplier' ? 'supplier' : 'flipper'
            };
            
            setUser(realUser);
            setIsLoggedIn(true);
            setIsDemoMode(false);
            try { storage.setUser(realUser); } catch(e){}
            
            // Load real data directly here instead of relying on state closure!
            const uid = session.user.id;
            try {
              const [dbProjects, dbTeam, dbProps, dbEnquiries] = await Promise.all([
                SupabaseData.getProjects(uid),
                SupabaseData.getTeam(uid),
                SupabaseData.getSavedProperties(uid),
                SupabaseData.getMyLeadsAsFlipper(uid)
              ]);
              
              if (dbProjects && dbProjects.length > 0) {
                setProjects(dbProjects);
                setActiveProjectId(dbProjects[0].id);
                const projId = dbProjects[0].id;
                const [dbTx, dbTodos] = await Promise.all([
                  SupabaseData.getTransactions(projId),
                  SupabaseData.getTodos(projId),
                ]);
                setTransactions(dbTx || []);
                setTodos(dbTodos || []);
              } else {
                const defaultProj = await SupabaseData.createProject(uid, {
                  name: 'My First Flip',
                  propertyAddress: '123 Example Street, London',
                  budget: 85000,
                  spent: 0,
                  status: 'planning',
                  startDate: new Date().toISOString().split('T')[0],
                  targetEndDate: '',
                });
                if (defaultProj) {
                  setProjects([defaultProj]);
                  setActiveProjectId(defaultProj.id);
                }
              }
              setTeam(dbTeam || []);
              setSavedProperties(dbProps || []);
              setMyEnquiries(dbEnquiries || []);
            } catch (dataErr) {
              console.error("Data loading error:", dataErr);
            }
            return; // Real user fully loaded
          }
        }

        // 2. No real session -> fallback to demo
        if (isMounted) {
          let savedUser = null;
          try { savedUser = storage.getUser(); } catch(e){}
          
          if (savedUser) {
            setUser(savedUser);
            setIsLoggedIn(true);
            setIsDemoMode(true);
          } else {
            const demoUser: User = {
              id: 'u1',
              name: 'Alex Thompson',
              email: 'alex@flipdemo.co.uk',
              role: 'flipper'
            };
            setUser(demoUser);
            try { storage.setUser(demoUser); } catch(e){}
            setIsLoggedIn(true);
            setIsDemoMode(true);
          }
          
          // Load demo data
          try {
            const savedTeam = storage.getTeam();
            setTeam(savedTeam.length > 0 ? savedTeam : []);

            const savedProjects = storage.getProjects();
            if (savedProjects.length > 0) {
              setProjects(savedProjects);
            } else {
              setProjects(initialProjects);
            }

            const savedTx = storage.getTransactions();
            if (savedTx.length > 0) setTransactions(savedTx);

            const savedTodos = storage.getTodos();
            if (savedTodos.length > 0) setTodos(savedTodos);

            const savedProps = storage.getSavedProperties();
            setSavedProperties(savedProps);
            
            const demoEnquiries: Lead[] = [
              {
                id: 'enq1',
                supplier_id: 's1',
                flipper_user_id: 'u1',
                flipper_name: 'Alex Thompson',
                project: '12 Oak Street Flip',
                message: 'Hi, looking for a reliable builder for a full house renovation in Manchester. Budget around £45k. Available to start in 3 weeks?',
                status: 'quoted',
                reply_message: 'Thanks Alex — yes we can help. I\'ve attached a rough quote for £42,500 including materials. When would you like to meet on site?',
                created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              },
              {
                id: 'enq2',
                supplier_id: 's3',
                flipper_user_id: 'u1',
                flipper_name: 'Alex Thompson',
                project: '12 Oak Street Flip',
                message: 'Need a good electrician for rewire + new consumer unit on a 3-bed flip. Any availability next month?',
                status: 'new',
                created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
              },
            ];
            setMyEnquiries(demoEnquiries);
          } catch(e) {}
        }
      } catch (err) {
        console.error("Uncaught initAuth error:", err);
        // FORCE login as demo to avoid stuck loading screen
        if (isMounted) {
          const fallbackUser: User = {
            id: 'err-fallback',
            name: 'Offline User',
            email: 'offline@flipdemo.co.uk',
            role: 'flipper'
          };
          setUser(fallbackUser);
          setIsLoggedIn(true);
          setIsDemoMode(true);
        }
      }
    };

    initAuth();

    // Listen for magic link sign-ins / sign-outs
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        const profile = profileData as Database['public']['Tables']['profiles']['Row'] | null;

        if (profile) {
          const realUser: User = {
            id: profile.id,
            name: profile.full_name || session.user.email?.split('@')[0] || 'Flipper',
            email: profile.email || session.user.email || '',
            role: profile.role === 'supplier' ? 'supplier' : 'flipper'
          };
          setUser(realUser);
          setIsLoggedIn(true);
          setIsDemoMode(false);
          storage.setUser(realUser);
          toast.success(`Welcome${profile.full_name ? ', ' + profile.full_name.split(' ')[0] : ''}!`);
        }
      }

      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUser(null);
        setIsDemoMode(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Persist on change
  useEffect(() => { if (team.length > 0) storage.setTeam(team); }, [team]);
  useEffect(() => { storage.setProjects(projects); }, [projects]);
  useEffect(() => { storage.setTransactions(transactions); }, [transactions]);
  useEffect(() => { storage.setTodos(todos); }, [todos]);
  useEffect(() => { storage.setSavedProperties(savedProperties); }, [savedProperties]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Filtered suppliers
  const filteredSuppliers = mockSuppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(mockSuppliers.map(s => s.category)))];

  // Team helpers
  const isInTeam = (supplierId: string) => team.some(t => t.supplierId === supplierId);

  const addToTeam = (supplier: Supplier) => {
    if (isInTeam(supplier.id)) return;
    
    const newMember: TeamMember = {
      id: 'tm' + Date.now(),
      supplierId: supplier.id,
      name: supplier.name,
      category: supplier.category,
      addedAt: new Date().toISOString()
    };
    setTeam([...team, newMember]);
    toast.success(`${supplier.name} added to your team`);
  };

  const removeFromTeam = (memberId: string) => {
    setTeam(team.filter(t => t.id !== memberId));
    toast.info('Removed from team');
  };

  // Property save
  const saveProperty = (property: Property) => {
    if (savedProperties.some(p => p.id === property.id)) return;
    setSavedProperties([...savedProperties, property]);
    toast.success('Property saved to your watchlist');
  };

  const removeProperty = (propertyId: string) => {
    setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
    toast.success('Removed from watchlist');
  };

  // ==================== FULL CONTACT SUPPLIER FLOW FROM FIND ====================
  const contactSupplier = (supplier: Supplier) => {
    setSelectedSupplierForContact(supplier);
    setContactProject(activeProject?.name || 'My Flip Project');
    setContactMessage(
      `Hi ${supplier.name.split(' ')[0]},\n\n` +
      `I'm currently planning a property flip and would love to get a quote from you for ${supplier.category.toLowerCase()} work.\n\n` +
      `Could you please let me know your availability and rough pricing for a typical job?\n\n` +
      `Looking forward to hearing from you.\n\n` +
      `Best regards,\nAlex`
    );
    setShowContactModal(true);
  };

  const sendEnquiry = async () => {
    if (!selectedSupplierForContact || !contactMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const supplier = selectedSupplierForContact;

    if (isDemoMode) {
      // Demo mode - add to local state so it appears in My Enquiries
      const newEnquiry: Lead = {
        id: 'lead-' + Date.now(),
        supplier_id: supplier.id,
        flipper_name: 'Alex Thompson (Demo)',
        project: contactProject.trim() || 'My Flip Project',
        message: contactMessage.trim(),
        status: 'new',
        created_at: new Date().toISOString(),
      };
      setMyEnquiries(prev => [newEnquiry, ...prev]);
      toast.success(`Enquiry sent to ${supplier.name}`, {
        description: 'Demo mode — check the My Enquiries tab to see it and simulate replies.',
      });
    } else if (user?.id) {
      // Real Supabase user
      const result = await SupabaseData.createLead({
        supplierId: supplier.id,
        flipperUserId: user.id,
        flipperName: user.name || 'Flipper User',
        project: contactProject.trim() || 'My Flip Project',
        message: contactMessage.trim(),
      });

      if (result) {
        toast.success(`Enquiry sent to ${supplier.name}!`, {
          description: 'The supplier has been notified in real-time. Track replies in My Enquiries.',
        });
        // If currently viewing enquiries, refresh the list
        if (currentView === 'enquiries' && user.id) {
          const fresh = await SupabaseData.getMyLeadsAsFlipper(user.id);
          setMyEnquiries(fresh);
        }
      } else {
        toast.error('Failed to send enquiry. Please try again in a moment.');
      }
    }

    // Close modal
    setShowContactModal(false);
    setSelectedSupplierForContact(null);
    setContactMessage('');
    setContactProject('');
  };

  // Todo management
  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTodo = async () => {
    if (!newTodoText.trim()) return;
    const newTodo: Todo = {
      id: 'td' + Date.now(),
      projectId: activeProjectId,
      text: newTodoText.trim(),
      completed: false,
      dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd')
    };
    setTodos(prev => [...prev, newTodo]);
    setNewTodoText('');
    setShowAddTodo(false);
    toast.success('Task added');
    // Persist to Supabase for real users
    if (!isDemoMode && user?.id) {
      try {
        await SupabaseData.addTodo(user.id, { ...newTodo });
      } catch (e) {
        console.error('Failed to persist todo:', e);
      }
    }
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    toast.success('Task removed');
  };

  const projectTodos = todos.filter(t => t.projectId === activeProjectId);

  // Cashflow calculations
  const projectTransactions = transactions.filter(t => t.projectId === activeProjectId);
  
  const totalIncome = projectTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = projectTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentProfit = totalIncome - totalExpenses;
  const budgetUsed = activeProject ? (activeProject.spent / activeProject.budget) * 100 : 0;

  // Chart data — derived from real transactions
  const cashflowData = (() => {
    const monthMap: Record<string, { month: string; income: number; expenses: number }> = {};
    projectTransactions.forEach(tx => {
      const m = tx.date ? format(new Date(tx.date), 'MMM') : 'Unknown';
      if (!monthMap[m]) monthMap[m] = { month: m, income: 0, expenses: 0 };
      if (tx.type === 'income') monthMap[m].income += tx.amount;
      else monthMap[m].expenses += tx.amount;
    });
    const entries = Object.values(monthMap);
    return entries.length > 0 ? entries : [{ month: format(new Date(), 'MMM'), income: 0, expenses: 0 }];
  })();

  const expenseBreakdown = (() => {
    const catMap: Record<string, number> = {};
    projectTransactions.filter(tx => tx.type === 'expense').forEach(tx => {
      catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
    });
    const entries = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    return entries.length > 0 ? entries : [{ name: 'No expenses yet', value: 1 }];
  })();

  // Add transaction
  const addTransaction = async () => {
    if (!newTx.description || newTx.amount <= 0) return;
    const tx: Transaction = {
      id: 'tx' + Date.now(),
      projectId: activeProjectId,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: newTx.description,
      category: newTx.category,
      amount: newTx.amount,
      type: newTx.type
    };
    setTransactions(prev => [...prev, tx]);
    if (newTx.type === 'expense') {
      setProjects(prev => prev.map(p => 
        p.id === activeProjectId ? { ...p, spent: p.spent + newTx.amount } : p
      ));
    }
    setNewTx({ description: '', amount: 0, type: 'expense', category: 'Materials' });
    setShowAddTransaction(false);
    toast.success('Transaction added');
    // Persist to Supabase for real users
    if (!isDemoMode && user?.id) {
      try {
        await SupabaseData.addTransaction(user.id, { ...tx });
      } catch (e) {
        console.error('Failed to persist transaction:', e);
      }
    }
  };

  const deleteTransaction = async (txId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== txId));
    toast.success('Transaction removed');
  };

  // Export CSV for accountant
  const exportCashflowCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = projectTransactions.map(tx => 
      [tx.date, tx.description, tx.category, tx.type, tx.amount]
    );
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject?.name || 'project'}-cashflow.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV exported for your accountant');
  };

  // Payment handler - Real Stripe when logged in as real user, simulation in Demo Mode
  const openPayment = (type: 'education' | 'ad-yearly' | 'ad-lead') => {
    setPaymentType(type);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    setShowPaymentModal(false);

    if (isDemoMode) {
      // Demo mode - beautiful simulation
      if (paymentType === 'education') {
        setHasEducationSubscription(true);
        toast.success('🎉 Education subscription activated! Welcome to Flip Academy Pro.', { 
          description: 'You now have full access to all premium resources.',
          duration: 6000 
        });
      } else if (paymentType === 'ad-yearly') {
        toast.success('Thank you! Your premium supplier listing is now live for 12 months. (Demo)', { duration: 5000 });
      } else {
        toast.success('Lead purchased. The supplier will contact you within 24 hours. (Demo)', { duration: 5000 });
      }
      return;
    }

    // Real user → Create Stripe Checkout Session
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentType,
          userEmail: user?.email,
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to start checkout');
      }
    } catch (error: any) {
      toast.error('Could not start payment. Please try again or contact support.');
      console.error(error);
    }
  };

  // Handle Stripe redirect success/cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      toast.success('🎉 Payment successful! Thank you. Your access is now active.', { duration: 6000 });
      // Clean URL
      window.history.replaceState({}, '', '/dashboard');
    }
    if (params.get('payment') === 'cancelled') {
      toast('Payment cancelled. No charges were made.', { duration: 4000 });
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    storage.clearUser();
    storage.clearAll();
    window.location.href = '/login';
  };

  if (!isLoggedIn || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Top Navigation */}
      <nav className="border-b border-white/10 bg-[#0F172A]/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="FLIP Property Coach" 
                className="h-9 w-auto" 
              />
            </div>

            {/* Project Switcher */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/50">Project:</span>
              <select 
                value={activeProjectId}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-[#1E2937] border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-medium flex items-center justify-end gap-2">
                {user.name}
                {isDemoMode && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono tracking-wider">DEMO</span>
                )}
              </div>
              <div className="text-white/50 text-xs">{user.email}</div>
            </div>
            <Link 
              href="/supplier-dashboard"
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-2xl border border-white/20 hover:bg-white/5 text-sm font-medium transition-colors"
            >
              Supplier Hub <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button 
              onClick={() => setCurrentView('enquiries')}
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-2xl border border-white/20 hover:bg-white/5 text-sm font-medium transition-colors"
            >
              My Enquiries <Inbox className="w-3.5 h-3.5" />
            </button>

            <NotificationBell 
              userId={isDemoMode ? null : user.id} 
              role="flipper" 
            />

            <PushNotificationManager userId={isDemoMode ? null : user.id} />

            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              title={isDemoMode ? "Exit Demo" : "Sign out"}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The 4 Big Quadrant Buttons */}
        <div className="max-w-7xl mx-auto px-6 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'find' as View, label: 'FIND', icon: Users, desc: 'Suppliers & Properties' },
              { id: 'finance' as View, label: 'FINANCE', icon: TrendingUp, desc: 'Cashflow & Budgets' },
              { id: 'flip' as View, label: 'FLIP', icon: Award, desc: 'Projects & Team' },
              { id: 'educate' as View, label: 'EDUCATE', icon: Play, desc: 'Academy & Resources' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`big-button text-left p-5 flex-row items-start gap-4 ${isActive ? 'ring-2 ring-[#D4AF37] border-[#D4AF37]' : ''}`}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className={`p-3 rounded-2xl ${isActive ? 'bg-[#D4AF37] text-[#0F172A]' : 'bg-white/10'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-2xl tracking-tight">{item.label}</div>
                      <div className="text-white/60 text-sm">{item.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* FIND VIEW */}
        {currentView === 'find' && (
          <div className="content-view">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h1 className="text-5xl font-semibold tracking-tight">Find</h1>
                <p className="text-white/60 mt-1">Build your trusted network of suppliers and discover properties</p>
              </div>
              <button onClick={() => openPayment('ad-lead')} className="btn-secondary flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Buy a Lead
              </button>
            </div>

            {/* Suppliers Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Trusted Suppliers</h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-72"
                  />
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input w-48"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuppliers.map(supplier => (
                  <div key={supplier.id} className="supplier-card card p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-xl">{supplier.name}</div>
                        <div className="text-[#D4AF37] text-sm">{supplier.category} • {supplier.location}</div>
                      </div>
                      {supplier.verified && <div className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">Verified</div>}
                    </div>
                    
                    <p className="text-white/70 text-sm mt-3 line-clamp-2">{supplier.description}</p>
                    
                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <div>⭐ {supplier.rating} ({supplier.reviews})</div>
                      <div className="text-white/50">{supplier.priceRange}</div>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button 
                        onClick={() => addToTeam(supplier)}
                        disabled={isInTeam(supplier.id)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${isInTeam(supplier.id) ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-[#D4AF37] text-[#0F172A] hover:bg-[#F59E0B]'}`}
                      >
                        {isInTeam(supplier.id) ? 'In Your Team ✓' : 'Add to My Team'}
                      </button>
                      <button 
                        onClick={() => contactSupplier(supplier)} 
                        className="btn-secondary px-5 text-sm"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Properties Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Properties Worth Flipping</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {mockProperties.map(prop => (
                  <div key={prop.id} className="property-card card p-6">
                    <div className="font-semibold text-lg mb-1">{prop.address}</div>
                    <div className="text-3xl font-semibold tracking-tight text-[#D4AF37]">£{prop.price.toLocaleString()}</div>
                    <div className="text-emerald-400 text-sm mt-1">Potential profit: £{prop.potentialProfit.toLocaleString()}</div>
                    
                    <div className="flex gap-4 text-sm mt-4 text-white/70">
                      <div>{prop.bedrooms} beds</div>
                      <div>{prop.type}</div>
                      <div className="text-amber-400">{prop.status}</div>
                    </div>

                    {savedProperties.some(p => p.id === prop.id) ? (
                      <button 
                        onClick={() => removeProperty(prop.id)}
                        className="mt-5 w-full py-2.5 rounded-xl text-sm font-medium bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all"
                      >
                        ✓ Saved — Click to Remove
                      </button>
                    ) : (
                      <button 
                        onClick={() => saveProperty(prop)}
                        className="mt-5 w-full btn-secondary text-sm py-2.5"
                      >
                        Save to Watchlist
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FINANCE VIEW */}
        {currentView === 'finance' && (
          <div className="content-view">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-5xl font-semibold tracking-tight">Finance</h1>
                <p className="text-white/60">Real-time visibility. Accountant-ready exports.</p>
              </div>
              <button onClick={exportCashflowCSV} className="btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" /> Export CSV for Accountant
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="metric-card">
                <div className="text-white/50 text-sm">Project Budget</div>
                <div className="text-4xl font-semibold tracking-tight mt-1">£{activeProject?.budget.toLocaleString()}</div>
              </div>
              <div className="metric-card">
                <div className="text-white/50 text-sm">Spent to Date</div>
                <div className="text-4xl font-semibold tracking-tight mt-1 text-amber-400">£{activeProject?.spent.toLocaleString()}</div>
                <div className="text-xs text-white/50 mt-1">{budgetUsed.toFixed(0)}% of budget</div>
              </div>
              <div className="metric-card">
                <div className="text-white/50 text-sm">Current Profit / (Loss)</div>
                <div className={`text-4xl font-semibold tracking-tight mt-1 ${currentProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  £{currentProfit.toLocaleString()}
                </div>
              </div>
              <div className="metric-card">
                <div className="text-white/50 text-sm">Remaining Budget</div>
                <div className="text-4xl font-semibold tracking-tight mt-1">£{((activeProject?.budget || 0) - (activeProject?.spent || 0)).toLocaleString()}</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-5 gap-6 mb-8">
              <div className="lg:col-span-3 card p-6">
                <div className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#D4AF37]" /> Cashflow Trend</div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cashflowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: '#1E2937', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444' }} />
                      <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-2 card p-6">
                <div className="font-semibold mb-4">Expense Breakdown</div>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value">
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  {expenseBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      {item.name}: £{item.value.toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold">Recent Transactions</div>
                <button onClick={() => setShowAddTransaction(true)} className="btn-primary text-sm flex items-center gap-2 px-4 py-2">
                  <Plus className="w-4 h-4" /> Add Transaction
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50">
                      <th className="text-left py-3 font-normal">Date</th>
                      <th className="text-left py-3 font-normal">Description</th>
                      <th className="text-left py-3 font-normal">Category</th>
                      <th className="text-right py-3 font-normal">Amount</th>
                      <th className="py-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectTransactions.length > 0 ? projectTransactions.map(tx => (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 group">
                        <td className="py-3 text-white/70">{tx.date}</td>
                        <td className="py-3">{tx.description}</td>
                        <td className="py-3 text-white/60">{tx.category}</td>
                        <td className={`py-3 text-right font-medium ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}£{tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3 pl-3">
                          <button onClick={() => deleteTransaction(tx.id)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="py-8 text-center text-white/50">No transactions yet. Add your first one above.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FLIP VIEW (Project Management + Team) */}
        {currentView === 'flip' && (
          <div className="content-view">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-5xl font-semibold tracking-tight">Flip</h1>
                <p className="text-white/60">Project execution. Your team. Milestones.</p>
              </div>
              <button onClick={() => setShowAddTodo(true)} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Project Overview */}
              <div className="lg:col-span-5 card p-8">
                <div className="uppercase text-xs tracking-[2px] text-[#D4AF37] mb-1">ACTIVE PROJECT</div>
                <div className="text-4xl font-semibold tracking-tight mb-1">{activeProject?.name}</div>
                <div className="text-white/60 mb-6">{activeProject?.propertyAddress}</div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between"><span className="text-white/60">Status</span> <span className="font-medium capitalize">{activeProject?.status.replace('-', ' ')}</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Start Date</span> <span>{activeProject?.startDate}</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Target Completion</span> <span>{activeProject?.targetEndDate}</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Budget Used</span> <span className="font-medium">{budgetUsed.toFixed(0)}%</span></div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/50">
                  Next milestone: Kitchen fit-out • Due 12 May
                </div>
              </div>

              {/* To-Do List */}
              <div className="lg:col-span-7 card p-8">
                <div className="font-semibold mb-4 flex items-center gap-2"><CheckCircle className="text-[#D4AF37]" /> To-Do List</div>
                
                <div className="space-y-2 mb-4">
                  {projectTodos.length > 0 ? projectTodos.map(todo => (
                    <div 
                      key={todo.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${todo.completed ? 'bg-white/5' : 'hover:bg-white/5'}`}
                    >
                      <div onClick={() => toggleTodo(todo.id)} className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center cursor-pointer ${todo.completed ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-white/30'}`}>
                        {todo.completed && <CheckCircle className="w-3.5 h-3.5 text-[#0F172A]" />}
                      </div>
                      <div onClick={() => toggleTodo(todo.id)} className={`flex-1 cursor-pointer ${todo.completed ? 'line-through text-white/50' : ''}`}>{todo.text}</div>
                      {todo.dueDate && <div className="text-xs text-white/40 tabular-nums">{todo.dueDate}</div>}
                      <button onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all ml-1 flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )) : <div className="text-white/50 py-4">No tasks yet. Add one!</div>}
                </div>
              </div>

              {/* Your Team */}
              <div className="lg:col-span-12 card p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="font-semibold text-xl">Your Flipping Team</div>
                    <div className="text-white/60 text-sm">Suppliers you&apos;ve added from the FIND section</div>
                  </div>
                  <div className="text-sm text-white/50">{team.length} members</div>
                </div>

                {team.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {team.map(member => (
                      <div key={member.id} className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 flex justify-between">
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-[#D4AF37] text-sm">{member.category}</div>
                        </div>
                        <button onClick={() => removeFromTeam(member.id)} className="text-white/40 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/50">
                    Your team is empty. Go to the <button onClick={() => setCurrentView('find')} className="text-[#D4AF37] underline">FIND</button> section to add suppliers.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EDUCATE VIEW - Step 9: Fully Polished & Seeded with Real Value */}
        {currentView === 'educate' && (
          <div className="content-view">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium tracking-widest">FLIP ACADEMY</div>
                  <div className="flex items-center gap-1 text-xs text-white/50">
                    <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" /> 4.8 average rating
                  </div>
                </div>
                <h1 className="text-5xl font-semibold tracking-tight">Educate</h1>
                <p className="text-white/60 mt-1">Level up your flipping game with expert knowledge, templates and real case studies</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-sm">
                  <div className="text-white/60">Your progress</div>
                  <div className="font-semibold text-[#D4AF37]">{completedItems.length} / {educationLibrary.length} completed</div>
                </div>
                {hasEducationSubscription ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> Flip Academy Pro
                  </div>
                ) : (
                  <button onClick={() => openPayment('education')} className="btn-primary flex items-center gap-2 px-6 whitespace-nowrap">
                    <CreditCard className="w-4 h-4" /> Subscribe £29/mo — Unlock All
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center"><BookOpen className="w-5 h-5 text-[#D4AF37]" /></div>
                <div>
                  <div className="text-2xl font-semibold">3 Free + 6 Premium</div>
                  <div className="text-xs text-white/50 -mt-1">Total Resources</div>
                </div>
              </div>
              <div className="card p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center"><Video className="w-5 h-5 text-[#D4AF37]" /></div>
                <div>
                  <div className="text-2xl font-semibold">4</div>
                  <div className="text-xs text-white/50 -mt-1">Video Courses & Replays</div>
                </div>
              </div>
              <div className="card p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center"><FileText className="w-5 h-5 text-[#D4AF37]" /></div>
                <div>
                  <div className="text-2xl font-semibold">3</div>
                  <div className="text-xs text-white/50 -mt-1">Downloadable Templates & Guides</div>
                </div>
              </div>
              <div className="card p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center"><Trophy className="w-5 h-5 text-[#D4AF37]" /></div>
                <div>
                  <div className="text-2xl font-semibold">2,847</div>
                  <div className="text-xs text-white/50 -mt-1">Flippers learning right now</div>
                </div>
              </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-4 text-white/40 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search videos, templates, case studies..."
                  value={educationSearch}
                  onChange={(e) => setEducationSearch(e.target.value)}
                  className="input w-full pl-11"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(['All', 'Videos', 'Templates', 'Case Studies', 'Cheat Sheets', 'Webinars'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setEducationCategory(cat)}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${educationCategory === cat 
                      ? 'bg-[#D4AF37] text-[#0F172A]' 
                      : 'bg-white/5 hover:bg-white/10 text-white/70'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Education Grid */}
            {filteredEducation.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-white/60">No resources match your search. Try broadening your filters.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEducation.map((item) => {
                  const Icon = item.icon;
                  const isCompleted = completedItems.includes(item.id);
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => openEducation(item)}
                      className="card p-7 group hover:border-[#D4AF37]/40 cursor-pointer flex flex-col h-full"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-xs uppercase tracking-[2px] text-[#D4AF37] font-medium">{item.type}</div>
                        <div className="flex items-center gap-2">
                          {item.access === 'premium' && !canAccessEducation(item) && (
                            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-semibold tracking-widest">
                              PREMIUM
                            </div>
                          )}
                          {isCompleted && (
                            <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> COMPLETED
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/10 transition-colors">
                          <Icon className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-2xl leading-tight tracking-tight mb-1 group-hover:text-[#D4AF37] transition-colors pr-2">{item.title}</div>
                          <div className="flex items-center gap-3 text-xs text-white/50">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration}</span>
                            <span>{item.level}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-white/70 line-clamp-3 mb-5 flex-1">{item.description}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                          <span className="font-medium">{item.rating}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEducation(item); }}
                          className="text-sm font-medium text-[#D4AF37] hover:text-white flex items-center gap-1.5 group-hover:gap-2 transition-all"
                        >
                          {item.contentType === 'video' ? 'Watch now' : 
                           item.contentType === 'pdf' ? 'Download PDF' : 
                           item.contentType === 'checklist' ? 'Open checklist' : 'View case study'} 
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 text-center text-xs text-white/40">
              All resources included with Flip Academy subscription. Cancel anytime. New content added monthly.
            </div>
          </div>
        )}

        {/* MY ENQUIRIES VIEW - New tab for tracking sent leads & replies */}
        {currentView === 'enquiries' && (
          <div className="content-view">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h1 className="text-5xl font-semibold tracking-tight">My Enquiries</h1>
                <p className="text-white/60 mt-1">All messages you've sent to suppliers and their replies — in one place</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={async () => {
                    if (!isDemoMode && user) {
                      const fresh = await SupabaseData.getMyLeadsAsFlipper(user.id);
                      setMyEnquiries(fresh);
                      toast.success('Enquiries refreshed');
                    } else {
                      toast.info('Demo data refreshed');
                    }
                  }} 
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Refresh
                </button>
                <button 
                  onClick={() => setCurrentView('find')} 
                  className="btn-primary flex items-center gap-2"
                >
                  Find More Suppliers <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {myEnquiries.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="mx-auto w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <Inbox className="w-8 h-8 text-white/40" />
                </div>
                <div className="text-2xl font-semibold mb-2">No enquiries yet</div>
                <p className="text-white/60 max-w-md mx-auto">Start building your pipeline. Go to the FIND section, browse suppliers, and send your first message.</p>
                <button onClick={() => setCurrentView('find')} className="btn-primary mt-8">Browse Suppliers</button>
              </div>
            ) : (
              <div className="card overflow-hidden border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 text-white/60 uppercase text-xs tracking-widest">
                      <tr>
                        <th className="text-left px-6 py-4 font-medium">Date</th>
                        <th className="text-left px-6 py-4 font-medium">Supplier</th>
                        <th className="text-left px-6 py-4 font-medium">Project / Enquiry</th>
                        <th className="text-left px-6 py-4 font-medium">Status</th>
                        <th className="text-left px-6 py-4 font-medium">Supplier Reply</th>
                        <th className="text-right px-6 py-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {myEnquiries.map((enq) => {
                        // Try to resolve supplier name from mock data for nice display
                        const supplierInfo = mockSuppliers.find(s => s.id === enq.supplier_id);
                        const supplierName = supplierInfo ? supplierInfo.name : `Supplier #${enq.supplier_id.slice(0,6)}`;
                        
                        const statusColors: Record<string, string> = {
                          new: 'bg-blue-500/20 text-blue-400',
                          contacted: 'bg-amber-500/20 text-amber-400',
                          quoted: 'bg-emerald-500/20 text-emerald-400',
                          closed: 'bg-white/10 text-white/60',
                        };
                        
                        return (
                          <tr key={enq.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-5 text-white/70 tabular-nums text-xs">
                              {new Date(enq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </td>
                            <td className="px-6 py-5 font-medium">{supplierName}</td>
                            <td className="px-6 py-5">
                              <div className="font-medium text-white/90 line-clamp-1">{enq.project || 'General Enquiry'}</div>
                              <div className="text-xs text-white/50 line-clamp-2 mt-0.5 max-w-[280px]">{enq.message}</div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[enq.status] || 'bg-white/10'}`}>
                                {enq.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-sm max-w-[260px]">
                              {enq.reply_message ? (
                                <div className="text-emerald-400/90 line-clamp-2">{enq.reply_message}</div>
                              ) : (
                                <span className="text-white/40 italic text-xs">Awaiting reply...</span>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    // Simple detail view via toast for now (can expand to full modal later)
                                    const detail = `Enquiry to ${supplierName}\n\nYour message:\n${enq.message}\n\n${enq.reply_message ? 'Supplier reply:\n' + enq.reply_message : 'No reply yet.'}`;
                                    toast.info(detail, { duration: 8000 });
                                  }}
                                  className="text-xs px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                                >
                                  View Thread
                                </button>
                                <button 
                                  onClick={async () => {
                                    const newStatus = enq.status === 'new' ? 'contacted' : enq.status === 'contacted' ? 'quoted' : 'closed';
                                    if (!isDemoMode) {
                                      await SupabaseData.updateLeadStatus(enq.id, newStatus as any);
                                    }
                                    // Update local state
                                    setMyEnquiries(prev => prev.map(e => e.id === enq.id ? { ...e, status: newStatus as any } : e));
                                    toast.success(`Status updated to ${newStatus}`);
                                  }}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                  Update Status
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-white/5 text-xs text-white/50 flex items-center justify-between">
                  <div>Real-time updates appear here automatically when suppliers reply (check the bell icon too).</div>
                  <div className="text-[#D4AF37] cursor-pointer hover:underline" onClick={() => setCurrentView('find')}>Contact more suppliers →</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Ad Space (Premium) */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-r from-[#1E2937] to-[#0F172A] border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-[#D4AF37] text-xs tracking-[3px] font-semibold mb-1">PREMIUM ADVERTISING SPACE</div>
            <div className="text-2xl font-semibold tracking-tight">Get in front of serious flippers</div>
            <div className="text-white/60">One-time yearly placement or pay-per-lead. High intent audience.</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => openPayment('ad-yearly')} className="btn-primary px-8">£1,200 / year</button>
            <button onClick={() => openPayment('ad-lead')} className="btn-secondary px-8">£45 per qualified lead</button>
          </div>
        </div>
      </div>

      {/* Payment Modal (Stripe simulation) */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-6" onClick={() => setShowPaymentModal(false)}>
          <div className="card max-w-md w-full p-8 modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X /></button>
            
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mb-4">
                <CreditCard className="w-7 h-7 text-[#D4AF37]" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight">
                {paymentType === 'education' && 'Flip Academy Subscription'}
                {paymentType === 'ad-yearly' && 'Premium Supplier Listing (12 months)'}
                {paymentType === 'ad-lead' && 'Purchase Qualified Lead'}
              </h3>
            </div>

            <div className="bg-[#0F172A] rounded-2xl p-5 mb-6 text-sm">
              {paymentType === 'education' && (
                <>Unlimited access to all courses, templates, case studies and live sessions. Billed monthly. Cancel anytime.</>
              )}
              {paymentType === 'ad-yearly' && (
                <>Your profile appears at the top of every relevant search for 12 months. Includes analytics dashboard.</>
              )}
              {paymentType === 'ad-lead' && (
                <>Instant introduction to a serious flipper actively looking for your exact service right now.</>
              )}
            </div>

            <button 
              onClick={handlePayment}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              {paymentType === 'education' && 'Subscribe for £29 / month'}
              {paymentType === 'ad-yearly' && 'Pay £1,200 for 12 months'}
              {paymentType === 'ad-lead' && 'Pay £45 for this lead'}
            </button>
            
            <p className="text-center text-[10px] text-white/40 mt-4">Powered by Stripe • Secure checkout</p>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-6" onClick={() => setShowAddTransaction(false)}>
          <div className="card w-full max-w-md p-7 modal" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-xl mb-5">Add Transaction</h3>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Description e.g. New boiler" 
                value={newTx.description} 
                onChange={e => setNewTx({...newTx, description: e.target.value})} 
                className="input" 
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Amount" 
                  value={newTx.amount || ''} 
                  onChange={e => setNewTx({...newTx, amount: parseFloat(e.target.value) || 0})} 
                  className="input" 
                />
                <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value as any})} className="input">
                  <option value="expense">Expense</option>
                  <option value="income">Income / Sale</option>
                </select>
              </div>
              <select value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} className="input">
                <option>Materials</option>
                <option>Labour</option>
                <option>Purchase</option>
                <option>Professional Fees</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddTransaction(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={addTransaction} className="btn-primary flex-1">Add Transaction</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Todo Modal */}
      {showAddTodo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-6" onClick={() => setShowAddTodo(false)}>
          <div className="card w-full max-w-md p-7 modal" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-xl mb-5">Add New Task</h3>
            <input 
              type="text" 
              placeholder="What needs to be done?" 
              value={newTodoText} 
              onChange={e => setNewTodoText(e.target.value)} 
              className="input mb-4" 
              onKeyDown={e => e.key === 'Enter' && addTodo()}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddTodo(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={addTodo} className="btn-primary flex-1">Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CONTACT SUPPLIER MODAL (Full flow from FIND) ==================== */}
      {showContactModal && selectedSupplierForContact && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[130] p-4 md:p-8" onClick={() => setShowContactModal(false)}>
          <div 
            className="card w-full max-w-2xl modal" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-2xl tracking-tight">Send Enquiry</h3>
                    <p className="text-white/60 text-sm">to {selectedSupplierForContact.name}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowContactModal(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Supplier quick info */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                <div>
                  <div className="font-semibold">{selectedSupplierForContact.name}</div>
                  <div className="text-sm text-[#D4AF37]">{selectedSupplierForContact.category} • {selectedSupplierForContact.location}</div>
                </div>
                <div className="ml-auto text-right text-sm">
                  <div>⭐ {selectedSupplierForContact.rating}</div>
                  <div className="text-white/50">{selectedSupplierForContact.priceRange}</div>
                </div>
              </div>

              {/* Project context */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Which project is this for?</label>
                <input
                  type="text"
                  value={contactProject}
                  onChange={(e) => setContactProject(e.target.value)}
                  className="input w-full"
                  placeholder="e.g. 42 Oak Street Flip"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Your message to the supplier</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={8}
                  className="input w-full resize-y min-h-[160px] font-light"
                  placeholder="Describe the work you need..."
                />
                <p className="text-xs text-white/50 mt-1.5">Be as specific as possible — suppliers reply faster to detailed enquiries.</p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 p-8 pt-0">
              <button 
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedSupplierForContact(null);
                  setContactMessage('');
                }} 
                className="btn-secondary flex-1 py-3"
              >
                Cancel
              </button>
              <button 
                onClick={sendEnquiry} 
                disabled={!contactMessage.trim()}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4" /> Send Enquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDUCATION DETAIL MODAL (Step 9) ==================== */}
      {selectedEducation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] p-4 md:p-8" onClick={closeEducation}>
          <div 
            className="card w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col modal" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-8 pb-6 border-b border-white/10">
              <div className="flex-1 pr-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium tracking-widest">{selectedEducation.type}</div>
                  <div className="flex items-center gap-1 text-sm text-white/60">
                    <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" /> {selectedEducation.rating}
                  </div>
                  {completedItems.includes(selectedEducation.id) && (
                    <div className="ml-2 flex items-center gap-1.5 text-emerald-400 text-xs font-medium px-3 py-1 bg-emerald-500/10 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> COMPLETED
                    </div>
                  )}
                </div>
                <h2 className="text-3xl font-semibold tracking-tight pr-4">{selectedEducation.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {selectedEducation.duration}</span>
                  <span>{selectedEducation.level}</span>
                </div>
              </div>
              <button onClick={closeEducation} className="text-white/60 hover:text-white p-2 -mr-2 -mt-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Description */}
              <div>
                <p className="text-lg text-white/80 leading-relaxed">{selectedEducation.description}</p>
              </div>

              {/* VIDEO CONTENT */}
              {selectedEducation.contentType === 'video' && (
                <div>
                  <div className="aspect-video bg-[#0A0A0C] rounded-3xl flex flex-col items-center justify-center border border-white/10 mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_0.8px,transparent_1px)] bg-[length:4px_4px]"></div>
                    <button 
                      onClick={() => markVideoWatched(selectedEducation.id)}
                      className="w-20 h-20 rounded-full bg-[#D4AF37] flex items-center justify-center hover:bg-[#F59E0B] active:scale-95 transition-all z-10 shadow-2xl"
                    >
                      <Play className="w-9 h-9 text-[#0F172A] ml-1" />
                    </button>
                    <div className="mt-6 text-center z-10">
                      <div className="text-white font-medium">Click to play full video</div>
                      <div className="text-white/50 text-sm mt-1">HD • {selectedEducation.duration}</div>
                    </div>
                  </div>

                  {selectedEducation.videoChapters && (
                    <div>
                      <div className="font-semibold mb-3 text-sm tracking-widest text-white/60">CHAPTERS</div>
                      <div className="grid md:grid-cols-2 gap-2">
                        {selectedEducation.videoChapters.map((chapter: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl text-sm">
                            <div className="text-[#D4AF37] font-mono text-xs w-6">{(idx+1).toString().padStart(2, '0')}</div>
                            <div>{chapter}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PDF / DOWNLOADABLE CONTENT */}
              {selectedEducation.contentType === 'pdf' && (
                <div className="card p-8 bg-white/5 border border-white/10">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-xl mb-2">Downloadable PDF Resource</div>
                      <p className="text-white/70 mb-6">Professional, printer-friendly guide you can save and reference on every project.</p>
                      <button 
                        onClick={() => generateEducationPDF(selectedEducation)}
                        className="btn-primary flex items-center gap-3 px-8"
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CHECKLIST CONTENT */}
              {selectedEducation.contentType === 'checklist' && selectedEducation.checklistItems && (
                <div>
                  <div className="font-semibold mb-4 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-[#D4AF37]" /> Interactive Compliance Checklist
                  </div>
                  <div className="space-y-2">
                    {selectedEducation.checklistItems.map((text: string, idx: number) => {
                      const key = `${selectedEducation.id}-${idx}`;
                      const checked = checklistProgress[key] || false;
                      return (
                        <label 
                          key={idx}
                          className="flex items-start gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer transition-colors"
                        >
                          <input 
                            type="checkbox" 
                            checked={checked}
                            onChange={() => toggleChecklistItem(selectedEducation.id, idx)}
                            className="mt-1 w-5 h-5 accent-[#D4AF37] cursor-pointer"
                          />
                          <span className={`text-base leading-tight ${checked ? 'line-through text-white/50' : 'text-white/90'}`}>{text}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-white/50 mt-4">Check items off as you complete them. Progress is saved automatically.</p>
                </div>
              )}

              {/* CASE STUDY CONTENT */}
              {selectedEducation.contentType === 'case-study' && selectedEducation.metrics && (
                <div>
                  <div className="font-semibold mb-4 text-sm tracking-widest text-white/60">KEY RESULTS</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {Object.entries(selectedEducation.metrics).map(([key, value]) => (
                      <div key={key} className="card p-5 text-center">
                        <div className="text-xs uppercase tracking-widest text-white/50 mb-1">{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="text-3xl font-semibold text-[#D4AF37]">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Takeaways (common to most) */}
              {selectedEducation.takeaways && (
                <div>
                  <div className="font-semibold mb-4 text-sm tracking-widest text-white/60">WHAT YOU'LL LEARN</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedEducation.takeaways.map((takeaway: string, i: number) => (
                      <div key={i} className="flex gap-3 p-4 bg-white/5 rounded-2xl">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white/90">{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="border-t border-white/10 p-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-white/5">
              <button 
                onClick={() => toggleComplete(selectedEducation.id)}
                className={`flex-1 md:flex-none px-8 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all ${completedItems.includes(selectedEducation.id) 
                  ? 'bg-white/10 text-white/70 hover:bg-white/20' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
              >
                <CheckCircle className="w-4 h-4" />
                {completedItems.includes(selectedEducation.id) ? 'Mark as Incomplete' : 'Mark as Complete & Save Progress'}
              </button>

              {selectedEducation.contentType === 'pdf' && (
                <button 
                  onClick={() => generateEducationPDF(selectedEducation)}
                  className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 px-8"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              )}

              <button onClick={closeEducation} className="flex-1 md:flex-none btn-secondary px-8">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 12: Education Paywall Modal (Freemium) */}
      {showEducationPaywall && paywallResource && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[130] p-4" onClick={closeEducationPaywall}>
          <div className="card max-w-lg w-full p-8 md:p-10 text-center" onClick={e => e.stopPropagation()}>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-[#D4AF37]" />
            </div>
            
            <h3 className="text-3xl font-semibold tracking-tight mb-2">Premium Resource</h3>
            <p className="text-white/70 text-lg mb-6">{paywallResource.title}</p>

            <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold tracking-widest">FLIP ACADEMY PRO</div>
              </div>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" /> Full access to all 6 premium video courses, case studies & masterclasses</li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" /> Downloadable PDFs, checklists & templates</li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" /> New resources added monthly</li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" /> Cancel anytime — no long-term commitment</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={upgradeToEducationPro}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
              >
                <CreditCard className="w-5 h-5" /> Subscribe £29/mo — Unlock Everything
              </button>
              <button 
                onClick={closeEducationPaywall}
                className="btn-secondary w-full py-3.5"
              >
                Maybe later
              </button>
            </div>

            <p className="text-[11px] text-white/40 mt-6">3 high-value resources are free forever. Upgrade for the complete library.</p>
          </div>
        </div>
      )}
      
      {/* PWA Install Prompt - shows non-intrusively after engagement */}
      <PWAInstallPrompt />
    </div>
  );
}
