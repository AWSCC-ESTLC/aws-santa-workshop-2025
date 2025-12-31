// SantaCloud AWS API Service

const API_BASE = 'https://0ic380ur1d.execute-api.us-east-1.amazonaws.com/prod'; // Replace with your deployed API URL

export interface Child {
  id: string;
  name: string;
  age: number;
  country: string;
  status: 'nice' | 'naughty';
  wishlist: string[];
  niceScore: number;
}

export interface Gift {
  id: string;
  childId: string;
  childName: string;
  giftName: string;
  status: 'manufacturing' | 'wrapping' | 'ready' | 'delivered';
  priority: 'low' | 'medium' | 'high';
}

export interface Reindeer {
  id: string;
  name: string;
  status: 'resting' | 'training' | 'flying';
  location: string;
  energyLevel: number;
}

export interface Letter {
  id: string;
  childName: string;
  message: string;
  receivedDate: string;
  replied: boolean;
}

export interface DashboardStats {
  totalChildren: number;
  niceChildren: number;
  naughtyChildren: number;
  giftsReady: number;
  giftsInProgress: number;
  activeReindeers: number;
  unreadLetters: number;
}

// API Functions
export const api = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    return res.json();
  },

  // Children
  async getChildren(): Promise<Child[]> {
    const res = await fetch(`${API_BASE}/children`);
    return res.json();
  },

  async getChild(id: string): Promise<Child | undefined> {
    const res = await fetch(`${API_BASE}/children/${id}`);
    if (res.status === 404) return undefined;
    return res.json();
  },

  async searchChildren(query: string): Promise<Child[]> {
    const res = await fetch(`${API_BASE}/children?query=${encodeURIComponent(query)}`);
    return res.json();
  },

  async addChild(child: Omit<Child, 'id'>): Promise<{ child: Child; gifts: Gift[] }> {
    const res = await fetch(`${API_BASE}/children`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(child),
    });
    return res.json();
  },

  // Gifts
  async getGifts(): Promise<Gift[]> {
    const res = await fetch(`${API_BASE}/gifts`);
    return res.json();
  },

  async updateGiftStatus(id: string, status: Gift['status']): Promise<Gift | undefined> {
    const res = await fetch(`${API_BASE}/gifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Reindeers
  async getReindeers(): Promise<Reindeer[]> {
    const res = await fetch(`${API_BASE}/reindeers`);
    return res.json();
  },

  async updateReindeerStatus(id: string, status: Reindeer['status']): Promise<Reindeer | undefined> {
    const res = await fetch(`${API_BASE}/reindeers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Letters
  async getLetters(): Promise<Letter[]> {
    const res = await fetch(`${API_BASE}/letters`);
    return res.json();
  },

  async generateMagicReply(childName: string, originalMessage: string): Promise<string> {
    const res = await fetch(`${API_BASE}/letters/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childName, originalMessage }),
    });
    return res.json();
  },

  // Gift Progress Stats
  async getGiftProgressStats(): Promise<{ label: string; value: number; color: string }[]> {
    const res = await fetch(`${API_BASE}/gifts/progress`);
    return res.json();
  },
};
