// Social Media Service for fetching mentions and activity data
import { apiService } from './apiService';

export interface SocialMediaMention {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
  handle: string;
  url: string;
  content: string;
  author: string;
  authorHandle: string;
  authorFollowers: number;
  publishedAt: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  reach: number;
  impressions: number;
  hashtags: string[];
  mentions: string[];
  mediaType: 'text' | 'image' | 'video' | 'link';
  language: string;
  location?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaProfile {
  platform: string;
  handle: string;
  url: string;
  followers: number;
  following: number;
  posts: number;
  verified: boolean;
  description: string;
  profileImage: string;
  lastActive: string;
}

export interface SocialMediaSearchParams {
  query: string; // Company name or handle
  platforms?: string[]; // Specific platforms to search
  dateFrom?: string;
  dateTo?: string;
  sentiment?: string;
  limit?: number;
  offset?: number;
}

export interface SocialMediaSearchResult {
  mentions: SocialMediaMention[];
  profiles: SocialMediaProfile[];
  totalMentions: number;
  totalEngagement: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  platformBreakdown: Record<string, number>;
}

class SocialMediaService {
  private baseUrl = 'https://api.socialmedia-tracker.com/v1'; // Mock API endpoint

  // Extract platform and handle from URL or handle string
  private parseInput(input: string): { platform?: string; handle: string; url?: string } {
    const trimmed = input.trim();
    
    // Check if it's a URL
    if (trimmed.startsWith('http')) {
      const url = new URL(trimmed);
      const hostname = url.hostname.toLowerCase();
      
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        const handle = url.pathname.split('/')[1];
        return { platform: 'twitter', handle: `@${handle}`, url: trimmed };
      } else if (hostname.includes('facebook.com')) {
        const handle = url.pathname.split('/')[1];
        return { platform: 'facebook', handle, url: trimmed };
      } else if (hostname.includes('instagram.com')) {
        const handle = url.pathname.split('/')[1];
        return { platform: 'instagram', handle: `@${handle}`, url: trimmed };
      } else if (hostname.includes('linkedin.com')) {
        const handle = url.pathname.split('/')[2]; // /company/handle or /in/handle
        return { platform: 'linkedin', handle, url: trimmed };
      } else if (hostname.includes('youtube.com')) {
        const handle = url.pathname.split('/')[2]; // /channel/handle or /c/handle
        return { platform: 'youtube', handle, url: trimmed };
      } else if (hostname.includes('tiktok.com')) {
        const handle = url.pathname.split('/')[1];
        return { platform: 'tiktok', handle: `@${handle}`, url: trimmed };
      }
    }
    
    // If it's just a handle or company name
    return { handle: trimmed };
  }

  // Mock function to simulate API call for social media search
  async searchSocialMedia(params: SocialMediaSearchParams): Promise<SocialMediaSearchResult> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { query } = params;
      const parsed = this.parseInput(query);
      
      // Generate mock data based on the search query
      const mockMentions: SocialMediaMention[] = this.generateMockMentions(parsed.handle, parsed.platform);
      const mockProfiles: SocialMediaProfile[] = this.generateMockProfiles(parsed.handle);
      
      const totalEngagement = mockMentions.reduce((sum, mention) => 
        sum + mention.engagement.likes + mention.engagement.shares + mention.engagement.comments, 0
      );
      
      const sentimentBreakdown = mockMentions.reduce((acc, mention) => {
        acc[mention.sentiment]++;
        return acc;
      }, { positive: 0, neutral: 0, negative: 0 });
      
