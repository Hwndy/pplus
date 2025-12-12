import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { Globe, Twitter, Facebook, Instagram, MapPin } from 'lucide-react';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SocialPlatformStats {
  platform: 'x' | 'facebook' | 'instagram';
  totalPosts: string;
  followers: string;
  following: string;
  likes?: string;
  monthlyPosts?: string;
}

interface RegionalCoverage {
  country: string;
  count: number;
  percentage: string;
}

export function CoverageRegionPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [socialData, setSocialData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Use company directly from authenticated user
  const companyName = user?.company_name || user?.company || 'Your Company';

  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()} ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short', hour12: true })}`;

  const filterOptions: FilterOption[] = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      placeholder: 'Select date range',
    },
    // {
    //   key: 'region',
    //   label: 'Region',
    //   type: 'multiselect',
    //   options: [
    //     { value: 'lagos', label: 'Lagos' },
    //     { value: 'abuja', label: 'Abuja' },
    //     { value: 'kano', label: 'Kano' },
    //     { value: 'port_harcourt', label: 'Port Harcourt' },
    //     { value: 'ibadan', label: 'Ibadan' },
    //     { value: 'benin', label: 'Benin' },
    //     { value: 'kaduna', label: 'Kaduna' },
    //   ],
    // },
    // {
    //   key: 'platform',
    //   label: 'Social Platform',
    //   type: 'multiselect',
    //   options: [
    //     { value: 'x', label: 'X (Twitter)' },
    //     { value: 'facebook', label: 'Facebook' },
    //     { value: 'instagram', label: 'Instagram' },
    //     { value: 'linkedin', label: 'LinkedIn' },
    //     { value: 'youtube', label: 'YouTube' },
    //     { value: 'tiktok', label: 'TikTok' },
    //   ],
    // },
    // {
    //   key: 'coverageType',
    //   label: 'Coverage Type',
    //   type: 'select',
    //   options: [
    //     { value: 'social', label: 'Social Media Coverage' },
    //     { value: 'traditional', label: 'Traditional Media Coverage' },
    //   ],
    // },
    // {
    //   key: 'engagement',
    //   label: 'Engagement Level',
    //   type: 'select',
    //   options: [
    //     { value: 'high', label: 'High Engagement' },
    //     { value: 'medium', label: 'Medium Engagement' },
    //     { value: 'low', label: 'Low Engagement' },
    //   ],
    // },
  ];

  const resetFilters = () => setFilterValues({});

  const getMonthFromDateRange = (dateRange: any): string | null => {
    if (!dateRange?.start) return null;
    const start = new Date(dateRange.start);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !token || !companyName) return;

    const fetchSocialData = async () => {
      setDataLoading(true);
      try {
        const month = getMonthFromDateRange(filterValues.dateRange);
        const params = new URLSearchParams();
        params.append('company', companyName);
        if (month) params.append('month', month);

        const url = `https://backend-55pc.onrender.com/api/report/social-stats-online-coverage?${params.toString()}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();

        if (result.success && result.data) {
          setSocialData(result.data);
        } else {
          setSocialData(null);
          toast.info(result.message || 'No social media data available');
        }
      } catch (err) {
        console.error('Error fetching social stats:', err);
        toast.error('Failed to load coverage data');
        setSocialData(null);
      } finally {
        setDataLoading(false);
      }
    };

    fetchSocialData();
  }, [authLoading, isAuthenticated, token, companyName, filterValues.dateRange]);

  // Map social_media_metrics safely
  const socialPlatforms: SocialPlatformStats[] = socialData?.social_media_metrics
    ? Object.entries(socialData.social_media_metrics)
        .filter(([platform]) => ['x', 'facebook', 'instagram'].includes(platform))
        .map(([platform, metrics]: [string, any]) => ({
          platform: platform as 'x' | 'facebook' | 'instagram',
          totalPosts: metrics.total_posts?.toString() || '0',
          followers: metrics.total_followers?.toString() || '0',
          following: metrics.total_following?.toString() || '0',
          likes: platform === 'facebook' ? metrics.total_page_likes?.toString() : undefined,
          monthlyPosts: platform === 'facebook' ? metrics.total_monthly_posts?.toString() : undefined,
        }))
    : [];

  // Map regional coverage safely
  const regionalCoverage: RegionalCoverage[] = socialData?.online_country_coverage?.countries?.map((c: any) => ({
    country: c.country || 'Unknown',
    count: c.count || 0,
    percentage: c.percentage || '0%',
  })) || [];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'x':
        return <Twitter size={24} className="text-blue-500" />;
      case 'facebook':
        return <Facebook size={24} className="text-blue-600" />;
      case 'instagram':
        return <Instagram size={24} className="text-pink-600" />;
      default:
        return null;
    }
  };

  if (authLoading || dataLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Coverage by Region</h1>
            <p className="text-green-100 text-lg">Regional media coverage and social media analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Globe size={32} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-100">Last Updated</div>
              <div className="text-white font-medium">{formattedDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={resetFilters}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left side - Social Stats */}
        <div className="xl:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialPlatforms.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                No social media data available for this period
              </div>
            ) : (
              socialPlatforms.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg">
                        {getPlatformIcon(stat.platform)}
                      </div>
                      {stat.platform.charAt(0).toUpperCase() + stat.platform.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right side - Regional Coverage */}
        <div className="xl:col-span-1">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 hover:shadow-xl transition-all duration-300 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gradient-to-br from-slate-600 to-gray-600 p-2 rounded-lg">
                  <MapPin size={20} className="text-white" />
                </div>
                Regional Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {regionalCoverage.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No regional coverage data available
                </div>
              ) : (
                regionalCoverage.map((region, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{region.country}</h4>
                        <p className="text-sm text-gray-600">{region.count} mentions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{region.percentage}%</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}