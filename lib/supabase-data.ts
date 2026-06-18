import { createClient } from './supabase';
import type { Project, Transaction, Todo, TeamMember, Property, SupplierListing, Lead } from '@/types';

function getSupabase() {
  return createClient();
}

type DbProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold';

function toDbProjectStatus(status: Project['status']): DbProjectStatus {
  return status === 'in-progress' ? 'in_progress' : status;
}

function fromDbProjectStatus(status: DbProjectStatus | null): Project['status'] {
  if (status === 'in_progress' || status === 'on_hold') return 'in-progress';
  return status || 'planning';
}

// ============================================
// PROJECTS
// ============================================
export async function getProjects(userId: string): Promise<Project[]> {
  const { data, error } = await getSupabase()
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    propertyAddress: p.property_address || '',
    budget: p.budget || 0,
    spent: p.spent || 0,
    status: fromDbProjectStatus(p.status),
    startDate: p.start_date || new Date().toISOString().split('T')[0],
    targetEndDate: p.target_end_date || '',
  }));
}

export async function createProject(userId: string, project: Omit<Project, 'id'>): Promise<Project | null> {
  const { data, error } = await getSupabase()
    .from('projects')
    .insert({
      user_id: userId,
      name: project.name,
      property_address: project.propertyAddress,
      budget: project.budget,
      spent: project.spent,
      status: toDbProjectStatus(project.status),
      start_date: project.startDate,
      target_end_date: project.targetEndDate,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    propertyAddress: data.property_address || '',
    budget: data.budget || 0,
    spent: data.spent || 0,
    status: fromDbProjectStatus(data.status),
    startDate: data.start_date || new Date().toISOString().split('T')[0],
    targetEndDate: data.target_end_date || '',
  };
}

export async function updateProject(projectId: string, updates: Partial<Project>) {
  const { error } = await getSupabase()
    .from('projects')
    .update({
      name: updates.name,
      property_address: updates.propertyAddress,
      budget: updates.budget,
      spent: updates.spent,
      status: updates.status ? toDbProjectStatus(updates.status) : undefined,
      start_date: updates.startDate,
      target_end_date: updates.targetEndDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (error) console.error('Error updating project:', error);
}

// ============================================
// TRANSACTIONS
// ============================================
export async function getTransactions(projectId: string): Promise<Transaction[]> {
  const { data, error } = await getSupabase()
    .from('transactions')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    projectId: t.project_id,
    date: t.date,
    description: t.description,
    category: t.category || 'Other',
    amount: t.amount,
    type: t.type,
  }));
}

export async function addTransaction(userId: string, tx: Omit<Transaction, 'id'> & { receiptUrl?: string }) {
  const { data, error } = await getSupabase()
    .from('transactions')
    .insert({
      user_id: userId,
      project_id: tx.projectId,
      date: tx.date,
      description: tx.description,
      category: tx.category,
      amount: tx.amount,
      type: tx.type,
      receipt_url: (tx as any).receiptUrl || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
  return data;
}

// ============================================
// TODOS
// ============================================
export async function getTodos(projectId: string): Promise<Todo[]> {
  const { data, error } = await getSupabase()
    .from('todos')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching todos:', error);
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    projectId: t.project_id,
    text: t.text,
    completed: t.completed,
    dueDate: t.due_date || undefined,
  }));
}

