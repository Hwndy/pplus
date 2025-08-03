import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Search, Eye, ExternalLink, MoreHorizontal, Heart, MessageCircle, Share, TrendingUp } from "lucide-react";
import { socialMediaService, SocialMediaMention, SocialMediaSearchResult } from '@/services/socialMediaService';
import { format } from 'date-fns';

export default function SocialMediaMentionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SocialMediaSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await socialMediaService.searchSocialMedia({
        query: searchQuery.trim(),
        limit: 50
      });
      setSearchResults(results);
    } catch (err) {
      setError('Failed to fetch social media data. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-4 w-4 text-blue-400" />;
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'linkedin': return <Linkedin className="h-4 w-4 text-blue-700" />;
      case 'youtube': return <Youtube className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Social Media Mentions</h1>
      </div>

      {/* Search Form */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Search Social Media Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4 items-center">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Enter company name, handle, or social media URL"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading || !searchQuery.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Mentions</p>
                    <p className="text-2xl font-bold">{formatNumber(searchResults.totalMentions)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Engagement</p>
                    <p className="text-2xl font-bold">{formatNumber(searchResults.totalEngagement)}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Positive Sentiment</p>
                    <p className="text-2xl font-bold">{searchResults.sentimentBreakdown.positive}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">+</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Platforms</p>
                    <p className="text-2xl font-bold">{Object.keys(searchResults.platformBreakdown).length}</p>
                  </div>
                  <Share className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mentions Table */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Social Media Mentions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Sn.</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Reach</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.mentions.map((mention, index) => (
                      <TableRow key={mention.id}>
                        <TableCell className="font-medium text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(mention.platform)}
                            <span className="capitalize">{mention.platform}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{mention.author}</div>
                            <div className="text-sm text-muted-foreground">{mention.authorHandle}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatNumber(mention.authorFollowers)} followers
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="text-sm truncate" title={mention.content}>
                            {mention.content}
                          </div>
                          {mention.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {mention.hashtags.slice(0, 2).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {mention.hashtags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{mention.hashtags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(mention.publishedAt), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(mention.publishedAt), 'HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Heart className="h-3 w-3 text-red-500" />
                              {formatNumber(mention.engagement.likes)}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <MessageCircle className="h-3 w-3 text-blue-500" />
                              {formatNumber(mention.engagement.comments)}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Share className="h-3 w-3 text-green-500" />
                              {formatNumber(mention.engagement.shares)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`capitalize ${getSentimentColor(mention.sentiment)}`}
                          >
                            {mention.sentiment}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {formatNumber(mention.reach)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatNumber(mention.impressions)} imp.
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(mention.url, '_blank')}
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.open(mention.url, '_blank')}>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Post
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(mention.url)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Copy Link
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}