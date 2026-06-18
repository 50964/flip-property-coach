import { Supplier, Property, Project } from '@/types';

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: "BuildRight Contractors", category: "Builder", rating: 4.8, reviews: 124, location: "Manchester", priceRange: "£££", description: "Specialists in full house renovations and extensions.", verified: true },
  { id: 's2', name: "Spark Electric", category: "Electrician", rating: 4.9, reviews: 87, location: "Leeds", priceRange: "££", description: "Fully qualified Part P electricians. Fast & reliable.", verified: true },
  { id: 's3', name: "Flow Plumbing & Heating", category: "Plumber", rating: 4.6, reviews: 63, location: "Sheffield", priceRange: "££", description: "Boiler installs, full re-pipes, bathroom suites.", verified: true },
  { id: 's4', name: "Elite Roofing Solutions", category: "Roofer", rating: 4.7, reviews: 51, location: "Liverpool", priceRange: "£££", description: "New roofs, slate repairs, loft conversions.", verified: false },
  { id: 's5', name: "Precision Plastering", category: "Plasterer", rating: 4.5, reviews: 39, location: "Manchester", priceRange: "£", description: "Skimming, rendering, dry lining experts.", verified: true },
];

export const mockProperties: Property[] = [
  { id: 'p1', address: "42 Oakwood Drive, Manchester M20 4AB", price: 245000, potentialProfit: 68000, bedrooms: 3, type: "Semi-detached", status: "For sale" },
  { id: 'p2', address: "17 Victoria Terrace, Leeds LS6 2EF", price: 189000, potentialProfit: 52000, bedrooms: 2, type: "Terrace", status: "Auction" },
  { id: 'p3', address: "8 Maple Court, Sheffield S10 3GH", price: 312000, potentialProfit: 91000, bedrooms: 4, type: "Detached", status: "For sale" },
];

export const initialProjects: Project[] = [
  { 
    id: 'proj1', 
    name: "Oakwood Drive Flip", 
    propertyAddress: "42 Oakwood Drive, Manchester", 
    budget: 245000, 
    spent: 87200, 
    status: "in-progress", 
    startDate: "2025-03-15", 
    targetEndDate: "2025-07-20" 
  }
];

export const initialTransactions = [
  { id: 't1', projectId: 'proj1', date: '2025-03-18', description: 'Deposit on property', category: 'Purchase', amount: 24500, type: 'expense' as const },
  { id: 't2', projectId: 'proj1', date: '2025-03-22', description: 'Builder stage payment 1', category: 'Labour', amount: 18500, type: 'expense' as const },
  { id: 't3', projectId: 'proj1', date: '2025-04-05', description: 'Electrical rewire', category: 'Materials', amount: 6200, type: 'expense' as const },
];

export const initialTodos = [
  { id: 'td1', projectId: 'proj1', text: 'Complete structural survey', completed: true, dueDate: '2025-03-25' },
  { id: 'td2', projectId: 'proj1', text: 'Order kitchen units', completed: false, dueDate: '2025-05-10' },
  { id: 'td3', projectId: 'proj1', text: 'Book plasterer for week of 12th May', completed: false, dueDate: '2025-05-01' },
];
