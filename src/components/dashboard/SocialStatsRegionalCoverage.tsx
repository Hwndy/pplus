import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Globe, Twitter, Facebook, Instagram } from 'lucide-react';
import { RegionalCoverageMap } from './RegionalCoverageMap';

// Define types for our social stats data
interface SocialPlatformStats {
  platform: 'twitter' | 'facebook' | 'instagram';
  totalPosts: string;
  followers: string;
  following: string;
  likes?: string;
  monthlyPosts?: string;
}

interface RegionalCoverage {
  country: string;
  frequency: 'high' | 'low';
}

interface SocialStatsRegionalCoverageProps {
  socialStats: SocialPlatformStats[];
  regionalCoverage: RegionalCoverage[];
}

export function SocialStatsRegionalCoverage({
  socialStats,
  regionalCoverage
}: SocialStatsRegionalCoverageProps) {
  // Helper function to get the appropriate icon for each platform
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter size={24} />;
      case 'facebook':
        return <Facebook size={24} />;
      case 'instagram':
        return <Instagram size={24} />;
      default:
        return null;
    }
  };

  return (
    <DataCard title="Social Stats / Online Coverage by Region" variant="glass" icon={<Globe size={24} />}>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Social Platform Stats */}
          <div className="md:col-span-1">
            {socialStats.map((stat, index) => (
              <div key={index} className="mb-6 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  {getPlatformIcon(stat.platform)}
                  <h3 className="text-lg font-semibold">{stat.platform.charAt(0).toUpperCase() + stat.platform.slice(1)}</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Posts</p>
                    <p className="text-xl font-bold">{stat.totalPosts}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-xl font-bold">{stat.followers}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Following</p>
                    <p className="text-xl font-bold">{stat.following}</p>
                  </div>

                  {stat.likes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Total Page Likes</p>
                      <p className="text-xl font-bold">{stat.likes}</p>
                    </div>
                  )}

                  {stat.monthlyPosts && (
                    <div>
                      <p className="text-sm text-muted-foreground">Total Monthly Posts</p>
                      <p className="text-xl font-bold">{stat.monthlyPosts}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Regional Coverage Map */}
          <div className="md:col-span-2">
            <RegionalCoverageMap regions={regionalCoverage} />
          </div>
        </div>
      </div>
    </DataCard>
  );
}
