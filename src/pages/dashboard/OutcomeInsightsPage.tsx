
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OutcomeInsightForm } from '../../components/admin/OutcomeInsightForm';
import { Plus, Lightbulb, TrendingUp, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for outcome and insights
const insightsData = {
  date: new Date(),
  keyInsights: [
    {
      title: "Increased Social Media Engagement",
      description: "There was a 27% increase in social media engagement following the product launch campaign.",
      icon: TrendingUp
    },
    {
      title: "Media Coverage Sentiment",
      description: "92% of media coverage about the company's new initiative was positive or neutral.",
      icon: Lightbulb
    },
    {
      title: "Competitor Comparison",
      description: "The brand received 30% more mentions than its closest competitor in October.",
      icon: BarChart
    }
  ],
  performanceData: [
    { month: 'Jan', mediaValue: 4000, prValue: 2400 },
    { month: 'Feb', mediaValue: 3000, prValue: 1398 },
    { month: 'Mar', mediaValue: 2000, prValue: 9800 },
    { month: 'Apr', mediaValue: 2780, prValue: 3908 },
    { month: 'May', mediaValue: 1890, prValue: 4800 },
    { month: 'Jun', mediaValue: 2390, prValue: 3800 },
    { month: 'Jul', mediaValue: 3490, prValue: 4300 },
    { month: 'Aug', mediaValue: 3490, prValue: 4300 },
    { month: 'Sep', mediaValue: 4000, prValue: 2400 },
    { month: 'Oct', mediaValue: 5000, prValue: 6800 },
  ],
  recommendations: [
    "Increase presence on Twitter where engagement rates are highest",
    "Develop more industry thought leadership content as it drives the most earned media",
    "Focus on sustainability messaging which resonates most with the target audience"
  ]
};

export default function OutcomeInsightsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Outcome & Insights</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-950 hover:bg-indigo-900">
              <Plus className="h-4 w-4 mr-2" />
              Create Outcome
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Outcome & Insight</DialogTitle>
            </DialogHeader>
            <OutcomeInsightForm onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {insightsData.keyInsights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card key={index} className="border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="rounded-full p-4 bg-indigo-50 border border-indigo-200 dashed inline-flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-center">{insight.title}</h3>
                </div>
                <p className="text-gray-600 text-sm text-center">{insight.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={insightsData.performanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mediaValue" stroke="#8884d8" activeDot={{ r: 8 }} name="Media Value" />
                <Line type="monotone" dataKey="prValue" stroke="#82ca9d" name="PR Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {insightsData.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-400 mt-1.5 mr-2"></span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
