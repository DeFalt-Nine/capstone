
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
  images?: string[]; 
  createdAt?: string;
  isSeen?: boolean;
  isResolved?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  userId?: string;
  userAvatar?: string;
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
  // Added transportation fields
  jeepneyFare?: string;
  taxiFare?: string;
  terminalLocation?: string;
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
  facts?: string[];
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
  status?: 'approved' | 'pending' | 'rejected';
  email?: string;
  socialLink?: string;
  videoLink?: string;
  adminFeedback?: string;
  isSeen?: boolean;
  userId?: string;
  userAvatar?: string;
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
  isSeen?: boolean;
}

export interface PlannerItem {
  id: string;
  name: string;
  image: string;
  category: string;
  type: 'tourist' | 'dining';
}

export interface AdminLog {
  _id: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  timestamp: string;
}

export interface JeepneyRoute {
  _id?: string;
  name: string;
  signboard: {
    text: string;
    color: string;
    backgroundColor: string;
  };
  terminal: {
    name: string;
    location: string;
    mapUrl?: string;
  };
  routeMapUrl?: string;
  fare: {
    minimum: number;
    studentSenior?: number;
    fullRoute?: number;
  };
  path: {
    stop: string;
    isLandmark: boolean;
    landmarkIcon?: string;
  }[];
  operatingHours: string;
  frequency: string;
}

export interface SiteSettings {
    _id?: string;
    home: {
        heroWelcomeText: string;
        heroTitle: string;
        heroSubtitle: string;
        heroImages: {
            url: string;
            alt: string;
        }[];
    };
    about: {
        heroTitle: string;
        heroSubtitle: string;
        heroImage: string;
        storyTitle: string;
        storyContent: string;
        journeyThroughTime: {
            year: string;
            title: string;
            content: string;
            image: string;
        }[];
        localGovernment: {
            title: string;
            content: string;
            image: string;
            officials: {
                name: string;
                position: string;
                image: string;
            }[];
        };
    };
}
