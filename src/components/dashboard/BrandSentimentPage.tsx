import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { brandMediaSentimentData } from '@/utils/clientDashboardData';

interface SentimentItemProps {
  title: string;
  items: string[];
}

const SentimentItem: React.FC<SentimentItemProps> = ({ title, items }) => {
  const getBgColor = () => {
    switch (title.toLowerCase()) {
      case 'positive':
        return 'bg-green-500';
      case 'negative':
        return 'bg-red-500';
      case 'neutral':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="flex-1">
      <div className={`${getBgColor()} text-white p-3 font-semibold text-center`}>
        {title}
      </div>
      <div className="border border-t-0 p-4">
        <ul className="list-disc pl-5 space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-sm">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export function BrandSentimentPage() {
  // Sample sentiment distribution data
  const sentimentDistribution = [
    { value: 78, label: 'Strongly Positive', color: '#1dd1a1' },
    { value: 4, label: 'Neutral', color: '#c8d6e5' },
    { value: 8, label: 'Negative', color: '#576574' },
    { value: 10, label: 'Strongly Negative', color: '#ff6b6b' }
  ];

  // Sample brand reputation drivers
  const reputationDrivers = {
    positive: [
      "Nigeria's Private Sector Sees Strong Growth in A Year: Stanbic IBTC PMI Report",
      "Stanbic IBTC Bank Strengthens Private Banking Offerings to Empower Nigerians",
      "Stanbic IBTC Asset Management Partners with SIFAX Group to Develop Ultra-Modern Tera Terminal in Lagos",
      "NESG-Stanbic IBTC Business Confidence Monitor for February 2023",
      "Stanbic IBTC Holdings to pay shareholders N39.97 bn as dividend in 2024",
      "Stanbic IBTC reports N203.706 billion pre-tax profit in 2024",
      "Stanbic IBTC Pension Managers Renovates School, Boosts Education in Cross River"
    ],
    negative: [
      "Suit No: IBTC Legal Scandal: N50bn crisis threatens financial institution"
    ],
    neutral: [
      "Montepoint Clinches Access Stanbic IBTC, Poaches Top Talents",
      "Montepoint on hiring spree, hunts top talent in Access, Stanbic IBTC as it expands operations"
    ]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Brand Media Sentiment Distribution Matrix</h2>

      {/* Sentiment Distribution Bar */}
      <div className="mb-8">
        <div className="flex h-10 w-full rounded-sm overflow-hidden">
          {sentimentDistribution.map((segment, index) => (
            <div
              key={index}
              style={{
                width: `${segment.value}%`,
                backgroundColor: segment.color,
                position: 'relative'
              }}
              className="flex items-center justify-center text-white text-xs"
            >
              {segment.value > 5 && `${segment.value}%`}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4 text-xs text-gray-600">
          <div>0%</div>
          <div>20%</div>
          <div>40%</div>
          <div>60%</div>
          <div>80%</div>
        </div>

        <div className="flex justify-center mt-4 gap-4 text-xs">
          {sentimentDistribution.map((segment, index) => (
            <div key={index} className="flex items-center gap-1">
              <div
                className="w-3 h-3"
                style={{ backgroundColor: segment.color }}
              ></div>
              <span>{segment.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Brand Reputational Drivers */}
      <div>
        <h3 className="text-xl font-bold mb-4">Key Brand Reputational Drivers</h3>

        <div className="flex flex-col md:flex-row gap-4">
          <SentimentItem title="Positive" items={reputationDrivers.positive} />
          <SentimentItem title="Negative" items={reputationDrivers.negative} />
          <SentimentItem title="Neutral" items={reputationDrivers.neutral} />
        </div>
      </div>
    </div>
  );
}
