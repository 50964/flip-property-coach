export interface User {
  id: string;
  name: string;
  email: string;
  role: 'flipper' | 'supplier';
  company?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  priceRange: string;
  description: string;
  verified: boolean;
}

export interface Property {
  id: string;
  address: string;
  price: number;
  potentialProfit: number;
  bedrooms: number;
  type: string;
  status: string;
  image?: string;
}

export interface Project {
  id: string;
  name: string;
  propertyAddress: string;
  budget: number;
  spent: number;
  status: 'planning' | 'in-progress' | 'completed';
  startDate: string;
  targetEndDate: string;
}

export interface Transaction {
  id: string;
  projectId: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface Todo {
  id: string;
  projectId: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export interface TeamMember {
  id: string;
  supplierId: string;
  name: string;
  category: string;
  addedAt: string;
}

export interface SupplierListing {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  price_range: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  rating?: number;
  verified?: boolean;
}

export interface Lead {
  id: string;
  supplier_id: string;
  flipper_user_id?: string;
  flipper_name: string;
  project: string;
  message: string;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
  reply_message?: string;
  created_at: string;
  updated_at?: string;
}
