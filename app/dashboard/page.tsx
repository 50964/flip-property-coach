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

  // PLACEHOLDER_REMAINDER_OF_DASHBOARD_FILE