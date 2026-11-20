export interface DemoUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'viewer' | 'user';
}

export const DEMO_USERS: DemoUser[] = [
  { name: 'Admin User', email: 'admin@mgblessed.com', password: 'Admin@1234', role: 'admin' },
  { name: 'Demo User', email: 'demo@mgblessed.com', password: 'Demo@1234', role: 'user' },
];
