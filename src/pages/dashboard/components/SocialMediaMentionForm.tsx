import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

interface SocialMediaData {
  platform: string;
  handle: string;
  mentions: number;
  engagement: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

const mockSocialData: SocialMediaData[] = [
  { platform: 'Twitter', handle: '@companyA', mentions: 1250, engagement: 3200, sentiment: 'positive' },
  { platform: 'Facebook', handle: 'CompanyA', mentions: 850, engagement: 2100, sentiment: 'neutral' },
  { platform: 'LinkedIn', handle: 'company-a', mentions: 420, engagement: 1800, sentiment: 'positive' },
  { platform: 'Instagram', handle: '@companyA', mentions: 680, engagement: 4500, sentiment: 'positive' },
];

export function SocialMediaMentionForm() {
  const [socialHandle, setSocialHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [mentionsData, setMentionsData] = useState<SocialMediaData[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialHandle.trim()) return;
    fetchSocialMentions();
  };

  const fetchSocialMentions = () => {
    setLoading(true);
    setTimeout(() => {
      setMentionsData(mockSocialData);
      setLoading(false);
    }, 1000);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Twitter': return <Twitter className="h-6 w-6 text-blue-400" />;
      case 'Facebook': return <Facebook className="h-6 w-6 text-blue-600" />;
      case 'LinkedIn': return <Linkedin className="h-6 w-6 text-blue-700" />;
      case 'Instagram': return <Instagram className="h-6 w-6 text-pink-600" />;
      default: return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Enter social media handle or URL"
            value={socialHandle}
            onChange={(e) => setSocialHandle(e.target.value)}
            className="w-full"
          />
        </div>
        <Button 
          type="submit"
          className="bg-indigo-950 hover:bg-indigo-900 text-white"
          disabled={loading || !socialHandle.trim()}
        >
          {loading ? "Fetching..." : "Fetch Mentions"}
        </Button>
      </div>

      {mentionsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mentionsData.map((data, index) => (
            <Card key={index} className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {data.platform}
                </CardTitle>
                {getPlatformIcon(data.platform)}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Handle</p>
                    <p className="text-sm font-medium">{data.handle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mentions</p>
                    <p className="text-2xl font-bold">{data.mentions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                    <p className="text-lg font-semibold">{data.engagement}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sentiment</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      data.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      data.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {data.sentiment.charAt(0).toUpperCase() + data.sentiment.slice(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </form>
  );
}