
export interface NavLinkItem {
  name: string;
  path: string;
}

export interface Stat {
  icon: string;
  label: string;
  value: string;
}

export interface Review {
  _id?: string;
  name: string;
  email: string;
  rating: number;
  comment?: string;
  images?: string[]; // Added images array
  createdAt?: string;
}

export interface TouristSpot {
  _id?: string;
  image: string;
  alt: string;
  name: string;
  description: string;
  location: string;
  history?: string;
  gallery: string[];
  openingHours: string;
  bestTimeToVisit: string;
  category: string;
  tags: string[];
  nearbyEmergency: {
    type: 'Hospital' | 'Police';
    name: string;
    distance: string;
  }[];
  mapEmbedUrl: string;
  reviews: Review[];
  averageRating?: number;
}

export interface EmergencyContact {
  icon: string;
  type: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
}

export interface Hotline {
    label: string;
    number: string;
    href: string;
}

export interface Norm {
  icon: string;
  title: string;
  description: string;
  points: string[];
}

export interface BlogPost {
  _id?: string;
  image: string;
  alt: string;
  badge: string;
  readTime: string;
  title: string;
  description: string;
  author: string;
  date: string;
  content: string;
  // User Submission Fields
  status?: 'approved' | 'pending' | 'rejected';
  email?: string; // Private email for admin to contact
  socialLink?: string; // Public social link
  videoLink?: string; // Optional YouTube/TikTok link
  adminFeedback?: string; // Notes from admin
}

export interface HistoryEvent {
  year: string;
  title: string;
  description: string;
  icon: string;
  image: string;
}

export interface LocalEvent {
  _id?: string;
  image: string;
  title: string;
  date: string;
  description: string;
  location: string;
  badge: string;
}

export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
  image?: string;
}

export interface Report {
  _id?: string;
  targetId: string;
  targetName: string;
  targetType: 'TouristSpot' | 'DiningSpot' | 'BlogPost';
  reason: string;
  description: string;
  status: 'pending' | 'resolved';
  createdAt?: string;
}