      const platformBreakdown = mockMentions.reduce((acc, mention) => {
        acc[mention.platform] = (acc[mention.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        mentions: mockMentions,
        profiles: mockProfiles,
        totalMentions: mockMentions.length,
        totalEngagement,
        sentimentBreakdown,
        platformBreakdown
      };
    } catch (error) {
      console.error('Social media search error:', error);
      throw new Error('Failed to fetch social media data');
    }
  }

  private generateMockMentions(handle: string, platform?: string): SocialMediaMention[] {
    const platforms: SocialMediaMention['platform'][] = platform ? [platform as SocialMediaMention['platform']] : 
      ['twitter', 'facebook', 'instagram', 'linkedin'];
    
    const mentions: SocialMediaMention[] = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
      const publishedAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
      
      mentions.push({
        id: `mention_${i + 1}`,
        platform: randomPlatform,
        handle: handle.startsWith('@') ? handle : `@${handle}`,
        url: this.generateMockUrl(randomPlatform, handle, i),
        content: this.generateMockContent(handle, randomPlatform),
        author: `User${i + 1}`,
        authorHandle: `@user${i + 1}`,
        authorFollowers: Math.floor(Math.random() * 10000) + 100,
        publishedAt: publishedAt.toISOString(),
        engagement: {
          likes: Math.floor(Math.random() * 500) + 10,
          shares: Math.floor(Math.random() * 100) + 5,
          comments: Math.floor(Math.random() * 50) + 2,
          views: randomPlatform === 'youtube' ? Math.floor(Math.random() * 10000) + 100 : undefined
        },
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
        sentimentScore: Math.random() * 2 - 1, // -1 to 1
        reach: Math.floor(Math.random() * 5000) + 500,
        impressions: Math.floor(Math.random() * 10000) + 1000,
        hashtags: this.generateMockHashtags(),
        mentions: [handle],
        mediaType: ['text', 'image', 'video', 'link'][Math.floor(Math.random() * 4)] as any,
        language: 'en',
        location: ['Lagos, Nigeria', 'Abuja, Nigeria', 'Port Harcourt, Nigeria'][Math.floor(Math.random() * 3)],
        isVerified: Math.random() > 0.8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return mentions.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  private generateMockProfiles(handle: string): SocialMediaProfile[] {
    const platforms = ['twitter', 'facebook', 'instagram', 'linkedin'];
    
    return platforms.map(platform => ({
      platform,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      url: this.generateMockProfileUrl(platform, handle),
      followers: Math.floor(Math.random() * 100000) + 1000,
      following: Math.floor(Math.random() * 5000) + 100,
      posts: Math.floor(Math.random() * 10000) + 50,
      verified: Math.random() > 0.7,
      description: `Official ${platform} account for ${handle}`,
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${handle}`,
      lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  private generateMockContent(handle: string, platform: string): string {
    const contents = [
      `Great experience with ${handle}! Highly recommend their services. #CustomerService`,
      `Just visited ${handle} and was impressed by their professionalism. Will definitely be back!`,
      `${handle} continues to set the standard in the industry. Excellent work!`,
      `Had some issues with ${handle} today, hoping they can resolve this quickly.`,
      `Love what ${handle} is doing in the community. Keep up the great work! 👏`,
      `${handle} just announced their new initiative. Excited to see how this develops.`,
      `Been a customer of ${handle} for years. Still the best choice in the market.`,
      `${handle} needs to improve their customer support. Waited too long for a response.`,
      `Congratulations to ${handle} on their recent achievement! Well deserved. 🎉`,
      `${handle} is leading the way in innovation. Proud to be associated with them.`
    ];
    
    return contents[Math.floor(Math.random() * contents.length)];
  }

  private generateMockHashtags(): string[] {
    const hashtags = ['#business', '#innovation', '#customerservice', '#quality', '#leadership', '#growth', '#success'];
    return hashtags.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  private generateMockUrl(platform: string, handle: string, index: number): string {
    const cleanHandle = handle.replace('@', '');
    switch (platform) {
      case 'twitter': return `https://twitter.com/${cleanHandle}/status/${1234567890 + index}`;
      case 'facebook': return `https://facebook.com/${cleanHandle}/posts/${1234567890 + index}`;
      case 'instagram': return `https://instagram.com/p/${cleanHandle}${index}`;
      case 'linkedin': return `https://linkedin.com/posts/${cleanHandle}_${1234567890 + index}`;
      case 'youtube': return `https://youtube.com/watch?v=${cleanHandle}${index}`;
      case 'tiktok': return `https://tiktok.com/@${cleanHandle}/video/${1234567890 + index}`;
      default: return `https://${platform}.com/${cleanHandle}`;
    }
  }

  private generateMockProfileUrl(platform: string, handle: string): string {
    const cleanHandle = handle.replace('@', '');
    switch (platform) {
      case 'twitter': return `https://twitter.com/${cleanHandle}`;
      case 'facebook': return `https://facebook.com/${cleanHandle}`;
      case 'instagram': return `https://instagram.com/${cleanHandle}`;
      case 'linkedin': return `https://linkedin.com/company/${cleanHandle}`;
      default: return `https://${platform}.com/${cleanHandle}`;
    }
  }
}

export const socialMediaService = new SocialMediaService();
