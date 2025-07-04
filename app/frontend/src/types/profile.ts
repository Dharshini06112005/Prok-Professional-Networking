export interface SocialLink {
  platform: string;
  url: string;
}

export interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

export interface Activity {
  id: string;
  type: string;
  content: string;
  date: string;
}

export interface UserProfile {
  id: string;
  avatar: string;
  name: string;
  title: string;
  location: string;
  social: SocialLink[];
  bio: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
  connections: number;
  mutualConnections: number;
  activity: Activity[];
} 