import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { Globe, Twitter, Facebook, Instagram, MapPin, Loader2 } from 'lucide-react';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SocialPlatformStats {
  platform: 'x' | 'facebook' | 'instagram';
  totalPosts: string;
  followers: string;
  following: string;
  likes?: string;
  monthlyPosts?: string;
  avgLikes?: string;
  avgComments?: string;
}

interface RegionalCoverage {
  country: string;
  count: number;
  percentage: string;
}

export function CoverageRegionPage() {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [socialData, setSocialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const companyName = activePair?.base_company.company_name || 'Your Company';

  const hasValidDateRange = filterValues.dateRange && 
    Array.isArray(filterValues.dateRange) && 
    filterValues.dateRange[0] && 
    filterValues.dateRange[1];

  const startDate = (hasValidDateRange ? filterValues.dateRange[0] : '') as string;
  const endDate = (hasValidDateRange ? filterValues.dateRange[1] : '') as string;

  const filterOptions = [
    {
      key: 'dateRange',
      label: 'Select Date Range',
      type: 'daterange',
      placeholder: 'Pick date range',
      closeOnSelect: true,
    },
  ];

  const resetFilters = () => setFilterValues({});

  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const getDisplayDates = () => {
    if (filterValues.dateRange) {
      const [start, end] = filterValues.dateRange as [string | null, string | null];
      if (start && end) return { start, end };
    }
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return {
      start: `${year}-${month}-01`,
      end: `${year}-${month}-${day}`
    };
  };

  const displayDates = getDisplayDates();

  const fetchSocialData = useCallback(async () => {
    if (!token || !activePair) {
      setSocialData(null);
      setLoading(false);
      return;
    }

    if (filterValues.dateRange) {
      const [start, end] = filterValues.dateRange as [string | null, string | null];
      if (new Date(start) > new Date(end)) {
        toast.error('Start date must be before or equal to end date');
        setLoading(false);
        return;
      }
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('pair_id', String(activePair.pair_id));

      if (hasValidDateRange) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const url = `https://pplus-g19c.onrender.com/api/v1/report/social-stats-online-coverage?${params.toString()}`;
      console.log('Fetching Coverage Region →', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setSocialData(result.data);
      } else {
        setSocialData(null);
        if (result.message && !result.message.includes('No social')) {
          toast.info(result.message);
        }
      }
    } catch (err: any) {
      console.error('Error fetching social stats:', err);
      if (err.response?.status === 404 || err.message?.includes('No social')) {
        setSocialData(null);
      } else {
        toast.error('Failed to load coverage data');
        setSocialData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, activePair, filterValues.dateRange, hasValidDateRange, startDate, endDate]);

  useEffect(() => {
    fetchSocialData();
  }, [fetchSocialData]);

  const socialPlatforms: SocialPlatformStats[] = socialData?.social_media_metrics
    ? Object.entries(socialData.social_media_metrics)
        .filter(([platform, metrics]: [string, any]) => 
          ['x', 'facebook', 'instagram'].includes(platform) && metrics.records_count > 0
        )
        .map(([platform, metrics]: [string, any]) => ({
          platform: platform as 'x' | 'facebook' | 'instagram',
          totalPosts: metrics.total_posts?.toString() || metrics.total_monthly_posts?.toString() || '0',
          followers: metrics.total_followers?.toString() || '0',
          following: metrics.total_following?.toString() || '0',
          likes: platform === 'facebook' ? metrics.total_page_likes?.toString() : undefined,
          monthlyPosts: platform === 'facebook' ? metrics.total_monthly_posts?.toString() : undefined,
          avgLikes: platform === 'facebook' ? metrics.total_average_likes?.toString() : undefined,
          avgComments: platform === 'facebook' ? metrics.total_average_comments?.toString() : undefined,
        }))
    : [];

  const regionalCoverage: RegionalCoverage[] = socialData?.online_country_coverage?.countries?.map((c: any) => ({
    country: c.country || 'Unknown',
    count: c.count || 0,
    percentage: c.percentage || '0',
  })) || [];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'x':
        return <Twitter size={20} className="text-white" />;
      case 'facebook':
        return <Facebook size={20} className="text-white" />;
      case 'instagram':
        return <Instagram size={20} className="text-white" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'x':
        return 'from-blue-500 to-blue-600';
      case 'facebook':
        return 'from-blue-600 to-indigo-600';
      case 'instagram':
        return 'from-pink-500 to-rose-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-6 animate-fade-in relative">
      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col items-center space-y-4 border border-gray-100 max-w-sm mx-4 text-center">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-green-600" />
            <p className="text-base md:text-lg font-semibold text-gray-800">
              Loading coverage data...
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
            </p>
          </div>
        </div>
      )}

      {/* Header - Responsive */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl md:rounded-2xl p-5 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 rounded-full bg-white/10 transform translate-x-20 -translate-y-20 md:translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 md:w-48 md:h-48 rounded-full bg-white/5 transform -translate-x-16 translate-y-16 md:-translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 tracking-tight">
              Coverage by Region
            </h1>
            <p className="text-white text-base md:text-lg">
              Regional media coverage and social media analytics
            </p>
            {activePair && (
              <p className="text-white text-sm mt-1">
                Currently viewing: <strong>{activePair.base_company.company_name}</strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4">
              <Globe size={24} className="md:size-32 text-white" />
            </div>

            {socialData && (
              <div className="text-right">
                <div className="text-xs md:text-sm text-green-100">Countries Covered</div>
                <div className="text-xl md:text-2xl font-bold text-white">
                  {socialData.summary?.countries_covered || 0}
                </div>
                <div className="text-xs text-green-200">
                  {socialData.online_country_coverage?.total_coverage_records || 0} total records
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter */}
      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={resetFilters}
      />

      {/* Main content - stack on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 xl:gap-8">
        {/* Social Metrics & Charts - takes 3/4 width on xl */}
        <div className="xl:col-span-3 space-y-6 md:space-y-8">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-5">
              Social Media Metrics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {socialPlatforms.length === 0 ? (
                <div className="col-span-full text-center py-10 md:py-12 text-gray-500 bg-gray-50 rounded-xl text-sm md:text-base">
                  {hasValidDateRange 
                    ? 'No social media data available for this period' 
                    : 'Select a date range to view social media metrics'}
                </div>
              ) : (
                socialPlatforms.map((stat, index) => (
                  <Card 
                    key={index} 
                    className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className={`bg-gradient-to-br ${getPlatformColor(stat.platform)} p-4 md:p-5`}>
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2.5 md:gap-3">
                          <div className="bg-white/20 rounded-full p-2 md:p-2.5">
                            {getPlatformIcon(stat.platform)}
                          </div>
                          <h3 className="text-base md:text-lg font-bold capitalize">
                            {stat.platform}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <CardContent className="pt-4 md:pt-6 space-y-3 md:space-y-4 text-sm md:text-base">
                      {stat.totalPosts !== '0' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Posts</span>
                          <span className="font-bold">{stat.totalPosts}</span>
                        </div>
                      )}
                      {stat.followers !== '0' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Followers</span>
                          <span className="font-bold">{stat.followers}</span>
                        </div>
                      )}
                      {stat.following !== '0' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Following</span>
                          <span className="font-bold">{stat.following}</span>
                        </div>
                      )}
                      {stat.likes && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Page Likes</span>
                          <span className="font-bold">{parseInt(stat.likes).toLocaleString()}</span>
                        </div>
                      )}
                      {stat.avgLikes && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Likes/Post</span>
                          <span className="font-bold">{parseInt(stat.avgLikes).toLocaleString()}</span>
                        </div>
                      )}
                      {stat.avgComments && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Comments/Post</span>
                          <span className="font-bold">{parseInt(stat.avgComments).toLocaleString()}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Regional Coverage - full width on mobile */}
        <div className="xl:col-span-1">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 hover:shadow-xl transition-all duration-300 h-full">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2.5 md:gap-3">
                <div className="bg-gradient-to-br from-slate-600 to-gray-600 p-2 rounded-lg">
                  <MapPin size={18} className="md:size-20 text-white" />
                </div>
                Regional Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6">
              {regionalCoverage.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-gray-500 text-sm md:text-base">
                  {hasValidDateRange 
                    ? 'No regional coverage data available' 
                    : 'Select date range to view coverage'}
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                    <p className="text-sm md:text-base text-blue-800 font-medium text-center">
                      {socialData?.online_country_coverage?.unique_countries || 0}{' '}
                      {socialData?.online_country_coverage?.unique_countries === 1 ? 'Country' : 'Countries'} Covered
                    </p>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    {regionalCoverage.map((region, index) => (
                      <div 
                        key={index} 
                        className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                              {region.country}
                            </h4>
                            <p className="text-xs md:text-sm text-gray-600">
                              {region.count} mentions
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg md:text-2xl font-bold text-green-600">
                              {region.percentage}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}