export async function addTodo(userId: string, todo: Omit<Todo, 'id'>) {
  const { data, error } = await getSupabase()
    .from('todos')
    .insert({
      user_id: userId,
      project_id: todo.projectId,
      text: todo.text,
      completed: todo.completed,
      due_date: todo.dueDate,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding todo:', error);
    return null;
  }
  return data;
}

export async function toggleTodo(todoId: string, completed: boolean) {
  const { error } = await getSupabase()
    .from('todos')
    .update({ completed })
    .eq('id', todoId);

  if (error) console.error('Error toggling todo:', error);
}

// ============================================
// TEAM MEMBERS
// ============================================
export async function getTeam(userId: string): Promise<TeamMember[]> {
  const { data, error } = await getSupabase()
    .from('team_members')
    .select(`
      id,
      supplier_id,
      notes,
      added_at,
      suppliers (name, category)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching team:', error);
    return [];
  }

  return (data || []).map((tm: any) => ({
    id: tm.id,
    supplierId: tm.supplier_id,
    name: tm.suppliers?.name || 'Unknown Supplier',
    category: tm.suppliers?.category || 'Other',
    addedAt: tm.added_at,
  }));
}

export async function addToTeam(userId: string, supplierId: string) {
  const { error } = await getSupabase()
    .from('team_members')
    .insert({ user_id: userId, supplier_id: supplierId });

  if (error) {
    console.error('Error adding to team:', error);
    return false;
  }
  return true;
}

// ============================================
// SAVED PROPERTIES
// ============================================
export async function getSavedProperties(userId: string): Promise<Property[]> {
  const { data, error } = await getSupabase()
    .from('saved_properties')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved properties:', error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    address: p.address,
    price: p.price || 0,
    potentialProfit: 0, // calculate if needed
    bedrooms: p.bedrooms || 0,
    type: 'House',
    status: p.status || 'watching',
  }));
}

export async function saveProperty(userId: string, property: Omit<Property, 'id'>) {
  const { error } = await getSupabase()
    .from('saved_properties')
    .insert({
      user_id: userId,
      address: property.address,
      price: property.price,
      bedrooms: property.bedrooms,
      status: (property.status as 'watching' | 'under_offer' | 'purchased' | 'passed') || 'watching',
    });

  if (error) {
    console.error('Error saving property:', error);
    return false;
  }
  return true;
}

// ============================================
// FILE UPLOAD (Supabase Storage)
// ============================================
export async function uploadReceipt(file: File, userId: string, projectId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${projectId}/${Date.now()}.${fileExt}`;
  const filePath = `receipts/${fileName}`;

  const { error } = await getSupabase().storage
    .from('project-files')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading receipt:', error);
    return null;
  }

  const { data } = getSupabase().storage
    .from('project-files')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// ============================================
// SUPPLIER DASHBOARD (Real Supabase wiring)
// ============================================

export async function getMySupplierListing(userId: string): Promise<SupplierListing | null> {
  const { data, error } = await getSupabase()
    .from('suppliers')
    .select('*')
    .eq('created_by', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    description: data.description || '',
    location: data.location || '',
    price_range: data.price_range || '',
    contact_email: data.contact_email || '',
    contact_phone: data.contact_phone || '',
    website: data.website || '',
    rating: data.rating,
    verified: data.verified,
  };
}

export async function createOrUpdateSupplierListing(
  userId: string,
  listing: Partial<SupplierListing> & { id?: string }
): Promise<SupplierListing | null> {
  const payload: any = {
    name: listing.name,
    category: listing.category,
    description: listing.description,
    location: listing.location,
    price_range: listing.price_range,
    contact_email: listing.contact_email,
    contact_phone: listing.contact_phone,
    website: listing.website,
    created_by: userId,
  };

  let result;
  if (listing.id) {
    // Update existing
    const { data, error } = await getSupabase()
      .from('suppliers')
      .update(payload)
      .eq('id', listing.id)
      .eq('created_by', userId)
      .select()
      .single();
    result = { data, error };
  } else {
    // Create new
    const { data, error } = await getSupabase()
      .from('suppliers')
      .insert(payload)
      .select()
      .single();
    result = { data, error };
  }

  if (result.error || !result.data) {
    console.error('Error saving supplier listing:', result.error);
    return null;
  }

  return {
    id: result.data.id,
    name: result.data.name,
    category: result.data.category,
    description: result.data.description || '',
    location: result.data.location || '',
    price_range: result.data.price_range || '',
    contact_email: result.data.contact_email || '',
    contact_phone: result.data.contact_phone || '',
    website: result.data.website || '',
  };
}

export async function getLeadsForSupplier(supplierId: string): Promise<Lead[]> {
  const { data, error } = await getSupabase()
    .from('leads')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return (data || []).map((l: any) => ({
    id: l.id,
    supplier_id: l.supplier_id,
    flipper_name: l.flipper_name,
    project: l.project || '',
    message: l.message,
    status: l.status,
    reply_message: l.reply_message || '',
    created_at: l.created_at,
  }));
}

export async function updateLeadStatus(
  leadId: string,
  status: Lead['status'],
  replyMessage?: string
): Promise<boolean> {
  const updates: any = { status };
  if (replyMessage) {
    updates.reply_message = replyMessage;
  }

  const { error } = await getSupabase()
    .from('leads')
    .update(updates)
    .eq('id', leadId);

  if (error) {
    console.error('Error updating lead:', error);
    return false;
  }
  return true;
}

export async function createTestLead(supplierId: string): Promise<Lead | null> {
  const testLeads = [
    { flipper_name: 'Sarah Patel', project: '42 Maple Grove, Leeds', message: 'Hi, looking for a reliable builder for a full flip. Kitchen + bathroom + structural. Can you quote?' },
    { flipper_name: 'James Wilson', project: '17 Oak Street, Manchester', message: 'Need electrician + builder team for 3-bed flip. Quick turnaround preferred.' },
  ];
  const random = testLeads[Math.floor(Math.random() * testLeads.length)];

  const { data, error } = await getSupabase()
    .from('leads')
    .insert({
      supplier_id: supplierId,
      flipper_name: random.flipper_name,
      project: random.project,
      message: random.message,
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating test lead:', error);
    return null;
  }

  return {
    id: data.id,
    supplier_id: data.supplier_id,
    flipper_name: data.flipper_name,
    project: data.project || '',
    message: data.message,
    status: data.status,
    created_at: data.created_at,
  };
}

// ============================================
// LEADS - Real creation from flippers
// ============================================
export async function createLead(params: {
  supplierId: string;
  flipperUserId: string;
  flipperName: string;
  project: string;
  message: string;
}): Promise<Lead | null> {
  const { data, error } = await getSupabase()
    .from('leads')
    .insert({
      supplier_id: params.supplierId,
      flipper_user_id: params.flipperUserId,
      flipper_name: params.flipperName,
      project: params.project,
      message: params.message,
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    return null;
  }

  return {
    id: data.id,
    supplier_id: data.supplier_id,
    flipper_user_id: data.flipper_user_id ?? undefined,
    flipper_name: data.flipper_name,
    project: data.project || '',
    message: data.message,
    status: data.status,
    reply_message: data.reply_message ?? undefined,
    created_at: data.created_at,
  };
}

// Get leads created by this flipper (for "My Enquiries" future feature)
export async function getMyLeadsAsFlipper(userId: string): Promise<Lead[]> {
  const { data, error } = await getSupabase()
    .from('leads')
    .select('*')
    .eq('flipper_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching my leads:', error);
    return [];
  }

  return (data || []).map((l: any) => ({
    id: l.id,
    supplier_id: l.supplier_id,
    flipper_user_id: l.flipper_user_id,
    flipper_name: l.flipper_name,
    project: l.project || '',
    message: l.message,
    status: l.status,
    reply_message: l.reply_message,
    created_at: l.created_at,
    updated_at: l.updated_at,
  }));
}
