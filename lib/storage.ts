import { 
  User, Supplier, Property, Project, Transaction, Todo, TeamMember 
} from '@/types';

const STORAGE_KEYS = {
  USER: 'flip_user',
  TEAM: 'flip_team',
  PROJECTS: 'flip_projects',
  TRANSACTIONS: 'flip_transactions',
  TODOS: 'flip_todos',
  SAVED_PROPERTIES: 'flip_saved_properties',
  COMPLETED_EDUCATION: 'flip_completed_education',
} as const;

export const storage = {
  // User
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  clearUser: () => localStorage.removeItem(STORAGE_KEYS.USER),

  // Team
  getTeam: (): TeamMember[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TEAM);
    return data ? JSON.parse(data) : [];
  },
  setTeam: (team: TeamMember[]) => {
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
  },

  // Projects
  getProjects: (): Project[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  },
  setProjects: (projects: Project[]) => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  // Transactions
  getTransactions: (): Transaction[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  setTransactions: (txs: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  },

  // Todos
  getTodos: (): Todo[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TODOS);
    return data ? JSON.parse(data) : [];
  },
  setTodos: (todos: Todo[]) => {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  },

  // Saved Properties
  getSavedProperties: (): Property[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_PROPERTIES);
    return data ? JSON.parse(data) : [];
  },
  setSavedProperties: (props: Property[]) => {
    localStorage.setItem(STORAGE_KEYS.SAVED_PROPERTIES, JSON.stringify(props));
  },

  // Education progress
  getCompletedEducation: (): string[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_EDUCATION);
    return data ? JSON.parse(data) : [];
  },
  setCompletedEducation: (ids: string[]) => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_EDUCATION, JSON.stringify(ids));
  },

  // Clear all (for demo reset)
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};